create or replace function private.has_active_citizen_consent(p_user_id uuid,p_purpose text,p_case_id uuid default null)
returns boolean language sql stable security definer set search_path=public,private,pg_temp
as $$
  select exists (
    select 1
    from public.citizen_consents c
    join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version
    where c.user_id=p_user_id and c.purpose=p_purpose
      and c.case_id is not distinct from p_case_id
      and c.granted=true and c.revoked_at is null
      and c.captured_at > now() - interval '365 days'
      and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
      and (p_purpose <> 'cloud_workspace_sync' or c.scope->>'action_type' = 'workspace_sync')
  )
$$;;

create or replace function private.record_citizen_consent(
  p_case_id uuid,
  p_purpose text,
  p_policy_version text,
  p_granted boolean,
  p_scope jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_consent_id uuid;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if p_purpose not in ('profile_storage','document_storage','reminder_notifications','assisted_form_filling','external_portal_navigation','automated_submission') then raise exception 'invalid_consent_purpose'; end if;
  if p_policy_version is null or length(p_policy_version) not between 1 and 80 then raise exception 'invalid_policy_version'; end if;
  if p_scope is null or jsonb_typeof(p_scope) <> 'object' or octet_length(p_scope::text) > 4096 then raise exception 'invalid_consent_scope'; end if;
  if p_case_id is not null and not exists (select 1 from public.application_cases where id = p_case_id and user_id = v_user) then raise exception 'case_not_found' using errcode = 'P0002'; end if;

  insert into public.citizen_consents(user_id, case_id, purpose, policy_version, granted, revoked_at, scope)
  values (v_user, p_case_id, p_purpose, p_policy_version, p_granted, case when p_granted then null else now() end, p_scope)
  returning id into v_consent_id;

  if p_case_id is not null then
    insert into public.application_events(case_id, actor_id, event_type, details)
    values (p_case_id, v_user, case when p_granted then 'consent_granted' else 'consent_revoked' end,
      jsonb_build_object('purpose', p_purpose, 'policy_version', p_policy_version, 'consent_id', v_consent_id));
  end if;
  return v_consent_id;
end;
$$;;;

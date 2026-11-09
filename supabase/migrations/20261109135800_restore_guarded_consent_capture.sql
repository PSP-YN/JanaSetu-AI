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
  if p_purpose not in ('profile_storage','cloud_workspace_sync','document_storage','reminder_notifications','assisted_form_filling','external_portal_navigation','automated_submission') then raise exception 'invalid_consent_purpose'; end if;
  if p_policy_version is null or length(p_policy_version) not between 1 and 80 then raise exception 'invalid_policy_version'; end if;
  if p_scope is null or jsonb_typeof(p_scope) <> 'object' or octet_length(p_scope::text) > 4096 then raise exception 'invalid_consent_scope'; end if;
  if p_case_id is not null and not exists (select 1 from public.application_cases where id = p_case_id and user_id = v_user) then raise exception 'case_not_found' using errcode = 'P0002'; end if;

  if p_purpose = 'cloud_workspace_sync' and (p_case_id is not null or p_scope->>'action_type' is distinct from 'workspace_sync') then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'profile_storage' and (p_case_id is not null or p_scope->>'action_type' is distinct from 'create_application_case' or nullif(p_scope->>'scheme_version_id','') is null) then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'document_storage' and p_case_id is null then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'reminder_notifications' and (p_case_id is null or p_scope->>'action_type' is distinct from 'schedule_reminder' or nullif(p_scope->>'scheme_version_id','') is null) then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'assisted_form_filling' and (p_case_id is null or coalesce(p_scope->>'action_type','') not in ('prepare_documents','assist_form_filling') or nullif(p_scope->>'scheme_version_id','') is null) then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'external_portal_navigation' and (p_case_id is null or coalesce(p_scope->>'action_type','') not in ('open_official_portal','check_application_status') or nullif(p_scope->>'scheme_version_id','') is null or nullif(p_scope->>'destination_url','') is null) then raise exception 'consent_scope_mismatch'; end if;
  if p_purpose = 'automated_submission' and (p_case_id is null or p_scope->>'action_type' is distinct from 'submit_application' or nullif(p_scope->>'scheme_version_id','') is null or nullif(p_scope->>'destination_url','') is null) then raise exception 'consent_scope_mismatch'; end if;

  if p_granted and not exists (
    select 1 from private.consent_policy_versions
    where purpose = p_purpose and version = p_policy_version and active = true
      and approved_at is not null and legal_review_reference is not null
  ) then raise exception 'consent_policy_not_approved'; end if;

  if not p_granted then
    update public.citizen_consents set revoked_at = now()
    where user_id = v_user and case_id is not distinct from p_case_id
      and purpose = p_purpose and granted = true and revoked_at is null;
  end if;

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
$$;

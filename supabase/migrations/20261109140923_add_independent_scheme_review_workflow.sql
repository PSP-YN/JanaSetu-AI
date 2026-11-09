-- Independent scheme-review workflow with role separation and publication control.
create table if not exists private.scheme_reviewer_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('source_reviewer','rules_reviewer','legal_reviewer','translation_reviewer','scheme_publisher')),
  active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key(user_id,role)
);
revoke all on private.scheme_reviewer_roles from public,anon,authenticated,service_role;

create or replace function private.create_application_case(
  p_scheme_slug text,
  p_profile_snapshot jsonb,
  p_idempotency_key text,
  p_consent_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_scheme_id uuid;
  v_version_id uuid;
  v_case_id uuid;
  v_existing_version uuid;
  v_consent public.citizen_consents%rowtype;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if p_scheme_slug is null or length(p_scheme_slug) > 120 then raise exception 'invalid_scheme'; end if;
  if jsonb_typeof(p_profile_snapshot) <> 'object' or octet_length(p_profile_snapshot::text) > 32768 then raise exception 'invalid_profile_snapshot'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 or length(p_idempotency_key) > 120 then raise exception 'invalid_idempotency_key'; end if;

  select id, current_version_id into v_scheme_id, v_version_id
  from public.schemes
  where slug = p_scheme_slug and publication_status = 'published'
    and current_version_id is not null;

  if v_version_id is null then raise exception 'scheme_not_published_or_approved'; end if;

  if not exists (
    select 1 from public.scheme_versions sv
    where sv.id = v_version_id and sv.scheme_id = v_scheme_id
      and sv.verification_status = 'independently_approved'
      and (sv.effective_from is null or sv.effective_from <= current_date)
      and (sv.effective_to is null or sv.effective_to >= current_date)
      and (
        select count(distinct reviewer_id) from public.scheme_approvals
        where scheme_version_id = sv.id and approval_type = 'source_accuracy' and decision = 'approved'
      ) >= 2
      and (
        select count(distinct reviewer_id) from public.scheme_approvals
        where scheme_version_id = sv.id and approval_type = 'eligibility_rule_accuracy' and decision = 'approved'
      ) >= 2
      and (
        select count(distinct reviewer_id) from public.scheme_approvals
        where scheme_version_id = sv.id and approval_type = 'legal_review' and decision = 'approved'
      ) >= 1
      and not exists (
        select 1 from public.scheme_approvals
        where scheme_version_id = sv.id and decision in ('rejected','changes_requested')
      )
  ) then raise exception 'scheme_not_published_or_approved'; end if;

  select * into v_consent from public.citizen_consents
  where id = p_consent_id and user_id = v_user and case_id is null
    and purpose = 'profile_storage' and granted = true and revoked_at is null
    and captured_at > now() - interval '365 days';
  if not found then raise exception 'profile_storage_consent_required'; end if;
  if not exists (select 1 from private.consent_policy_versions where purpose = v_consent.purpose and version = v_consent.policy_version and active = true and approved_at is not null and legal_review_reference is not null) then raise exception 'consent_policy_not_approved'; end if;
  if v_consent.scope->>'action_type' is distinct from 'create_application_case'
     or v_consent.scope->>'scheme_version_id' is distinct from v_version_id::text then
    raise exception 'consent_scope_mismatch';
  end if;

  select id, scheme_version_id into v_case_id, v_existing_version
  from public.application_cases
  where user_id = v_user and idempotency_key = p_idempotency_key;
  if v_case_id is not null then
    if v_existing_version <> v_version_id then raise exception 'idempotency_key_reused'; end if;
    return v_case_id;
  end if;

  insert into public.application_cases(user_id, scheme_version_id, profile_snapshot, idempotency_key)
  values (v_user, v_version_id, p_profile_snapshot, p_idempotency_key)
  returning id into v_case_id;

  insert into public.application_events(case_id, actor_id, event_type, details)
  values (v_case_id, v_user, 'created', jsonb_build_object('scheme_version_id', v_version_id, 'source', 'citizen_workspace'));
  return v_case_id;
end;
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
$$;;

create or replace function private.request_automation_run(
  p_case_id uuid,
  p_action_type text,
  p_consent_id uuid,
  p_idempotency_key text,
  p_requested_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_case public.application_cases%rowtype;
  v_consent public.citizen_consents%rowtype;
  v_run_id uuid;
  v_existing public.automation_runs%rowtype;
  v_purpose text;
  v_integration public.scheme_integrations%rowtype;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if p_action_type not in ('prepare_documents','open_official_portal','assist_form_filling','submit_application','check_application_status','schedule_reminder') then raise exception 'invalid_action_type'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 or length(p_idempotency_key) > 120 then raise exception 'invalid_idempotency_key'; end if;
  if p_requested_payload is null or jsonb_typeof(p_requested_payload) <> 'object' or octet_length(p_requested_payload::text) > 16384 then raise exception 'invalid_requested_payload'; end if;

  select * into v_case from public.application_cases where id = p_case_id and user_id = v_user;
  if not found or v_case.status in ('closed','cancelled','submitted_externally','decision_received') then raise exception 'case_not_available'; end if;

  v_purpose := case
    when p_action_type = 'schedule_reminder' then 'reminder_notifications'
    when p_action_type in ('open_official_portal','check_application_status') then 'external_portal_navigation'
    when p_action_type = 'submit_application' then 'automated_submission'
    else 'assisted_form_filling'
  end;

  select * into v_consent from public.citizen_consents
  where id = p_consent_id and user_id = v_user and case_id = p_case_id
    and purpose = v_purpose and granted = true and revoked_at is null
    and captured_at > now() - interval '365 days';
  if not found then raise exception 'valid_purpose_specific_consent_required'; end if;

  if p_action_type in ('open_official_portal','assist_form_filling','submit_application','check_application_status') then
    select * into v_integration from public.scheme_integrations
    where scheme_version_id = v_case.scheme_version_id and access_status = 'production_approved'
      and p_action_type = any(allowed_actions)
      and (expires_at is null or expires_at > now())
      and authorization_reference is not null and approved_at is not null;
    if not found then raise exception 'government_adapter_not_authorized'; end if;
    if v_consent.scope->>'destination_url' is distinct from v_integration.application_url
       or v_consent.scope->>'scheme_version_id' is distinct from v_case.scheme_version_id::text then
      raise exception 'consent_destination_or_scheme_mismatch';
    end if;
  end if;

  select * into v_existing from public.automation_runs
  where user_id = v_user and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.case_id <> p_case_id or v_existing.action_type <> p_action_type then raise exception 'idempotency_key_reused'; end if;
    return v_existing.id;
  end if;

  insert into public.automation_runs(user_id, case_id, action_type, status, idempotency_key, consent_id, requested_payload, requires_human_confirmation)
  values (v_user, p_case_id, p_action_type, 'awaiting_confirmation', p_idempotency_key, p_consent_id, p_requested_payload, true)
  returning id into v_run_id;

  insert into public.application_events(case_id, actor_id, event_type, details)
  values (p_case_id, v_user, 'automation_requested', jsonb_build_object('run_id', v_run_id, 'action_type', p_action_type));
  return v_run_id;
end;
$$;;

create or replace function private.confirm_automation_run(p_run_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_run public.automation_runs%rowtype;
  v_consent public.citizen_consents%rowtype;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into v_run from public.automation_runs where id = p_run_id and user_id = v_user for update;
  if not found or v_run.status <> 'awaiting_confirmation' then raise exception 'automation_run_not_confirmable'; end if;
  if v_run.expires_at <= now() then
    update public.automation_runs set status = 'expired', completed_at = now() where id = p_run_id;
    raise exception 'automation_run_expired';
  end if;
  select * into v_consent from public.citizen_consents
  where id = v_run.consent_id and user_id = v_user and case_id = v_run.case_id
    and granted = true and revoked_at is null and captured_at > now() - interval '365 days';
  if not found then raise exception 'consent_missing_or_revoked'; end if;
  if v_run.action_type not in ('prepare_documents','schedule_reminder') then
    raise exception 'government_adapter_execution_not_enabled';
  end if;

  update public.automation_runs set status = 'queued', confirmation_at = now() where id = p_run_id;
  perform pgmq.send('janasetu_automation', jsonb_build_object('run_id', p_run_id));
  insert into public.application_events(case_id, actor_id, event_type, details)
  values (v_run.case_id, v_user, 'automation_confirmed', jsonb_build_object('run_id', p_run_id, 'action_type', v_run.action_type));
  return p_run_id;
end;
$$;;;

create or replace function private.get_scheme_review_queue()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_result jsonb;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from private.scheme_reviewer_roles where user_id=v_user and active=true) then raise exception 'reviewer_access_required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'scheme_version_id',sv.id,'scheme_id',s.id,'slug',s.slug,'name',s.name,
    'publication_status',s.publication_status,'version_number',sv.version_number,
    'verification_status',sv.verification_status,'content',sv.content,
    'rule_set',sv.rule_set,'content_sha256',sv.content_sha256,
    'source',jsonb_build_object('publisher',ss.publisher,'source_url',ss.source_url,'source_type',ss.source_type,'last_checked_at',ss.last_checked_at,'source_revision',ss.source_revision,'access_notes',ss.access_notes),
    'approvals',(select coalesce(jsonb_agg(jsonb_build_object('reviewer_id',a.reviewer_id,'approval_type',a.approval_type,'decision',a.decision,'notes',a.notes,'created_at',a.created_at)),'[]'::jsonb) from public.scheme_approvals a where a.scheme_version_id=sv.id)
  ) order by s.name),'[]'::jsonb)
  into v_result
  from public.schemes s
  join public.scheme_versions sv on sv.id=s.current_version_id
  join public.scheme_sources ss on ss.id=sv.source_id
  where s.publication_status in ('draft','review_pending');
  return v_result;
end;
$$;
revoke all on function private.get_scheme_review_queue() from public,anon,service_role;
grant execute on function private.get_scheme_review_queue() to authenticated;

create or replace function private.submit_scheme_review(
  p_scheme_version_id uuid,p_approval_type text,p_decision text,p_notes text
) returns uuid
language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_role text; v_approval_id uuid; v_source_count integer; v_rule_count integer; v_legal_count integer;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  v_role:=case p_approval_type when 'source_accuracy' then 'source_reviewer' when 'eligibility_rule_accuracy' then 'rules_reviewer' when 'legal_review' then 'legal_reviewer' when 'translation_quality' then 'translation_reviewer' else null end;
  if v_role is null or p_decision not in ('approved','rejected','changes_requested') then raise exception 'invalid_review_decision'; end if;
  if p_notes is null or length(trim(p_notes)) < 20 or length(p_notes) > 4000 then raise exception 'review_notes_required'; end if;
  if not exists(select 1 from private.scheme_reviewer_roles where user_id=v_user and role=v_role and active=true) then raise exception 'reviewer_role_required' using errcode='42501'; end if;
  if not exists(select 1 from public.scheme_versions sv join public.schemes s on s.id=sv.scheme_id where sv.id=p_scheme_version_id and s.publication_status in ('draft','review_pending')) then raise exception 'scheme_version_not_reviewable'; end if;

  insert into public.scheme_approvals(scheme_version_id,reviewer_id,approval_type,decision,notes)
  values(p_scheme_version_id,v_user,p_approval_type,p_decision,trim(p_notes))
  returning id into v_approval_id;

  select count(distinct reviewer_id) filter(where approval_type='source_accuracy' and decision='approved'),
         count(distinct reviewer_id) filter(where approval_type='eligibility_rule_accuracy' and decision='approved'),
         count(distinct reviewer_id) filter(where approval_type='legal_review' and decision='approved')
  into v_source_count,v_rule_count,v_legal_count
  from public.scheme_approvals where scheme_version_id=p_scheme_version_id;

  if exists(select 1 from public.scheme_approvals where scheme_version_id=p_scheme_version_id and decision in ('rejected','changes_requested')) then
    update public.scheme_versions set verification_status='stale' where id=p_scheme_version_id;
  elsif v_source_count>=2 and v_rule_count>=2 and v_legal_count>=1 then
    update public.scheme_versions set verification_status='independently_approved',reviewed_at=now() where id=p_scheme_version_id;
  elsif v_source_count>=2 and v_rule_count>=2 then
    update public.scheme_versions set verification_status='rule_checked',reviewed_at=now() where id=p_scheme_version_id;
  elsif v_source_count>=2 then
    update public.scheme_versions set verification_status='source_checked',reviewed_at=now() where id=p_scheme_version_id;
  end if;
  return v_approval_id;
end;
$$;
revoke all on function private.submit_scheme_review(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.submit_scheme_review(uuid,text,text,text) to authenticated;

create or replace function private.publish_scheme_version(p_scheme_version_id uuid)
returns uuid language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_scheme_id uuid;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from private.scheme_reviewer_roles where user_id=v_user and role='scheme_publisher' and active=true) then raise exception 'publisher_role_required' using errcode='42501'; end if;
  select sv.scheme_id into v_scheme_id from public.scheme_versions sv
  where sv.id=p_scheme_version_id and sv.verification_status='independently_approved'
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='source_accuracy' and decision='approved')>=2
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='eligibility_rule_accuracy' and decision='approved')>=2
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='legal_review' and decision='approved')>=1
    and not exists(select 1 from public.scheme_approvals where scheme_version_id=sv.id and decision in ('rejected','changes_requested'));
  if v_scheme_id is null then raise exception 'scheme_not_ready_for_publication'; end if;
  update public.schemes set current_version_id=p_scheme_version_id,publication_status='published',updated_at=now() where id=v_scheme_id;
  return v_scheme_id;
end;
$$;
revoke all on function private.publish_scheme_version(uuid) from public,anon,service_role;
grant execute on function private.publish_scheme_version(uuid) to authenticated;

create or replace function public.get_scheme_review_queue()
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.get_scheme_review_queue() $$;
create or replace function public.submit_scheme_review(p_scheme_version_id uuid,p_approval_type text,p_decision text,p_notes text)
returns uuid language sql security invoker set search_path=public,private,pg_temp
as $$ select private.submit_scheme_review(p_scheme_version_id,p_approval_type,p_decision,p_notes) $$;
create or replace function public.publish_scheme_version(p_scheme_version_id uuid)
returns uuid language sql security invoker set search_path=public,private,pg_temp
as $$ select private.publish_scheme_version(p_scheme_version_id) $$;
revoke all on function public.get_scheme_review_queue() from public,anon;
revoke all on function public.submit_scheme_review(uuid,text,text,text) from public,anon;
revoke all on function public.publish_scheme_version(uuid) from public,anon;
grant execute on function public.get_scheme_review_queue() to authenticated;
grant execute on function public.submit_scheme_review(uuid,text,text,text) to authenticated;
grant execute on function public.publish_scheme_version(uuid) to authenticated;

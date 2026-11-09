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
$$;;

revoke all on function private.create_application_case(text,jsonb,text) from public, anon, service_role;

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
  if v_consent.scope->>'action_type' is distinct from p_action_type
     or v_consent.scope->>'scheme_version_id' is distinct from v_case.scheme_version_id::text then
    raise exception 'consent_scope_mismatch';
  end if;

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
$$;;

revoke all on function private.create_application_case(text,jsonb,text) from public, anon, service_role;
revoke all on function private.record_citizen_consent(uuid,text,text,boolean,jsonb) from public, anon, service_role;

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
  if v_consent.scope->>'action_type' is distinct from v_run.action_type
     or v_consent.scope->>'scheme_version_id' is distinct from (select scheme_version_id::text from public.application_cases where id = v_run.case_id) then
    raise exception 'consent_scope_mismatch';
  end if;
  if v_run.action_type not in ('prepare_documents','schedule_reminder') then
    raise exception 'government_adapter_execution_not_enabled';
  end if;

  update public.automation_runs set status = 'queued', confirmation_at = now() where id = p_run_id;
  perform pgmq.send('janasetu_automation', jsonb_build_object('run_id', p_run_id));
  insert into public.application_events(case_id, actor_id, event_type, details)
  values (v_run.case_id, v_user, 'automation_confirmed', jsonb_build_object('run_id', p_run_id, 'action_type', v_run.action_type));
  return p_run_id;
end;
$$;;

revoke all on function private.create_application_case(text,jsonb,text) from public, anon, service_role;
revoke all on function private.record_citizen_consent(uuid,text,text,boolean,jsonb) from public, anon, service_role;
revoke all on function private.request_automation_run(uuid,text,uuid,text,jsonb) from public, anon, service_role;;

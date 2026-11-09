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
    return p_run_id;
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
revoke all on function private.request_automation_run(uuid,text,uuid,text,jsonb) from public, anon, service_role;;

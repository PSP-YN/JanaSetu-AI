create or replace function private.put_encrypted_workspace(p_vault jsonb, p_expected_revision bigint)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_user uuid := auth.uid(); v_revision bigint; v_updated_at timestamptz;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if not private.has_active_citizen_consent(v_user, 'cloud_workspace_sync', null) then raise exception 'profile_storage_consent_required' using errcode = '42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then raise exception 'invalid_workspace_revision'; end if;
  if p_vault is null or jsonb_typeof(p_vault) <> 'object'
     or (select count(*) from jsonb_object_keys(p_vault)) <> 8
     or exists (select 1 from jsonb_object_keys(p_vault) as k(name) where k.name not in ('magic','version','kdf','iterations','cipher','salt','iv','ciphertext'))
     or p_vault->>'magic' <> 'JANASETU-VAULT' or p_vault->>'version' <> '1'
     or p_vault->>'kdf' <> 'PBKDF2-SHA-256' or p_vault->>'iterations' <> '600000'
     or p_vault->>'cipher' <> 'AES-256-GCM'
     or p_vault->>'salt' !~ '^[A-Za-z0-9+/]{22}==$'
     or p_vault->>'iv' !~ '^[A-Za-z0-9+/]{16}$'
     or p_vault->>'ciphertext' !~ '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
     or octet_length(decode(p_vault->>'salt','base64')) <> 16
     or octet_length(decode(p_vault->>'iv','base64')) <> 12
     or octet_length(decode(p_vault->>'ciphertext','base64')) < 16
     or octet_length(decode(p_vault->>'ciphertext','base64')) > 6291456
     or octet_length(p_vault::text) > 8388608 then
    raise exception 'invalid_encrypted_workspace_envelope';
  end if;
  if p_expected_revision = 0 then
    insert into public.citizen_workspaces(user_id,profile_data,preferred_language,application_drafts,document_refs,reminders,assessments,updated_at,encrypted_workspace_revision)
    values(v_user,jsonb_build_object('encrypted_workspace_v1',p_vault),'en','[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,now(),1)
    on conflict(user_id) do nothing returning encrypted_workspace_revision,updated_at into v_revision,v_updated_at;
    if v_revision is null then raise exception 'workspace_revision_conflict' using errcode='40001'; end if;
  else
    update public.citizen_workspaces
       set profile_data=jsonb_build_object('encrypted_workspace_v1',p_vault), preferred_language='en',
           application_drafts='[]'::jsonb,document_refs='[]'::jsonb,reminders='[]'::jsonb,assessments='[]'::jsonb,
           encrypted_workspace_revision=encrypted_workspace_revision+1,updated_at=now()
     where user_id=v_user and encrypted_workspace_revision=p_expected_revision
     returning encrypted_workspace_revision,updated_at into v_revision,v_updated_at;
    if v_revision is null then raise exception 'workspace_revision_conflict' using errcode='40001'; end if;
  end if;
  return jsonb_build_object('revision',v_revision,'updated_at',v_updated_at);
end;
$$;
revoke all on function private.put_encrypted_workspace(jsonb,bigint) from public,anon;
grant execute on function private.put_encrypted_workspace(jsonb,bigint) to authenticated;

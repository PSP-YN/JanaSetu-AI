create or replace function private.get_workspace_sync_status()
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_user uuid := auth.uid(); v_policy jsonb; v_draft text; v_consented boolean;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select jsonb_build_object('version',version,'content_sha256',content_sha256,'approved_at',approved_at,'legal_review_reference',legal_review_reference)
    into v_policy
  from private.consent_policy_versions
  where purpose='cloud_workspace_sync' and active=true and approved_at is not null and legal_review_reference is not null
  order by approved_at desc limit 1;
  select version into v_draft from private.consent_policy_versions
  where purpose='cloud_workspace_sync' and active=false and approved_at is null
  order by created_at desc limit 1;
  v_consented := private.has_active_citizen_consent(v_user,'cloud_workspace_sync',null);
  return jsonb_build_object('available',v_policy is not null,'policy',v_policy,'consented',v_consented,'draft_version',v_draft);
end;
$$;

create or replace function public.get_workspace_sync_status()
returns jsonb
language sql
security invoker
set search_path=public,private,pg_temp
as $$ select private.get_workspace_sync_status() $$;

revoke all on function private.get_workspace_sync_status() from public,anon;
grant execute on function private.get_workspace_sync_status() to authenticated;
revoke all on function public.get_workspace_sync_status() from public,anon;
grant execute on function public.get_workspace_sync_status() to authenticated;

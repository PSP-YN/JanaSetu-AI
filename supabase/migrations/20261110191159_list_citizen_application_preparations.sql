create or replace function private.list_application_preparations()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_items jsonb;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'case_id',p.case_id,'status',p.status,'fields',p.prepared_fields,'documents',p.required_documents,
    'citizen_approved_at',p.citizen_approved_at,'updated_at',p.updated_at
  ) order by p.updated_at desc),'[]'::jsonb)
  into v_items
  from private.application_preparations p
  where p.user_id=v_user and exists(
    select 1 from public.citizen_consents c
    join private.consent_policy_versions policy on policy.purpose=c.purpose and policy.version=c.policy_version
      and policy.active=true and policy.approved_at is not null and policy.legal_review_reference is not null
    where c.user_id=v_user and c.case_id is null and c.purpose='profile_storage'
      and c.granted=true and c.revoked_at is null and c.captured_at>now()-interval '365 days'
      and c.scope->>'action_type'='create_application_case'
      and c.scope->>'scheme_version_id'=p.scheme_version_id::text
  );
  return v_items;
end;
$$;
revoke all on function private.list_application_preparations() from public,anon,service_role;
grant execute on function private.list_application_preparations() to authenticated;
create or replace function public.list_application_preparations()
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.list_application_preparations() $$;
revoke all on function public.list_application_preparations() from public,anon;
grant execute on function public.list_application_preparations() to authenticated;

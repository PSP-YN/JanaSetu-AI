create or replace function private.get_citizen_document_download(p_document_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype; v_case public.application_cases%rowtype;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select d.* into v_doc
  from private.citizen_documents d
  join public.application_cases a on a.id=d.case_id and a.user_id=d.user_id
  where d.id=p_document_id and d.user_id=v_user and d.scan_status='clean';
  if not found then raise exception 'document_not_available' using errcode='P0002'; end if;
  select * into v_case from public.application_cases where id=v_doc.case_id and user_id=v_user;
  if not exists(
    select 1 from public.citizen_consents c
    join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version
      and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
    where c.id=v_doc.consent_id and c.user_id=v_user and c.case_id=v_doc.case_id
      and c.purpose='document_storage' and c.granted=true and c.revoked_at is null
      and c.captured_at>now()-interval '365 days'
      and c.scope->>'action_type'='upload_document'
      and c.scope->>'scheme_version_id'=v_case.scheme_version_id::text
  ) then raise exception 'document_consent_required' using errcode='42501'; end if;
  return jsonb_build_object(
    'document_id',v_doc.id,'object_name',v_doc.storage_object_name,
    'filename',v_doc.original_filename,'mime_type',v_doc.mime_type,'size',v_doc.expected_size
  );
end;
$$;
revoke all on function private.get_citizen_document_download(uuid) from public,anon,service_role;
grant execute on function private.get_citizen_document_download(uuid) to authenticated;

create or replace function public.get_citizen_document_download(p_document_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.get_citizen_document_download(p_document_id) $$;
revoke all on function public.get_citizen_document_download(uuid) from public,anon;
grant execute on function public.get_citizen_document_download(uuid) to authenticated;

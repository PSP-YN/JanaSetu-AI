-- Storage object reads must enforce the same exact consent and scope as the
-- application download API. A revoked or expired consent must not be bypassed
-- by calling the Supabase Storage endpoint directly with a known object path.
create or replace function private.can_read_citizen_document(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
   select 1
   from private.citizen_documents d
   join public.application_cases a on a.id=d.case_id and a.user_id=d.user_id
   join public.citizen_consents c on c.id=d.consent_id
   join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version
   where d.storage_object_name=p_object_name
     and d.user_id=auth.uid()
     and d.scan_status='clean'
     and c.user_id=d.user_id
     and c.case_id=d.case_id
     and c.purpose='document_storage'
     and c.granted=true
     and c.revoked_at is null
     and c.captured_at>now()-interval '365 days'
     and c.scope->>'action_type'='upload_document'
     and c.scope->>'scheme_version_id'=a.scheme_version_id::text
     and p.active=true
     and p.approved_at is not null
     and p.legal_review_reference is not null
     and private.has_active_citizen_consent(d.user_id,'document_storage',d.case_id)
 );
$body$;
revoke all on function private.can_read_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_read_citizen_document(text) to authenticated;

-- The API's metadata lookup must also respect later revocation records, not
-- merely the consent row captured at upload time.
create or replace function private.get_citizen_document_download(p_document_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $body$
declare
  v_user uuid:=auth.uid();
  v_doc private.citizen_documents%rowtype;
  v_case public.application_cases%rowtype;
  v_consent public.citizen_consents%rowtype;
begin
  if v_user is null then
    raise exception 'authentication_required' using errcode='42501';
  end if;

  select d.* into v_doc
  from private.citizen_documents d
  join public.application_cases a on a.id=d.case_id and a.user_id=d.user_id
  where d.id=p_document_id
    and d.user_id=v_user
    and d.scan_status='clean';

  if not found then
    raise exception 'document_not_available' using errcode='P0002';
  end if;

  select * into v_case
  from public.application_cases
  where id=v_doc.case_id and user_id=v_user;

  select * into v_consent
  from public.citizen_consents
  where id=v_doc.consent_id
    and user_id=v_user
    and case_id=v_doc.case_id
    and purpose='document_storage'
    and granted=true
    and revoked_at is null
    and captured_at>now()-interval '365 days'
    and scope->>'action_type'='upload_document'
    and scope->>'scheme_version_id'=v_case.scheme_version_id::text;

  if not found
     or not private.has_active_citizen_consent(v_user,'document_storage',v_doc.case_id)
     or not exists(
       select 1
       from private.consent_policy_versions p
       where p.purpose='document_storage'
         and p.version=v_consent.policy_version
         and p.active=true
         and p.approved_at is not null
         and p.legal_review_reference is not null
     ) then
    raise exception 'document_consent_required' using errcode='42501';
  end if;

  return jsonb_build_object(
    'document_id',v_doc.id,
    'object_name',v_doc.storage_object_name,
    'filename',v_doc.original_filename,
    'mime_type',v_doc.mime_type,
    'size',v_doc.expected_size
  );
end;
$body$;
revoke all on function private.get_citizen_document_download(uuid) from public,anon,service_role;
grant execute on function private.get_citizen_document_download(uuid) to authenticated;

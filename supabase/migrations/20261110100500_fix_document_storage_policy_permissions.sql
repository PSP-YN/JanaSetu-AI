-- Run storage policy checks through narrowly scoped SECURITY DEFINER predicates.
drop trigger if exists citizen_document_no_unscanned_delete on storage.objects;
drop function if exists private.prevent_unscanned_document_download();

create or replace function private.can_upload_citizen_document(p_object_name text)
returns boolean language sql stable security definer set search_path=public,private,storage,pg_temp
as $$
 select exists(
   select 1 from private.citizen_documents d
   join public.citizen_consents c on c.id=d.consent_id
   join public.application_cases a on a.id=d.case_id and a.user_id=d.user_id
   join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
   where d.storage_object_name=p_object_name and d.user_id=auth.uid()
     and d.scan_status='awaiting_upload' and c.user_id=auth.uid() and c.granted=true and c.revoked_at is null
     and c.purpose='document_storage' and c.captured_at>now()-interval '365 days'
     and c.scope->>'action_type'='upload_document' and c.scope->>'scheme_version_id'=a.scheme_version_id::text
 );
$$;
create or replace function private.can_read_citizen_document(p_object_name text)
returns boolean language sql stable security definer set search_path=public,private,pg_temp
as $$
 select exists(select 1 from private.citizen_documents d where d.storage_object_name=p_object_name and d.user_id=auth.uid() and d.scan_status='clean');
$$;
revoke all on function private.can_upload_citizen_document(text) from public,anon,service_role;
revoke all on function private.can_read_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_upload_citizen_document(text) to authenticated;
grant execute on function private.can_read_citizen_document(text) to authenticated;

drop policy if exists citizen_documents_upload_with_consent on storage.objects;
create policy citizen_documents_upload_with_consent on storage.objects for insert to authenticated
with check (bucket_id='citizen-documents' and (storage.foldername(name))[1]=auth.uid()::text and private.can_upload_citizen_document(name));

drop policy if exists citizen_documents_read_own on storage.objects;
create policy citizen_documents_read_own on storage.objects for select to authenticated
using (bucket_id='citizen-documents' and (storage.foldername(name))[1]=auth.uid()::text and private.can_read_citizen_document(name));

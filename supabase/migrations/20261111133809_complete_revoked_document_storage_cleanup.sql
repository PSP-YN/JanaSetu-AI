create or replace function private.complete_revoked_document_cleanup(p_document_id uuid,p_object_name text)
returns uuid language plpgsql security definer
set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(
  select 1 from private.document_scanner_roles where user_id=v_user and active=true
 ) then raise exception 'scanner_role_required' using errcode='42501'; end if;
 select * into v_doc from private.citizen_documents where id=p_document_id for update;
 if not found or v_doc.storage_object_name<>p_object_name
    or v_doc.scan_status<>'deleting' or v_doc.scanner_user_id is distinct from v_user
    or private.has_active_document_storage_consent(v_doc.user_id,v_doc.case_id,v_doc.consent_id) then
  raise exception 'document_cleanup_not_authorized' using errcode='42501';
 end if;
 if exists(select 1 from storage.objects where bucket_id='citizen-documents' and name=p_object_name) then
  raise exception 'storage_object_still_exists';
 end if;
 delete from private.citizen_documents where id=p_document_id;
 return p_document_id;
end;
$body$;
revoke all on function private.complete_revoked_document_cleanup(uuid,text) from public,anon,service_role;
grant execute on function private.complete_revoked_document_cleanup(uuid,text) to authenticated;

create or replace function public.complete_revoked_document_cleanup(p_document_id uuid,p_object_name text)
returns uuid language sql security definer set search_path=public,private,pg_temp
as $body$ select private.complete_revoked_document_cleanup(p_document_id,p_object_name); $body$;
revoke all on function public.complete_revoked_document_cleanup(uuid,text) from public,anon,service_role;
grant execute on function public.complete_revoked_document_cleanup(uuid,text) to authenticated;

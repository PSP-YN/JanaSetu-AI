-- Scanner identities may read only the exact object they currently hold under
-- an atomic database lease. They cannot enumerate or download another worker's
-- queued, failed, or completed documents.
create or replace function private.can_scan_citizen_document(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
   select 1
   from private.citizen_documents d
   join private.document_scanner_roles r
     on r.user_id=auth.uid() and r.active=true
   where d.storage_object_name=p_object_name
     and d.scan_status='scanning'
     and d.scanner_user_id=auth.uid()
 );
$body$;
revoke all on function private.can_scan_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_scan_citizen_document(text) to authenticated;

-- The database accepts only a SHA-256 content digest and a ClamAV engine
-- identity for an attestation. A worker still needs a live claim for the row.
create or replace function private.attest_document_scan(
 p_document_id uuid,p_result text,p_engine text,p_signature text
)
returns uuid
language plpgsql
security definer
set search_path=public,private,pg_temp
as $body$
declare
 v_user uuid:=auth.uid();
 v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(
   select 1 from private.document_scanner_roles
   where user_id=v_user and active=true
 ) then
   raise exception 'scanner_role_required' using errcode='42501';
 end if;

 if p_result not in ('clean','rejected','scan_error')
    or p_engine is null
    or p_engine !~ '^ClamAV [0-9]'
    or length(p_engine)>120
    or p_signature is null
    or p_signature !~ '^[a-f0-9]{64}$' then
   raise exception 'invalid_scan_attestation';
 end if;

 select * into v_doc
 from private.citizen_documents
 where id=p_document_id
 for update;

 if not found
    or v_doc.scan_status<>'scanning'
    or v_doc.scanner_user_id is distinct from v_user then
   raise exception 'document_not_claimed_by_scanner';
 end if;

 update private.citizen_documents
 set scan_status=p_result,
     scan_engine=trim(p_engine),
     scan_signature=trim(p_signature),
     scanned_at=now(),
     scanner_user_id=v_user,
     updated_at=now()
 where id=p_document_id;

 return p_document_id;
end;
$body$;
revoke all on function private.attest_document_scan(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.attest_document_scan(uuid,text,text,text) to authenticated;

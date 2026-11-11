-- Back off transient scan errors and recover abandoned claims without exhausting retries.
create or replace function private.claim_next_document_scan()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then
   raise exception 'scanner_role_required' using errcode='42501';
 end if;

 update private.citizen_documents
 set scan_status='scan_error',scanner_user_id=null,updated_at=now()
 where scan_status='scanning' and updated_at<now()-interval '15 minutes' and scan_attempts<5;

 update private.citizen_documents
 set scan_status='scan_error',updated_at=now()
 where scan_status='scanning' and updated_at<now()-interval '15 minutes' and scan_attempts>=5;

 with candidate as (
   select id from private.citizen_documents
   where scan_attempts<5
     and (scan_status='quarantined' or (scan_status='scan_error' and updated_at<now()-interval '1 minute'))
   order by created_at
   for update skip locked limit 1
 )
 update private.citizen_documents d
 set scan_status='scanning',scan_attempts=d.scan_attempts+1,scanner_user_id=v_user,updated_at=now()
 from candidate c where d.id=c.id
 returning d.* into v_doc;

 if not found then return null; end if;
 return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
   'mime_type',v_doc.mime_type,'expected_size',v_doc.expected_size,'scan_attempts',v_doc.scan_attempts);
end;
$body$;
revoke all on function private.claim_next_document_scan() from public,anon,service_role;
grant execute on function private.claim_next_document_scan() to authenticated;

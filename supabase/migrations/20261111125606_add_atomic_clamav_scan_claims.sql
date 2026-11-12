-- Claim quarantined documents atomically so scanner workers cannot race.
alter table private.citizen_documents drop constraint if exists citizen_documents_scan_status_check;
alter table private.citizen_documents add constraint citizen_documents_scan_status_check
 check (scan_status in ('awaiting_upload','quarantined','scanning','clean','rejected','scan_error'));

create or replace function private.can_scan_citizen_document(p_object_name text)
returns boolean language sql stable security definer set search_path=public,private,pg_temp
as $$
 select exists(
   select 1 from private.citizen_documents d
   join private.document_scanner_roles r on r.user_id=auth.uid() and r.active=true
   where d.storage_object_name=p_object_name and d.scan_status in ('quarantined','scanning','scan_error')
 );
$$;
revoke all on function private.can_scan_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_scan_citizen_document(text) to authenticated;

drop policy if exists scanner_read_quarantined_citizen_documents on storage.objects;
create policy scanner_read_quarantined_citizen_documents on storage.objects for select to authenticated
using (bucket_id='citizen-documents' and private.can_scan_citizen_document(name));

create or replace function private.claim_next_document_scan()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then
   raise exception 'scanner_role_required' using errcode='42501';
 end if;
 update private.citizen_documents set scan_status='scan_error',updated_at=now()
 where scan_status='scanning' and updated_at<now()-interval '15 minutes' and scan_attempts>=5;
 with candidate as (
   select id from private.citizen_documents
   where scan_status in ('quarantined','scan_error') and scan_attempts<5
   order by created_at
   for update skip locked limit 1
 )
 update private.citizen_documents d set scan_status='scanning',scan_attempts=d.scan_attempts+1,scanner_user_id=v_user,updated_at=now()
 from candidate c where d.id=c.id
 returning d.* into v_doc;
 if not found then return null; end if;
 return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
   'mime_type',v_doc.mime_type,'expected_size',v_doc.expected_size,'scan_attempts',v_doc.scan_attempts);
end;
$$;
revoke all on function private.claim_next_document_scan() from public,anon,service_role;
grant execute on function private.claim_next_document_scan() to authenticated;

create or replace function private.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then
   raise exception 'scanner_role_required' using errcode='42501';
 end if;
 if p_result not in ('clean','rejected','scan_error') or p_engine is null or length(trim(p_engine))<3 or length(p_engine)>120 or p_signature is null or length(trim(p_signature))<8 or length(p_signature)>240 then
   raise exception 'invalid_scan_attestation';
 end if;
 select * into v_doc from private.citizen_documents where id=p_document_id for update;
 if not found or v_doc.scan_status<>'scanning' or v_doc.scanner_user_id is distinct from v_user then
   raise exception 'document_not_claimed_by_scanner';
 end if;
 update private.citizen_documents set scan_status=p_result,scan_engine=trim(p_engine),scan_signature=trim(p_signature),
   scanned_at=now(),scanner_user_id=v_user,updated_at=now()
 where id=p_document_id;
 return p_document_id;
end;
$$;
revoke all on function private.claim_next_document_scan() from public,anon,service_role;
revoke all on function private.attest_document_scan(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.claim_next_document_scan() to authenticated;
grant execute on function private.attest_document_scan(uuid,text,text,text) to authenticated;


create or replace function private.get_clean_citizen_document(p_document_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select * into v_doc from private.citizen_documents where id=p_document_id and user_id=v_user and scan_status='clean';
 if not found then raise exception 'clean_document_not_found' using errcode='P0002'; end if;
 if not private.has_active_citizen_consent(v_user,'document_storage',v_doc.case_id) then raise exception 'document_storage_consent_inactive' using errcode='42501'; end if;
 return jsonb_build_object('storage_object_name',v_doc.storage_object_name,'filename',v_doc.original_filename,'mime_type',v_doc.mime_type,'size',v_doc.expected_size);
end;
$body$;
revoke all on function private.get_clean_citizen_document(uuid) from public,anon,service_role;
grant execute on function private.get_clean_citizen_document(uuid) to authenticated;
create or replace function public.get_clean_citizen_document(p_document_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $body$ select private.get_clean_citizen_document(p_document_id) $body$;
revoke all on function public.get_clean_citizen_document(uuid) from public,anon;
grant execute on function public.get_clean_citizen_document(uuid) to authenticated;

create or replace function public.claim_next_document_scan()
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.claim_next_document_scan() $$;
create or replace function public.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language sql security invoker set search_path=public,private,pg_temp
as $$ select private.attest_document_scan(p_document_id,p_result,p_engine,p_signature) $$;
revoke all on function public.claim_next_document_scan() from public,anon;
revoke all on function public.attest_document_scan(uuid,text,text,text) from public,anon;
grant execute on function public.claim_next_document_scan() to authenticated;
grant execute on function public.attest_document_scan(uuid,text,text,text) to authenticated;

-- Re-check the exact document-storage consent before scanning, reading or
-- publishing clean status. If consent expires or is revoked, quarantine is
-- converted into a deletion-only job handled by the private scanner worker.
create or replace function private.has_active_document_storage_consent(
 p_user_id uuid,p_case_id uuid,p_consent_id uuid
)
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
  select 1
  from public.application_cases a
  join public.citizen_consents c
    on c.id=p_consent_id and c.user_id=a.user_id and c.case_id=a.id
  join private.consent_policy_versions p
    on p.purpose=c.purpose and p.version=c.policy_version
  where a.id=p_case_id and a.user_id=p_user_id
    and c.purpose='document_storage' and c.granted=true and c.revoked_at is null
    and c.captured_at>now()-interval '365 days'
    and c.scope->>'action_type'='upload_document'
    and c.scope->>'scheme_version_id'=a.scheme_version_id::text
    and p.active=true and p.approved_at is not null
    and p.legal_review_reference is not null
    and private.has_active_citizen_consent(p_user_id,'document_storage',p_case_id)
 );
$body$;
revoke all on function private.has_active_document_storage_consent(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function private.has_active_document_storage_consent(uuid,uuid,uuid) to authenticated;

alter table private.citizen_documents drop constraint if exists citizen_documents_scan_status_check;
alter table private.citizen_documents add constraint citizen_documents_scan_status_check
 check(scan_status=any(array['awaiting_upload','quarantined','scanning','clean','rejected','scan_error','consent_revoked','deleting']::text[]));

create or replace function private.can_read_citizen_document(p_object_name text)
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
  select 1 from private.citizen_documents d
  where d.storage_object_name=p_object_name and d.user_id=auth.uid()
    and d.scan_status='clean'
    and private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id)
 );
$body$;
revoke all on function private.can_read_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_read_citizen_document(text) to authenticated;

create or replace function private.can_scan_citizen_document(p_object_name text)
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
  select 1 from private.citizen_documents d
  join private.document_scanner_roles r on r.user_id=auth.uid() and r.active=true
  where d.storage_object_name=p_object_name and d.scan_status='scanning'
    and d.scanner_user_id=auth.uid()
    and private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id)
 );
$body$;
revoke all on function private.can_scan_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_scan_citizen_document(text) to authenticated;

create or replace function private.can_delete_revoked_citizen_document(p_object_name text)
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $body$
 select exists(
  select 1 from private.citizen_documents d
  join private.document_scanner_roles r on r.user_id=auth.uid() and r.active=true
  where d.storage_object_name=p_object_name and d.scan_status='deleting'
    and d.scanner_user_id=auth.uid()
    and not private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id)
 );
$body$;
revoke all on function private.can_delete_revoked_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_delete_revoked_citizen_document(text) to authenticated;

drop policy if exists scanner_delete_revoked_citizen_documents on storage.objects;
create policy scanner_delete_revoked_citizen_documents
on storage.objects for delete to authenticated
using(bucket_id='citizen-documents' and private.can_delete_revoked_citizen_document(name));

create or replace function private.claim_next_document_scan()
returns jsonb language plpgsql security definer
set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(
  select 1 from private.document_scanner_roles where user_id=v_user and active=true
 ) then raise exception 'scanner_role_required' using errcode='42501'; end if;

 update private.citizen_documents d
 set scan_status='consent_revoked',scanner_user_id=null,scanner_lease_until=null,
     scan_engine=null,scan_signature=null,scanned_at=null,updated_at=now()
 where d.scan_status in ('awaiting_upload','quarantined','scanning','scan_error','clean','rejected')
   and not private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id);

 update private.citizen_documents
 set scan_status='consent_revoked',scanner_user_id=null,scanner_lease_until=null,updated_at=now()
 where scan_status='deleting' and scanner_lease_until<now();

 with candidate as (
  select id from private.citizen_documents where scan_status='consent_revoked'
  order by created_at for update skip locked limit 1
 )
 update private.citizen_documents d
 set scan_status='deleting',scanner_user_id=v_user,
     scanner_lease_until=now()+interval '15 minutes',updated_at=now()
 from candidate c where d.id=c.id returning d.* into v_doc;

 if found then
  return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
    'cleanup_only',true,'scan_attempts',v_doc.scan_attempts);
 end if;

 update private.citizen_documents
 set scan_status='scan_error',scanner_user_id=null,scanner_lease_until=null,updated_at=now()
 where scan_status='scanning' and scanner_lease_until<now();

 with candidate as (
  select id from private.citizen_documents d
  where d.scan_attempts<5
    and (d.scan_status='quarantined' or (d.scan_status='scan_error' and d.updated_at<now()-interval '1 minute'))
    and private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id)
  order by d.created_at for update skip locked limit 1
 )
 update private.citizen_documents d
 set scan_status='scanning',scan_attempts=d.scan_attempts+1,
     scanner_user_id=v_user,scanner_lease_until=now()+interval '15 minutes',updated_at=now()
 from candidate c where d.id=c.id returning d.* into v_doc;

 if not found then return null; end if;
 return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
   'mime_type',v_doc.mime_type,'expected_size',v_doc.expected_size,
   'scan_attempts',v_doc.scan_attempts,'cleanup_only',false);
end;
$body$;
revoke all on function private.claim_next_document_scan() from public,anon,service_role;
grant execute on function private.claim_next_document_scan() to authenticated;

create or replace function private.attest_document_scan(
 p_document_id uuid,p_result text,p_engine text,p_signature text
)
returns uuid language plpgsql security definer
set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(
  select 1 from private.document_scanner_roles where user_id=v_user and active=true
 ) then raise exception 'scanner_role_required' using errcode='42501'; end if;
 if p_result not in ('clean','rejected','scan_error')
    or p_engine is null or p_engine !~ '^ClamAV [0-9]' or length(p_engine)>120
    or p_signature is null or p_signature !~ '^[a-f0-9]{64}$' then
  raise exception 'invalid_scan_attestation';
 end if;
 select * into v_doc from private.citizen_documents where id=p_document_id for update;
 if not found or v_doc.scan_status<>'scanning' or v_doc.scanner_user_id is distinct from v_user then
  raise exception 'document_not_claimed_by_scanner';
 end if;
 if not private.has_active_document_storage_consent(v_doc.user_id,v_doc.case_id,v_doc.consent_id) then
  update private.citizen_documents
  set scan_status='consent_revoked',scanner_user_id=null,scanner_lease_until=null,
      scan_engine=null,scan_signature=null,scanned_at=null,updated_at=now()
  where id=p_document_id;
  return p_document_id;
 end if;
 update private.citizen_documents
 set scan_status=p_result,scan_engine=trim(p_engine),scan_signature=trim(p_signature),
     scanned_at=now(),scanner_user_id=v_user,scanner_lease_until=null,updated_at=now()
 where id=p_document_id;
 return p_document_id;
end;
$body$;
revoke all on function private.attest_document_scan(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.attest_document_scan(uuid,text,text,text) to authenticated;

create or replace function private.get_citizen_document_delete_target(p_document_id uuid)
returns jsonb language plpgsql security definer
set search_path=public,private,pg_temp
as $body$
declare v_doc private.citizen_documents%rowtype; v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select * into v_doc from private.citizen_documents where id=p_document_id and user_id=v_user;
 if not found then raise exception 'document_not_found' using errcode='P0002'; end if;
 return jsonb_build_object('document_id',v_doc.id,'object_name',v_doc.storage_object_name);
end;
$body$;
revoke all on function private.get_citizen_document_delete_target(uuid) from public,anon,service_role;
grant execute on function private.get_citizen_document_delete_target(uuid) to authenticated;

create or replace function private.complete_citizen_document_delete(p_document_id uuid,p_object_name text)
returns uuid language plpgsql security definer
set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_deleted uuid;
begin
 if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if exists(select 1 from storage.objects where bucket_id='citizen-documents' and name=p_object_name) then
  raise exception 'storage_object_still_exists';
 end if;
 delete from private.citizen_documents
 where id=p_document_id and user_id=v_user and storage_object_name=p_object_name
 returning id into v_deleted;
 if v_deleted is null then raise exception 'document_not_found' using errcode='P0002'; end if;
 return v_deleted;
end;
$body$;
revoke all on function private.complete_citizen_document_delete(uuid,text) from public,anon,service_role;
grant execute on function private.complete_citizen_document_delete(uuid,text) to authenticated;

create or replace function public.get_citizen_document_delete_target(p_document_id uuid)
returns jsonb language sql security definer set search_path=public,private,pg_temp
as $body$ select private.get_citizen_document_delete_target(p_document_id); $body$;
revoke all on function public.get_citizen_document_delete_target(uuid) from public,anon,service_role;
grant execute on function public.get_citizen_document_delete_target(uuid) to authenticated;

create or replace function public.complete_citizen_document_delete(p_document_id uuid,p_object_name text)
returns uuid language sql security definer set search_path=public,private,pg_temp
as $body$ select private.complete_citizen_document_delete(p_document_id,p_object_name); $body$;
revoke all on function public.complete_citizen_document_delete(uuid,text) from public,anon,service_role;
grant execute on function public.complete_citizen_document_delete(uuid,text) to authenticated;

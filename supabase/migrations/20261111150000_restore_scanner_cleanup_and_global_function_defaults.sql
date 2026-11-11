-- Restore consent-aware deletion claims while applying bounded scan retry backoff.
-- Also revoke PostgreSQL's global default PUBLIC EXECUTE privilege for future functions.
alter default privileges for role postgres revoke execute on functions from public;

create or replace function private.claim_next_document_scan()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $body$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null or not exists(
  select 1 from private.document_scanner_roles where user_id=v_user and active=true
 ) then
  raise exception 'scanner_role_required' using errcode='42501';
 end if;

 -- Reclaim abandoned scan leases. Expired deletion leases return to the
 -- consent-revoked queue; they must never be converted into scan jobs.
 update private.citizen_documents
 set scan_status='consent_revoked',scanner_user_id=null,scanner_lease_until=null,
     scan_engine=null,scan_signature=null,scanned_at=null,updated_at=now()
 where scan_status='deleting' and scanner_lease_until<now();

 update private.citizen_documents
 set scan_status='scan_error',scanner_user_id=null,scanner_lease_until=null,updated_at=now()
 where scan_status='scanning' and scanner_lease_until<now();

 -- Revoke queued/cleaned objects as soon as the exact consent is no longer valid.
 update private.citizen_documents d
 set scan_status='consent_revoked',scanner_user_id=null,scanner_lease_until=null,
     scan_engine=null,scan_signature=null,scanned_at=null,updated_at=now()
 where d.scan_status in ('awaiting_upload','quarantined','scanning','scan_error','clean','rejected')
   and not private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id);

 -- Exhausted scan attempts become a visible terminal error; deletion work remains claimable.
 update private.citizen_documents d
 set scan_status='scan_error',scanner_user_id=null,scanner_lease_until=null,updated_at=now()
 where d.scan_status in ('quarantined','scan_error') and d.scan_attempts>=5
   and private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id);

 -- Process consent-revoked objects first. The worker deletes bytes, then calls
 -- complete_revoked_document_cleanup; an expired lease safely returns here.
 with candidate as (
  select id from private.citizen_documents
  where scan_status='consent_revoked'
  order by created_at
  for update skip locked limit 1
 )
 update private.citizen_documents d
 set scan_status='deleting',scanner_user_id=v_user,
     scanner_lease_until=now()+interval '15 minutes',updated_at=now()
 from candidate c where d.id=c.id
 returning d.* into v_doc;

 if found then
  return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
    'cleanup_only',true,'scan_attempts',v_doc.scan_attempts);
 end if;

 -- Only consent-valid documents are eligible for malware scanning.
 with candidate as (
  select id from private.citizen_documents d
  where d.scan_attempts<5
    and (d.scan_status='quarantined' or
         (d.scan_status='scan_error' and d.updated_at<now()-interval '1 minute'))
    and private.has_active_document_storage_consent(d.user_id,d.case_id,d.consent_id)
  order by d.created_at
  for update skip locked limit 1
 )
 update private.citizen_documents d
 set scan_status='scanning',scan_attempts=d.scan_attempts+1,
     scanner_user_id=v_user,scanner_lease_until=now()+interval '15 minutes',updated_at=now()
 from candidate c where d.id=c.id
 returning d.* into v_doc;

 if not found then return null; end if;
 return jsonb_build_object('id',v_doc.id,'storage_object_name',v_doc.storage_object_name,
   'mime_type',v_doc.mime_type,'expected_size',v_doc.expected_size,
   'scan_attempts',v_doc.scan_attempts,'cleanup_only',false);
end;
$body$;
revoke all on function private.claim_next_document_scan() from public,anon,service_role;
grant execute on function private.claim_next_document_scan() to authenticated;

-- Public RPC wrappers execute with caller privileges; private functions retain
-- their own SECURITY DEFINER boundary and explicit auth.uid()/role checks.
alter function public.complete_citizen_document_delete(uuid,text) security invoker;
alter function public.get_citizen_document_delete_target(uuid) security invoker;
alter function public.complete_revoked_document_cleanup(uuid,text) security invoker;

-- Cover the remaining private-schema foreign keys reported by the advisor.
create index if not exists application_preparations_scheme_version_id_idx on private.application_preparations(scheme_version_id);
create index if not exists application_preparations_user_id_idx on private.application_preparations(user_id);
create index if not exists citizen_documents_case_id_idx on private.citizen_documents(case_id);
create index if not exists citizen_documents_consent_id_idx on private.citizen_documents(consent_id);
create index if not exists citizen_documents_scanner_user_id_idx on private.citizen_documents(scanner_user_id);
create index if not exists scheme_reviewer_roles_assigned_by_idx on private.scheme_reviewer_roles(assigned_by);

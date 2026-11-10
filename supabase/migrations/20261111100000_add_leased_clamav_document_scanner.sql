-- Leased, authenticated ClamAV scanner access for private quarantined citizen documents.
alter table private.citizen_documents
  add column if not exists scan_attempts integer not null default 0 check (scan_attempts >= 0),
  add column if not exists scanner_lease_until timestamptz;

create index if not exists citizen_documents_scan_claim_idx
  on private.citizen_documents (scan_status, scanner_lease_until, created_at)
  where scan_status in ('quarantined','scan_error');

create or replace function private.can_read_citizen_document(p_object_name text)
returns boolean language sql stable security definer set search_path=public,private,pg_temp
as $$
  select exists(
    select 1 from private.citizen_documents d
    where d.storage_object_name=p_object_name
      and (
        (d.user_id=auth.uid() and d.scan_status='clean')
        or exists(select 1 from private.document_scanner_roles r where r.user_id=auth.uid() and r.active=true)
      )
  );
$$;
revoke all on function private.can_read_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_read_citizen_document(text) to authenticated;

drop policy if exists citizen_documents_read_own on storage.objects;
create policy citizen_documents_read_own on storage.objects for select to authenticated
using (bucket_id='citizen-documents' and private.can_read_citizen_document(name));

create or replace function private.claim_document_scan_batch(p_limit integer default 5)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_items jsonb;
begin
  if v_user is null or not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then
    raise exception 'scanner_role_required' using errcode='42501';
  end if;
  with picked as (
    select id from private.citizen_documents
    where scan_status in ('quarantined','scan_error')
      and scan_attempts < 5
      and (scanner_lease_until is null or scanner_lease_until < now())
    order by created_at
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,5),10))
  ), claimed as (
    update private.citizen_documents d
    set scanner_user_id=v_user, scanner_lease_until=now()+interval '10 minutes',
        scan_attempts=d.scan_attempts+1, updated_at=now()
    from picked where d.id=picked.id
    returning d.id,d.storage_object_name,d.mime_type,d.expected_size,d.scan_attempts
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'document_id',id,'object_name',storage_object_name,'mime_type',mime_type,
    'expected_size',expected_size,'attempt',scan_attempts
  ) order by object_name),'[]'::jsonb) into v_items from claimed;
  return v_items;
end;
$$;

create or replace function private.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
  if v_user is null or not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then
    raise exception 'scanner_role_required' using errcode='42501';
  end if;
  if p_result not in ('clean','rejected','scan_error')
     or p_engine is null or length(trim(p_engine))<3 or length(p_engine)>120
     or p_signature is null or p_signature !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_scan_attestation';
  end if;
  select * into v_doc from private.citizen_documents
  where id=p_document_id for update;
  if not found or v_doc.scan_status not in ('quarantined','scan_error')
     or v_doc.scanner_user_id is distinct from v_user
     or v_doc.scanner_lease_until is null or v_doc.scanner_lease_until < now() then
    raise exception 'document_scan_lease_invalid';
  end if;
  update private.citizen_documents
  set scan_status=p_result,scan_engine=trim(p_engine),scan_signature=p_signature,
      scanned_at=now(),scanner_lease_until=null,updated_at=now()
  where id=p_document_id;
  return p_document_id;
end;
$$;

revoke all on function private.claim_document_scan_batch(integer) from public,anon,service_role;
revoke all on function private.attest_document_scan(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.claim_document_scan_batch(integer) to authenticated;
grant execute on function private.attest_document_scan(uuid,text,text,text) to authenticated;

create or replace function public.claim_document_scan_batch(p_limit integer default 5)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.claim_document_scan_batch(p_limit) $$;
create or replace function public.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language sql security invoker set search_path=public,private,pg_temp
as $$ select private.attest_document_scan(p_document_id,p_result,p_engine,p_signature) $$;
revoke all on function public.claim_document_scan_batch(integer) from public,anon;
revoke all on function public.attest_document_scan(uuid,text,text,text) from public,anon;
grant execute on function public.claim_document_scan_batch(integer) to authenticated;
grant execute on function public.attest_document_scan(uuid,text,text,text) to authenticated;

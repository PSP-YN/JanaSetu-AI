-- Quarantined citizen document upload with explicit consent and scan attestation.
create table if not exists private.citizen_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.application_cases(id) on delete cascade,
  consent_id uuid not null references public.citizen_consents(id) on delete restrict,
  storage_object_name text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  expected_size bigint not null check (expected_size between 1 and 12582912),
  scan_status text not null default 'awaiting_upload' check (scan_status in ('awaiting_upload','quarantined','clean','rejected','scan_error')),
  scan_engine text,
  scan_signature text,
  scanned_at timestamptz,
  scanner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists citizen_documents_user_case_idx on private.citizen_documents(user_id,case_id,created_at desc);
revoke all on private.citizen_documents from public,anon,authenticated,service_role;

create table if not exists private.document_scanner_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  assigned_at timestamptz not null default now()
);
revoke all on private.document_scanner_roles from public,anon,authenticated,service_role;

create or replace function private.init_document_upload(
  p_case_id uuid,p_consent_id uuid,p_filename text,p_mime_type text,p_size bigint
) returns jsonb
language plpgsql security definer set search_path=public,private,storage,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_case public.application_cases%rowtype; v_consent public.citizen_consents%rowtype;
v_id uuid; v_path text; v_ext text;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if p_filename is null or length(p_filename) not between 1 and 180 or p_filename ~ '[/\\\\]' or p_filename ~ '[[:cntrl:]]' then raise exception 'invalid_filename'; end if;
  if p_mime_type not in ('application/pdf','image/jpeg','image/png') or p_size not between 1 and 12582912 then raise exception 'unsupported_document_type_or_size'; end if;
  select * into v_case from public.application_cases where id=p_case_id and user_id=v_user;
  if not found then raise exception 'case_not_found' using errcode='P0002'; end if;
  select * into v_consent from public.citizen_consents where id=p_consent_id and user_id=v_user and case_id=p_case_id
    and purpose='document_storage' and granted=true and revoked_at is null and captured_at>now()-interval '365 days';
  if not found then raise exception 'document_storage_consent_required'; end if;
  if not exists(select 1 from private.consent_policy_versions where purpose='document_storage' and version=v_consent.policy_version and active=true and approved_at is not null and legal_review_reference is not null) then raise exception 'consent_policy_not_approved'; end if;
  if v_consent.scope->>'scheme_version_id' is distinct from v_case.scheme_version_id::text
    or v_consent.scope->>'action_type' is distinct from 'upload_document' then raise exception 'consent_scope_mismatch'; end if;
  v_ext:=case p_mime_type when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' else 'png' end;
  v_id:=gen_random_uuid();
  v_path:=v_user::text||'/'||p_case_id::text||'/'||p_consent_id::text||'/'||v_id::text||'.'||v_ext;
  insert into private.citizen_documents(id,user_id,case_id,consent_id,storage_object_name,original_filename,mime_type,expected_size)
  values(v_id,v_user,p_case_id,p_consent_id,v_path,p_filename,p_mime_type,p_size);
  return jsonb_build_object('document_id',v_id,'object_name',v_path,'status','awaiting_upload');
end;
$$;

create or replace function private.complete_document_upload(p_document_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,storage,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype; v_meta jsonb;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into v_doc from private.citizen_documents where id=p_document_id and user_id=v_user for update;
  if not found or v_doc.scan_status<>'awaiting_upload' then raise exception 'document_upload_not_pending'; end if;
  select metadata into v_meta from storage.objects where bucket_id='citizen-documents' and name=v_doc.storage_object_name;
  if not found then raise exception 'uploaded_object_not_found'; end if;
  if coalesce((v_meta->>'size')::bigint,0)<>v_doc.expected_size then raise exception 'uploaded_size_mismatch'; end if;
  if v_meta->>'mimetype' is distinct from v_doc.mime_type then raise exception 'uploaded_mime_type_mismatch'; end if;
  update private.citizen_documents set scan_status='quarantined',updated_at=now() where id=p_document_id;
  return jsonb_build_object('document_id',p_document_id,'status','quarantined','downloadable',false);
end;
$$;

create or replace function private.list_citizen_documents(p_case_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_items jsonb;
begin
 if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from public.application_cases where id=p_case_id and user_id=v_user) then raise exception 'case_not_found' using errcode='P0002'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'filename',original_filename,'mime_type',mime_type,'size',expected_size,'scan_status',scan_status,'created_at',created_at) order by created_at desc),'[]'::jsonb)
 into v_items from private.citizen_documents where case_id=p_case_id and user_id=v_user;
 return v_items;
end;
$$;

create or replace function private.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_doc private.citizen_documents%rowtype;
begin
 if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from private.document_scanner_roles where user_id=v_user and active=true) then raise exception 'scanner_role_required' using errcode='42501'; end if;
 if p_result not in ('clean','rejected','scan_error') or p_engine is null or length(trim(p_engine))<3 or length(p_engine)>120 or p_signature is null or length(trim(p_signature))<8 or length(p_signature)>240 then raise exception 'invalid_scan_attestation'; end if;
 select * into v_doc from private.citizen_documents where id=p_document_id for update;
 if not found or v_doc.scan_status not in ('quarantined','scan_error') then raise exception 'document_not_scannable'; end if;
 update private.citizen_documents set scan_status=p_result,scan_engine=trim(p_engine),scan_signature=trim(p_signature),scanned_at=now(),scanner_user_id=v_user,updated_at=now() where id=p_document_id;
 return p_document_id;
end;
$$;

revoke all on function private.init_document_upload(uuid,uuid,text,text,bigint) from public,anon,service_role;
revoke all on function private.complete_document_upload(uuid) from public,anon,service_role;
revoke all on function private.list_citizen_documents(uuid) from public,anon,service_role;
revoke all on function private.attest_document_scan(uuid,text,text,text) from public,anon,service_role;
grant execute on function private.init_document_upload(uuid,uuid,text,text,bigint) to authenticated;
grant execute on function private.complete_document_upload(uuid) to authenticated;
grant execute on function private.list_citizen_documents(uuid) to authenticated;
grant execute on function private.attest_document_scan(uuid,text,text,text) to authenticated;

drop policy if exists citizen_documents_upload_with_consent on storage.objects;
create policy citizen_documents_upload_with_consent on storage.objects for insert to authenticated
with check (
 bucket_id='citizen-documents'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists (
   select 1 from private.citizen_documents d
   join public.citizen_consents c on c.id=d.consent_id
   join public.application_cases a on a.id=d.case_id and a.user_id=d.user_id
   join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
   where d.storage_object_name=name and d.user_id=auth.uid()
     and d.scan_status='awaiting_upload' and c.user_id=auth.uid() and c.granted=true and c.revoked_at is null
     and c.purpose='document_storage' and c.captured_at>now()-interval '365 days'
     and c.scope->>'action_type'='upload_document' and c.scope->>'scheme_version_id'=a.scheme_version_id::text
 )
);

drop policy if exists citizen_documents_read_own on storage.objects;
create policy citizen_documents_read_own on storage.objects for select to authenticated
using (
 bucket_id='citizen-documents'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists(select 1 from private.citizen_documents d where d.storage_object_name=name and d.user_id=auth.uid() and d.scan_status='clean')
);

create or replace function private.prevent_unscanned_document_download()
returns trigger language plpgsql security definer set search_path=public,private,pg_temp
as $$
begin
 if old.bucket_id='citizen-documents' and exists(select 1 from private.citizen_documents d where d.storage_object_name=old.name and d.scan_status<>'clean') then
   raise exception 'document_quarantined_until_scan';
 end if;
 return old;
end;
$$;
revoke all on function private.prevent_unscanned_document_download() from public,anon,authenticated,service_role;
drop trigger if exists citizen_document_no_unscanned_delete on storage.objects;
create trigger citizen_document_no_unscanned_delete before delete on storage.objects for each row execute function private.prevent_unscanned_document_download();

create or replace function public.init_document_upload(p_case_id uuid,p_consent_id uuid,p_filename text,p_mime_type text,p_size bigint)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.init_document_upload(p_case_id,p_consent_id,p_filename,p_mime_type,p_size) $$;
create or replace function public.complete_document_upload(p_document_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.complete_document_upload(p_document_id) $$;
create or replace function public.list_citizen_documents(p_case_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.list_citizen_documents(p_case_id) $$;
create or replace function public.attest_document_scan(p_document_id uuid,p_result text,p_engine text,p_signature text)
returns uuid language sql security invoker set search_path=public,private,pg_temp
as $$ select private.attest_document_scan(p_document_id,p_result,p_engine,p_signature) $$;
revoke all on function public.init_document_upload(uuid,uuid,text,text,bigint) from public,anon;
revoke all on function public.complete_document_upload(uuid) from public,anon;
revoke all on function public.list_citizen_documents(uuid) from public,anon;
revoke all on function public.attest_document_scan(uuid,text,text,text) from public,anon;
grant execute on function public.init_document_upload(uuid,uuid,text,text,bigint) to authenticated;
grant execute on function public.complete_document_upload(uuid) to authenticated;
grant execute on function public.list_citizen_documents(uuid) to authenticated;
grant execute on function public.attest_document_scan(uuid,text,text,text) to authenticated;

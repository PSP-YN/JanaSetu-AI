-- Remove the legacy broad scanner read predicate and obsolete lease/batch claim path.
create or replace function private.can_read_citizen_document(p_object_name text)
returns boolean language sql stable security definer set search_path=public,private,pg_temp
as $body$
 select exists(
   select 1 from private.citizen_documents d
   where d.storage_object_name=p_object_name
     and d.user_id=auth.uid()
     and d.scan_status='clean'
 );
$body$;
revoke all on function private.can_read_citizen_document(text) from public,anon,service_role;
grant execute on function private.can_read_citizen_document(text) to authenticated;

drop function if exists public.claim_document_scan_batch(integer);
drop function if exists private.claim_document_scan_batch(integer);

-- Reuse the stricter pre-existing retrieval RPC, which checks exact case consent,
-- active legal policy, upload purpose and scheme-version scope.
create or replace function private.get_clean_citizen_document(p_document_id uuid)
returns jsonb language sql security definer set search_path=public,private,pg_temp
as $body$
 select private.get_citizen_document_download(p_document_id)
$body$;
revoke all on function private.get_clean_citizen_document(uuid) from public,anon,service_role;
grant execute on function private.get_clean_citizen_document(uuid) to authenticated;

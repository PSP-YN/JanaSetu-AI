-- Public scheme pages and the deterministic preparation engine may read only
-- the current published version after independent approval. Drafts, review packets,
-- and superseded versions remain private to the review workflow.
drop policy if exists public_read_published_schemes on public.schemes;
create policy public_read_published_schemes
on public.schemes
for select
to anon,authenticated
using (publication_status='published');

drop policy if exists public_read_current_approved_scheme_versions on public.scheme_versions;
create policy public_read_current_approved_scheme_versions
on public.scheme_versions
for select
to anon,authenticated
using (
 verification_status='independently_approved'
 and exists(
   select 1 from public.schemes s
   where s.id=scheme_versions.scheme_id
     and s.publication_status='published'
     and s.current_version_id=scheme_versions.id
 )
);

drop policy if exists public_read_published_scheme_sources on public.scheme_sources;
create policy public_read_published_scheme_sources
on public.scheme_sources
for select
to anon,authenticated
using (
 exists(
   select 1
   from public.scheme_versions sv
   join public.schemes s on s.id=sv.scheme_id
   where sv.source_id=scheme_sources.id
     and sv.verification_status='independently_approved'
     and s.publication_status='published'
     and s.current_version_id=sv.id
 )
);

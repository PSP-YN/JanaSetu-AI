-- PostgreSQL combines permissive SELECT policies with OR. Remove legacy
-- policies that exposed the current published version without checking its
-- independent verification status; retain the stricter replacement policies.
drop policy if exists schemes_read_published on public.schemes;
drop policy if exists scheme_versions_read_published on public.scheme_versions;
drop policy if exists scheme_sources_read_published on public.scheme_sources;

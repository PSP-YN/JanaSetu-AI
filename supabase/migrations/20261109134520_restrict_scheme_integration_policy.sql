drop policy if exists scheme_integrations_service_role_only on public.scheme_integrations;
drop policy if exists scheme_integrations_service_role_read on public.scheme_integrations;
create policy scheme_integrations_service_role_read on public.scheme_integrations
  for select to service_role using (true);
grant select on public.scheme_integrations to service_role;

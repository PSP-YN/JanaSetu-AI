-- Harden JanaSetu's Data API grants and index all foreign keys flagged during initial review.
-- RLS controls rows; SQL privileges independently control whether roles can reach objects.
revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Public scheme catalogue is read-only.
grant select on public.scheme_sources, public.schemes, public.scheme_versions to anon, authenticated;

-- Citizen self-service permissions are deliberately narrow. Sensitive mutations remain server-only.
grant select, insert, update on public.profiles to authenticated;
grant select on public.application_cases, public.application_events, public.application_documents to authenticated;
grant select, insert on public.citizen_consents to authenticated;
grant select, insert, update on public.citizen_reminders to authenticated;
grant select on public.automation_runs, public.audit_events to authenticated;

-- Future objects must not inherit broad API permissions.
alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

-- Foreign-key indexes identified by Supabase's performance advisor.
create index if not exists application_events_actor_id_idx on public.application_events(actor_id);
create index if not exists audit_events_actor_id_idx on public.audit_events(actor_id);
create index if not exists automation_runs_case_id_idx on public.automation_runs(case_id);
create index if not exists automation_runs_consent_id_idx on public.automation_runs(consent_id);
create index if not exists citizen_consents_case_id_idx on public.citizen_consents(case_id);
create index if not exists citizen_reminders_case_id_idx on public.citizen_reminders(case_id);
create index if not exists scheme_approvals_reviewer_id_idx on public.scheme_approvals(reviewer_id);
create index if not exists scheme_versions_source_id_idx on public.scheme_versions(source_id);
create index if not exists schemes_current_version_id_idx on public.schemes(current_version_id);

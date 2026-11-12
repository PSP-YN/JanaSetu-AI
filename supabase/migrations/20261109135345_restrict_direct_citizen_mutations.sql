-- Prevent direct Data API mutations that would bypass consent and workflow RPC validation.
revoke insert, update, delete, truncate on public.citizen_consents from public, anon, authenticated;
grant select on public.citizen_consents to authenticated;

revoke insert, update, delete, truncate on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

revoke insert, update, delete, truncate on public.citizen_reminders from public, anon, authenticated;
grant select on public.citizen_reminders to authenticated;

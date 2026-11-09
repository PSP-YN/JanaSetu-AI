-- Authenticated, cross-device citizen workspace. Metadata and preparation records only.
create table public.citizen_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_data jsonb not null default '{}'::jsonb check (jsonb_typeof(profile_data) = 'object'),
  preferred_language text not null default 'en' check (preferred_language in ('en','hi','kn','ta','te','ml')),
  application_drafts jsonb not null default '[]'::jsonb check (jsonb_typeof(application_drafts) = 'array'),
  document_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(document_refs) = 'array'),
  reminders jsonb not null default '[]'::jsonb check (jsonb_typeof(reminders) = 'array'),
  assessments jsonb not null default '[]'::jsonb check (jsonb_typeof(assessments) = 'array'),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.citizen_workspaces enable row level security;
create policy citizen_workspaces_select_own on public.citizen_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy citizen_workspaces_insert_own on public.citizen_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy citizen_workspaces_update_own on public.citizen_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.citizen_workspaces to authenticated;
revoke all on public.citizen_workspaces from anon, public;

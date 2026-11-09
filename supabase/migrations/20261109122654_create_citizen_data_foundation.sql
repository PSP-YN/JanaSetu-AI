-- JanaSetu citizen-data foundation.
-- All citizen-owned records are tenant-scoped to auth.uid(). No service-role key is used in browsers.
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.scheme_publication_status as enum ('draft','review_pending','published','withdrawn','archived');
create type public.scheme_verification_status as enum ('unverified','source_checked','rule_checked','independently_approved','stale','withdrawn');
create type public.application_case_status as enum ('preparing','awaiting_citizen_review','citizen_approved','ready_for_manual_submission','submitted_externally','decision_received','closed','cancelled');
create type public.document_scan_status as enum ('pending','clean','rejected','failed','deleted');
create type public.automation_run_status as enum ('queued','awaiting_consent','awaiting_confirmation','running','succeeded','failed','cancelled','expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en' check (preferred_language in ('en','kn','hi','ta','te','ml','mr','bn','gu','pa','or','as','ur')),
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2,3}$'),
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scheme_sources (
  id uuid primary key default gen_random_uuid(),
  publisher text not null,
  source_url text not null,
  source_type text not null check (source_type in ('official_government','official_department','licensed_dataset','research','budget_document')),
  licence text,
  last_checked_at timestamptz,
  source_revision text,
  freshness_days integer check (freshness_days is null or freshness_days >= 0),
  access_notes text,
  created_at timestamptz not null default now(),
  unique (source_url)
);

create table public.schemes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  level text not null check (level in ('central','state','union_territory','local')),
  state_code text,
  category text not null,
  publication_status public.scheme_publication_status not null default 'draft',
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((level = 'central' and state_code is null) or (level <> 'central' and state_code is not null))
);

create table public.scheme_versions (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references public.schemes(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  source_id uuid not null references public.scheme_sources(id) on delete restrict,
  source_url text not null,
  source_published_at timestamptz,
  effective_from date,
  effective_to date,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  rule_set jsonb not null default '{}'::jsonb check (jsonb_typeof(rule_set) = 'object'),
  content_sha256 text not null check (content_sha256 ~ '^[a-f0-9]{64}$'),
  verification_status public.scheme_verification_status not null default 'unverified',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (scheme_id, version_number),
  unique (scheme_id, content_sha256),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

alter table public.schemes add constraint schemes_current_version_fk
  foreign key (current_version_id) references public.scheme_versions(id) on delete restrict deferrable initially deferred;

create table public.scheme_approvals (
  id uuid primary key default gen_random_uuid(),
  scheme_version_id uuid not null references public.scheme_versions(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  approval_type text not null check (approval_type in ('source_accuracy','eligibility_rule_accuracy','translation_quality','legal_review')),
  decision text not null check (decision in ('approved','rejected','changes_requested')),
  notes text,
  created_at timestamptz not null default now(),
  unique (scheme_version_id, reviewer_id, approval_type)
);

create table public.application_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_version_id uuid not null references public.scheme_versions(id) on delete restrict,
  status public.application_case_status not null default 'preparing',
  profile_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(profile_snapshot) = 'object'),
  citizen_notes text,
  citizen_approved_at timestamptz,
  external_reference text,
  external_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index application_cases_user_updated_idx on public.application_cases(user_id, updated_at desc);
create index application_cases_scheme_idx on public.application_cases(scheme_version_id);

create table public.application_events (
  id bigint generated always as identity primary key,
  case_id uuid not null references public.application_cases(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('created','profile_reviewed','consent_granted','consent_revoked','citizen_approved','automation_requested','automation_confirmed','external_submission_recorded','status_updated','document_added','document_removed','reminder_created','case_closed')),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
create index application_events_case_created_idx on public.application_events(case_id, created_at desc);

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.application_cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  byte_size bigint not null check (byte_size between 1 and 12582912),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  scan_status public.document_scan_status not null default 'pending',
  scanned_at timestamptz,
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  unique (case_id, storage_path)
);
create index application_documents_user_case_idx on public.application_documents(user_id, case_id);

create table public.citizen_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references public.application_cases(id) on delete cascade,
  purpose text not null check (purpose in ('profile_storage','document_storage','reminder_notifications','assisted_form_filling','external_portal_navigation','automated_submission')),
  policy_version text not null,
  granted boolean not null,
  captured_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index citizen_consents_user_purpose_idx on public.citizen_consents(user_id, purpose, captured_at desc);

create table public.citizen_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references public.application_cases(id) on delete cascade,
  title text not null check (length(title) between 1 and 180),
  due_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','dismissed','cancelled','failed')),
  channel text not null default 'in_app' check (channel in ('in_app','email','sms','push')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index citizen_reminders_due_idx on public.citizen_reminders(status, due_at) where status = 'scheduled';
create index citizen_reminders_user_idx on public.citizen_reminders(user_id, due_at desc);

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.application_cases(id) on delete cascade,
  action_type text not null check (action_type in ('prepare_documents','open_official_portal','assist_form_filling','submit_application','check_application_status','schedule_reminder')),
  status public.automation_run_status not null default 'awaiting_consent',
  idempotency_key text not null,
  consent_id uuid references public.citizen_consents(id) on delete restrict,
  requested_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(requested_payload) = 'object'),
  result_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(result_summary) = 'object'),
  requires_human_confirmation boolean not null default true,
  confirmation_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index automation_runs_queue_idx on public.automation_runs(status, created_at) where status in ('queued','awaiting_consent','awaiting_confirmation');
create index automation_runs_user_idx on public.automation_runs(user_id, created_at desc);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  request_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index audit_events_subject_created_idx on public.audit_events(subject_user_id, created_at desc);

-- The browser may read only published schemes. Citizen-owned tables are strictly tenant-scoped.
alter table public.profiles enable row level security;
alter table public.scheme_sources enable row level security;
alter table public.schemes enable row level security;
alter table public.scheme_versions enable row level security;
alter table public.scheme_approvals enable row level security;
alter table public.application_cases enable row level security;
alter table public.application_events enable row level security;
alter table public.application_documents enable row level security;
alter table public.citizen_consents enable row level security;
alter table public.citizen_reminders enable row level security;
alter table public.automation_runs enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "scheme_sources_read_published" on public.scheme_sources for select to anon, authenticated
  using (exists (select 1 from public.scheme_versions v join public.schemes s on s.id = v.scheme_id where v.source_id = scheme_sources.id and s.publication_status = 'published' and v.id = s.current_version_id));
create policy "schemes_read_published" on public.schemes for select to anon, authenticated using (publication_status = 'published');
create policy "scheme_versions_read_published" on public.scheme_versions for select to anon, authenticated
  using (exists (select 1 from public.schemes s where s.id = scheme_versions.scheme_id and s.publication_status = 'published' and s.current_version_id = scheme_versions.id));
-- Scheme edits and approvals are intentionally service/admin-only; no citizen write policies.

create policy "cases_select_own" on public.application_cases for select to authenticated using ((select auth.uid()) = user_id);

create policy "events_select_own" on public.application_events for select to authenticated
  using (exists (select 1 from public.application_cases c where c.id = application_events.case_id and c.user_id = (select auth.uid())));
create policy "documents_select_own" on public.application_documents for select to authenticated using ((select auth.uid()) = user_id);

create policy "consents_select_own" on public.citizen_consents for select to authenticated using ((select auth.uid()) = user_id);
create policy "consents_insert_own" on public.citizen_consents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "reminders_select_own" on public.citizen_reminders for select to authenticated using ((select auth.uid()) = user_id);
create policy "reminders_insert_own" on public.citizen_reminders for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "reminders_update_own" on public.citizen_reminders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "automation_runs_select_own" on public.automation_runs for select to authenticated using ((select auth.uid()) = user_id);
-- Case creation/status changes, document metadata writes, uploads, automation and audit writes are server-mediated only.
-- No direct citizen UPDATE policy is granted on cases, preventing forged submission/status transitions.
create policy "audit_events_select_own" on public.audit_events for select to authenticated using ((select auth.uid()) = subject_user_id);

-- Private object storage: uploads are server-mediated until malware scanning and content validation are online.
-- Per-user reads/deletes are enforced at the storage layer; no browser INSERT policy is granted.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('citizen-documents', 'citizen-documents', false, 12582912, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "citizen_documents_read_own" on storage.objects for select to authenticated
  using (bucket_id = 'citizen-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "citizen_documents_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'citizen-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- No direct anon grants, no service-role secrets in client code, no automatic government submission.

#!/usr/bin/env python3
"""Static guardrails for the JanaSetu initial Supabase schema migration."""
from pathlib import Path
import re
import sys

migration_dir = Path("supabase/migrations")
files = sorted(migration_dir.glob("*.sql"))
if not files:
    raise SystemExit("No Supabase migrations found")

sql = "\n".join(p.read_text() for p in files)
tables = set(re.findall(r"create table(?: if not exists)? public\.([a-z_]+)", sql, re.I))
rls = set(re.findall(r"alter table public\.([a-z_]+) enable row level security", sql, re.I))
missing = sorted(tables - rls)
if missing:
    raise SystemExit(f"Tables missing RLS: {missing}")
if not tables:
    raise SystemExit("No public tables found")

required = {
    "profiles", "scheme_sources", "schemes", "scheme_versions",
    "scheme_approvals", "application_cases", "application_events",
    "application_documents", "citizen_consents", "citizen_reminders",
    "automation_runs", "audit_events", "citizen_workspaces", "scheme_integrations",
}
if tables != required:
    raise SystemExit(f"Unexpected schema inventory. expected={sorted(required)} actual={sorted(tables)}")

for token in ("auth.uid()", "storage.buckets", "citizen-documents", "idempotency_key", "requires_human_confirmation"):
    if token not in sql:
        raise SystemExit(f"Missing required security/workflow control: {token}")

for forbidden in (
    'create policy "cases_update_own"',
    'create policy "documents_insert_own"',
    'create policy "citizen_documents_upload_own"',
):
    if forbidden in sql:
        raise SystemExit(f"Unsafe direct-write policy detected: {forbidden}")

if re.search(r"create policy[^;]+for all\b", sql, re.I | re.S):
    raise SystemExit("Broad FOR ALL policy is not allowed in the initial schema")

print(f"Database migration static checks passed: {len(tables)} public tables; RLS enabled on all.")

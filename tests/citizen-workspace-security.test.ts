import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

test("citizen workspace is tenant-isolated by auth.uid()", () => {
  const sql = read("supabase/migrations/20261109131533_add_authenticated_citizen_workspace.sql");
  assert.match(sql, /enable row level security/i);
  assert.ok(sql.includes("auth.uid()) = user_id"));
  const privacy = read("supabase/migrations/20261109135140_gate_cloud_storage_on_approved_consent.sql");
  assert.match(privacy, /revoke all on public\.citizen_workspaces from public,anon,authenticated/i);
});

test("workspace API derives identity from verified HttpOnly session", () => {
  const route = read("app/api/workspace/route.ts");
  const session = read("lib/supabase/rest.ts");
  assert.match(route, /getVerifiedSupabaseSession\(\)/);
  assert.match(route, /rpc\/get_citizen_workspace/);
  assert.match(route, /rpc\/save_citizen_workspace/);
  assert.doesNotMatch(route, /citizen_workspaces\?on_conflict/);
  assert.match(route, /Cross-origin request blocked/);
  assert.match(session, /httpOnly:\s*true/);
  assert.match(session, /secure:\s*process\.env\.NODE_ENV\s*===\s*"production"/);
  assert.match(session, /grant_type=refresh_token/);
});

test("browser authentication never receives a service-role credential", () => {
  const auth = read("app/api/auth/route.ts");
  const workspace = read("app/api/workspace/route.ts");
  assert.doesNotMatch(auth + workspace, /SUPABASE_SERVICE_ROLE_KEY|service_role/i);
  assert.match(auth, /auth\/v1\/user/);
  assert.match(auth, /Cross-origin request blocked/);
});

test("cloud workspace rejects unknown top-level fields and oversized payloads", () => {
  const route = read("app/api/workspace/route.ts");
  assert.match(route, /256 \* 1024/);
  assert.match(route, /Unsupported workspace field/);
  assert.match(route, /Unsupported language/);
  assert.match(route, /preferred_language/);
});

test("automation requests require independent scheme approval and purpose consent", () => {
  const sql = read("supabase/migrations/20261109134258_add_consent_gated_automation_queue.sql");
  assert.match(sql, /independently_approved/);
  assert.match(sql, /source_accuracy/);
  assert.match(sql, /eligibility_rule_accuracy/);
  assert.match(sql, /valid_purpose_specific_consent_required/);
  assert.match(sql, /requires_human_confirmation/);
  assert.match(sql, /government_adapter_not_authorized/);
});

test("background worker only executes internal preparation and reminders", () => {
  const sql = read("supabase/migrations/20261109134258_add_consent_gated_automation_queue.sql");
  assert.match(sql, /pgmq\.create\('janasetu_automation'\)/);
  assert.match(sql, /cron\.schedule\('janasetu-automation-worker'/);
  assert.match(sql, /v_run\.action_type = 'prepare_documents'/);
  assert.match(sql, /v_run\.action_type = 'schedule_reminder'/);
  assert.match(sql, /government_adapter_execution_not_enabled/);
  assert.match(sql, /revoke all on function public\.process_automation_queue\(integer\) from public, anon, authenticated, service_role/i);
});

test("citizen application APIs use the signed-in caller token", () => {
  const apps = read("app/api/applications/route.ts");
  const consents = read("app/api/consents/route.ts");
  const runs = read("app/api/automation/runs/route.ts");
  const confirm = read("app/api/automation/confirm/route.ts");
  const reminders = read("app/api/reminders/route.ts");
  for (const route of [apps,consents,runs,confirm]) {
    assert.match(route, /getVerifiedSupabaseSession\(\)/);
    assert.match(route, /Cross-origin request blocked/);
    assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
  }
  assert.match(reminders, /getVerifiedSupabaseSession\(\)/);
  assert.doesNotMatch(reminders, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("revoked consent cannot authorize a later automation run", () => {
  const consent = read("supabase/migrations/20261109135846_restore_guarded_consent_capture.sql");
  const confirm = read("supabase/migrations/20261109134847_restore_expiry_and_scope_check.sql");
  assert.match(consent, /update public\.citizen_consents set revoked_at = now\(\)/);
  assert.match(consent, /consent_scope_mismatch/);
  assert.match(confirm, /consent_scope_mismatch/);
  assert.match(confirm, /return p_run_id/);
});

test("cloud storage remains disabled until a legal-approved consent policy is active", () => {
  const sql = read("supabase/migrations/20261109135140_gate_cloud_storage_on_approved_consent.sql");
  const route = read("app/api/workspace/route.ts");
  assert.match(sql, /private\.consent_policy_versions/);
  assert.match(sql, /legal_review_reference is not null/);
  assert.match(sql, /profile_storage_consent_required/);
  assert.match(sql, /revoke all on public\.citizen_workspaces from public,anon,authenticated/);
  assert.match(route, /Cloud storage is disabled until the profile-storage privacy policy is legally approved/);
});

test("consent and reminder writes cannot bypass guarded RPCs", () => {
  const sql = read("supabase/migrations/20261109135345_restrict_direct_citizen_mutations.sql");
  assert.match(sql, /revoke insert, update, delete, truncate on public\.citizen_consents/);
  assert.match(sql, /revoke insert, update, delete, truncate on public\.profiles/);
  assert.match(sql, /revoke insert, update, delete, truncate on public\.citizen_reminders/);
});

test("application case persistence requires separate scheme-scoped profile consent", () => {
  const sql = read("supabase/migrations/20261109135647_separate_cloud_and_case_consent.sql");
  const route = read("app/api/applications/route.ts");
  assert.match(sql, /p_consent_id uuid/);
  assert.match(sql, /purpose = 'profile_storage'/);
  assert.match(sql, /create_application_case/);
  assert.match(sql, /consent_scope_mismatch/);
  assert.match(route, /consent_id/);
  assert.match(route, /p_consent_id/);
});

test("cloud synchronization uses its own consent purpose", () => {
  const sql = read("supabase/migrations/20261109135647_separate_cloud_and_case_consent.sql");
  assert.match(sql, /cloud_workspace_sync/);
  assert.match(sql, /has_active_citizen_consent\(v_user,'cloud_workspace_sync',null\)/);
});

test("consent capture validates exact purpose scope and legal approval", () => {
  const sql = read("supabase/migrations/20261109135846_restore_guarded_consent_capture.sql");
  assert.match(sql, /cloud_workspace_sync/);
  assert.match(sql, /consent_policy_not_approved/);
  assert.match(sql, /consent_scope_mismatch/);
  assert.match(sql, /update public\.citizen_consents set revoked_at = now\(\)/);
  assert.match(sql, /create_application_case/);
  assert.match(sql, /workspace_sync/);
});

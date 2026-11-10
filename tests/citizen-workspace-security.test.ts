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

test("source refresh seeds schemes as pending and never self-approves them", () => {
  const sql = read("supabase/migrations/20261109140729_seed_four_source_checked_schemes.sql");
  assert.match(sql, /publication_status='review_pending'/);
  assert.match(sql, /'source_checked'/);
  assert.match(sql, /pm-kisan/);
  assert.match(sql, /pmay-u-2/);
  assert.match(sql, /pm-ujjwala/);
  assert.match(sql, /pm-usp-csss/);
  assert.doesNotMatch(sql, /insert into public\.scheme_approvals/i);
});

test("scheme publication requires independent source, rule, legal and publisher roles", () => {
  const sql = read("supabase/migrations/20261109140923_add_independent_scheme_review_workflow.sql");
  const separation = read("supabase/migrations/20261109141005_enforce_reviewer_independence.sql");
  assert.match(sql, /source_reviewer/);
  assert.match(sql, /rules_reviewer/);
  assert.match(sql, /legal_reviewer/);
  assert.match(sql, /scheme_publisher/);
  assert.match(sql, /approval_type = 'legal_review'/);
  assert.match(sql, /independently_approved/);
  assert.match(separation, /reviewer_role_separation_violation/);
  assert.match(separation, /publisher_must_be_independent/);
});

test("review endpoints use verified caller sessions and no service-role secret", () => {
  const queue = read("app/api/review/queue/route.ts");
  const decision = read("app/api/review/decision/route.ts");
  const publish = read("app/api/review/publish/route.ts");
  assert.match(queue, /getVerifiedSupabaseSession/);
  for (const route of [decision,publish]) {
    assert.match(route, /getVerifiedSupabaseSession/);
    assert.match(route, /Cross-origin request blocked/);
  }
  for (const route of [queue,decision,publish]) assert.doesNotMatch(route,/SUPABASE_SERVICE_ROLE_KEY/);
});

test("citizen document upload is purpose-consent gated and quarantined until scan attestation", () => {
  const upload = read("supabase/migrations/20261110180702_add_consent_gated_document_quarantine.sql");
  const policies = read("supabase/migrations/20261110180724_fix_document_storage_policy_permissions.sql");
  const route = read("app/api/documents/route.ts");
  assert.match(upload, /purpose='document_storage'/);
  assert.match(upload, /consent_policy_not_approved/);
  assert.match(upload, /scan_status='quarantined'/);
  assert.match(upload, /scan_status='clean'/);
  assert.match(upload, /document_scanner_roles/);
  assert.match(policies, /can_upload_citizen_document/);
  assert.match(policies, /can_read_citizen_document/);
  assert.match(route, /getVerifiedSupabaseSession/);
  assert.match(route, /downloadable:false/);
  assert.match(route, /Maximum document size is 12 MB/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
});


test("document scanner claims are leased and quarantine reads are restricted", () => {
  const sql = read("supabase/migrations/20261110185200_add_leased_clamav_document_scanner.sql");
  const worker = read("services/document-scanner/worker.py");
  const compose = read("services/document-scanner/docker-compose.yml");
  assert.match(sql, /for update skip locked/i);
  assert.match(sql, /scanner_lease_until/);
  assert.match(sql, /scan_attempts < 5/);
  assert.match(sql, /scanner_role_required/);
  assert.match(sql, /document_scan_lease_invalid/);
  assert.match(sql, /private\.can_read_citizen_document/);
  assert.match(worker, /storage\/v1\/object\/authenticated/);
  assert.match(worker, /zINSTREAM/);
  assert.match(worker, /48 \* 60 \* 60/);
  assert.doesNotMatch(worker, /SUPABASE_SERVICE_ROLE_KEY|VirusTotal/);
  assert.doesNotMatch(compose, /ports:/);
});


test("clean document retrieval is owner- and consent-checked before streaming", () => {
  const sql = read("supabase/migrations/20261110185906_secure_clean_document_retrieval.sql");
  const route = read("app/api/documents/route.ts");
  assert.match(sql, /scan_status='clean'/);
  assert.match(sql, /document_storage/);
  assert.match(sql, /revoked_at is null/);
  assert.match(sql, /legal_review_reference is not null/);
  assert.match(route, /get_citizen_document_download/);
  assert.match(route, /storage\/v1\/object\/authenticated/);
  assert.match(route, /Content-Disposition/);
  assert.match(route, /Cache-Control.*no-store/);
  assert.match(route, /X-Content-Type-Options/);
  assert.match(route, /bytes\.byteLength!==size/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
});

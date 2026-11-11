import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");

test("private document storage rechecks exact active consent on every read",()=>{
 const migration=read("supabase/migrations/20261111131254_enforce_document_consent_on_storage_reads.sql");
 assert.match(migration,/private\.can_read_citizen_document/);
 assert.match(migration,/private\.has_active_citizen_consent\(d\.user_id,'document_storage',d\.case_id\)/);
 assert.match(migration,/c\.scope->>'action_type'='upload_document'/);
 assert.match(migration,/c\.scope->>'scheme_version_id'=a\.scheme_version_id::text/);
 assert.match(migration,/p\.active=true/);
 assert.match(migration,/p\.legal_review_reference is not null/);
 assert.match(migration,/captured_at>now\(\)-interval '365 days'/);
});

test("scanner storage reads are limited to the active lease and SHA-256 attestation",()=>{
 const migration=read("supabase/migrations/20261111131521_bind_scanner_reads_to_claim_and_validate_attestations.sql");
 assert.ok(migration.includes("d.scan_status='scanning'"));
 assert.ok(migration.includes("d.scanner_user_id=auth.uid()"));
 assert.ok(migration.includes("r.active=true"));
 assert.ok(migration.includes("p_engine !~ '^ClamAV [0-9]'"));
 assert.ok(migration.includes("p_signature !~ '^[a-f0-9]{64}$'"));
});

test("consent revocation prevents further scans and queues private object deletion",()=>{
 const migration=read("supabase/migrations/20261111133755_consent_aware_scanner_cleanup_and_citizen_document_deletion.sql");
 const completion=read("supabase/migrations/20261111133809_complete_revoked_document_storage_cleanup.sql");
 const worker=read("services/document-scanner/worker.py");
 assert.match(migration,/consent_revoked/);
 assert.match(migration,/cleanup_only/);
 assert.match(migration,/has_active_document_storage_consent/);
 assert.match(migration,/can_delete_revoked_citizen_document/);
 assert.match(migration,/scanner_lease_until/);
 assert.match(completion,/complete_revoked_document_cleanup/);
 assert.match(worker,/cleanup_only/);
 assert.match(worker,/delete_storage_object/);
 assert.match(worker,/complete_revoked_cleanup/);
});

test("citizens can delete their own documents after storage removal and same-origin verification",()=>{
 const route=read("app/api/documents/[documentId]/route.ts");
 assert.match(route,/export async function DELETE/);
 assert.match(route,/get_citizen_document_delete_target/);
 assert.match(route,/method:"DELETE"/);
 assert.match(route,/complete_citizen_document_delete/);
 assert.match(route,/Cross-origin document deletion is not allowed/);
 assert.match(route,/storageResponse\.status!==404/);
});

test("document download API uses guarded metadata and authenticated private object endpoint",()=>{
 const route=read("app/api/documents/[documentId]/route.ts");
 assert.match(route,/get_clean_citizen_document/);
 assert.match(route,/object\/authenticated\/citizen-documents/);
 assert.match(route,/getVerifiedSupabaseSession\(\)/);
 assert.match(route,/bytes\.byteLength!==metadata\.size/);
 assert.doesNotMatch(route,/SUPABASE_SERVICE_ROLE_KEY/);
});

test("scanner service is private, signature-fresh and fails closed",()=>{
 const worker=read("services/document-scanner/worker.py");
 const compose=read("services/document-scanner/docker-compose.yml");
 const entrypoint=read("services/document-scanner/entrypoint.sh");
 assert.match(worker,/clamav_database_is_fresh/);
 assert.match(worker,/MAX_DOCUMENT_BYTES/);
 assert.match(worker,/scan_error/);
 assert.match(worker,/object\/authenticated\/citizen-documents/);
 assert.match(compose,/read_only: true/);
 assert.match(compose,/cap_drop:/);
 assert.match(compose,/cap_add:[\\s\\S]*CHOWN[\\s\\S]*SETUID[\\s\\S]*SETGID/);
 assert.doesNotMatch(compose,/ports:/);
 assert.match(entrypoint,/freshclam/);
});

test("latest scanner claim preserves consent-revoked deletion and bounded retry semantics",()=>{
 const latest=read("supabase/migrations/20261111150000_restore_scanner_cleanup_and_global_function_defaults.sql");
 assert.match(latest,/alter default privileges for role postgres revoke execute on functions from public/i);
 assert.match(latest,/scan_status='consent_revoked'/);
 assert.match(latest,/scan_status='deleting'/);
 assert.match(latest,/cleanup_only',true/);
 assert.match(latest,/has_active_document_storage_consent/);
 assert.match(latest,/scan_attempts>=5/);
 assert.match(latest,/interval '15 minutes'/);
 assert.match(latest,/security invoker/i);
});

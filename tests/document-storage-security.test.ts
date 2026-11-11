import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");

test("private document storage rechecks exact active consent on every read",()=>{
 const migration=read("supabase/migrations/20261111142000_enforce_document_consent_on_storage_reads.sql");
 assert.match(migration,/private\.can_read_citizen_document/);
 assert.match(migration,/private\.has_active_citizen_consent\(d\.user_id,'document_storage',d\.case_id\)/);
 assert.match(migration,/c\.scope->>'action_type'='upload_document'/);
 assert.match(migration,/c\.scope->>'scheme_version_id'=a\.scheme_version_id::text/);
 assert.match(migration,/p\.active=true/);
 assert.match(migration,/p\.legal_review_reference is not null/);
 assert.match(migration,/captured_at>now\(\)-interval '365 days'/);
});

test("scanner storage reads are limited to the active lease and SHA-256 attestation",()=>{
 const migration=read("supabase/migrations/20261111143000_bind_scanner_reads_to_claim_and_validate_attestations.sql");
 assert.match(migration,/d\\.scan_status='scanning'/);
 assert.match(migration,/d\\.scanner_user_id=auth\\.uid\\(\\)/);
 assert.match(migration,/r\\.active=true/);
 assert.match(migration,/ClamAV/);
 assert.match(migration,/a-f0-9/);
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
 assert.doesNotMatch(compose,/ports:/);
 assert.match(entrypoint,/freshclam/);
});

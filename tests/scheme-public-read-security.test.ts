import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");

test("anonymous scheme reads are limited to current independently approved published versions",()=>{
 const policy=read("supabase/migrations/20261111131906_expose_only_published_approved_scheme_versions.sql");
 const cleanup=read("supabase/migrations/20261111131937_remove_legacy_unreviewed_scheme_read_policies.sql");
 assert.match(policy,/to anon,authenticated/);
 assert.match(policy,/publication_status='published'/);
 assert.match(policy,/verification_status='independently_approved'/);
 assert.match(policy,/s\.current_version_id=scheme_versions\.id/);
 assert.match(policy,/sv\.source_id=scheme_sources\.id/);
 assert.match(cleanup,/drop policy if exists scheme_versions_read_published/);
 assert.match(cleanup,/drop policy if exists scheme_sources_read_published/);
 assert.match(cleanup,/drop policy if exists schemes_read_published/);
 const content=read("lib/public-scheme-content.ts");
 assert.match(content,/isWithinSchemeEffectivePeriod\(version\.effective_from,version\.effective_to\)/);
 assert.match(content,/isApprovedRuleSetForPublication\(value\)/);
 assert.match(content,/sourceCheckedAt:source\?\.last_checked_at\|\|null/);
});

test("scheme review approvals bind the immutable rule set into the version hash",()=>{
 const migration=read("supabase/migrations/20261111161622_bind_scheme_approvals_to_rule_set_hash.sql");
 assert.match(migration,/jsonb_build_object\('content',NEW\.content,'rule_set',NEW\.rule_set\)/);
 assert.match(migration,/scheme_version_immutable_after_review/);
 assert.match(migration,/scheme_versions_content_sha256_integrity_check/);
 assert.match(migration,/before insert or update on public\.scheme_versions/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("encrypted workspace sync cannot overwrite legacy citizen workspace fields", () => {
  const sql = readFileSync(
    "supabase/migrations/20261112060000_harden_encrypted_workspace_legacy_preservation.sql",
    "utf8"
  );

  assert.match(sql, /legacy_workspace_data_present/);
  assert.match(sql, /coalesce\(application_drafts, '\[\]'::jsonb\) = '\[\]'::jsonb/);
  assert.match(sql, /coalesce\(document_refs, '\[\]'::jsonb\) = '\[\]'::jsonb/);
  assert.match(sql, /coalesce\(reminders, '\[\]'::jsonb\) = '\[\]'::jsonb/);
  assert.match(sql, /coalesce\(assessments, '\[\]'::jsonb\) = '\[\]'::jsonb/);
  assert.match(sql, /\\(coalesce\\(profile_data, '\\{\\}'::jsonb\\) - 'encrypted_workspace_v1'\\) = '\\{\\}'::jsonb/);
  assert.doesNotMatch(sql, /set preferred_language\s*=/i);
  assert.doesNotMatch(sql, /set application_drafts\s*=/i);
  assert.doesNotMatch(sql, /set document_refs\s*=/i);
  assert.doesNotMatch(sql, /set reminders\s*=/i);
  assert.doesNotMatch(sql, /set assessments\s*=/i);
  assert.match(sql, /profile_data = \(coalesce\(profile_data, '\{\}'::jsonb\) - 'encrypted_workspace_v1'\)/);
});

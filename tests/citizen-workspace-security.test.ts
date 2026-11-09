import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

test("citizen workspace is tenant-isolated by auth.uid()", () => {
  const sql = read("supabase/migrations/20261109131533_add_authenticated_citizen_workspace.sql");
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /auth\.uid\(\)\s*=\s*user_id/i);
  assert.match(sql, /grant select, insert, update on public\.citizen_workspaces to authenticated/i);
  assert.match(sql, /revoke all on public\.citizen_workspaces from anon, public/i);
});

test("workspace API derives identity from verified HttpOnly session", () => {
  const route = read("app/api/workspace/route.ts");
  const session = read("lib/supabase/rest.ts");
  assert.match(route, /getVerifiedSupabaseSession\(\)/);
  assert.match(route, /user_id: session\.user\.id/);
  assert.doesNotMatch(route, /input\.user_id/);
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

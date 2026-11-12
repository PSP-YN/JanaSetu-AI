import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/api/automation/plan/route.ts", "utf8");

test("automation planner is same-origin and authenticated", () => {
  assert.match(route, /request\.headers\.get\("origin"\) !== request\.nextUrl\.origin/);
  assert.match(route, /getVerifiedSupabaseSession\(\)/);
  assert.match(route, /Sign in required/);
});

test("planner accepts only a scheme slug and citizen profile, not client eligibility claims", () => {
  assert.match(route, /\["scheme_slug", "profile"\]/);
  assert.match(route, /parseCitizenProfile\(input\.profile\)/);
  assert.match(route, /assessApprovedScheme\(profile, approved\.model\)/);
  assert.doesNotMatch(route, /input\.eligibility/);
});

test("planner requires a currently published scheme version and never persists the submitted profile", () => {
  assert.match(route, /publication_status: "eq\.published"/);
  assert.match(route, /current_version_id/);
  assert.match(route, /verification_status/);
  assert.match(route, /mode: "plan_only"/);
  assert.match(route, /does not persist the profile/);
  assert.doesNotMatch(route, /\.insert\(/);
  assert.doesNotMatch(route, /\.update\(/);
});

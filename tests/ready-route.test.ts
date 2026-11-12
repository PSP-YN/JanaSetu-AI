import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET } from "../app/api/ready/route";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalFetch = global.fetch;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  global.fetch = originalFetch;
});

test("readiness fails closed when Supabase configuration is missing", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ready, false);
  assert.equal(body.status, "misconfigured");
  assert.equal(body.checks.supabaseConfiguration, false);
});

test("readiness separates database health from scheme and portal release gates", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_test";
  global.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/rest/v1/schemes");
    assert.equal(url.searchParams.get("publication_status"), "eq.published");
    assert.equal(new Headers(init?.headers).get("apikey"), "sb_publishable_test");
    return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
  };

  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ready, true);
  assert.equal(body.checks.databaseReachable, true);
  assert.equal(body.capabilities.publishedSchemes, 0);
  assert.equal(body.capabilities.applicationPreparation, false);
  assert.equal(body.capabilities.governmentPortalAutomation, "disabled_pending_department_authorization");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("readiness reports dependency failure without leaking upstream response data", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_test";
  global.fetch = async () => new Response("sensitive upstream detail", { status: 503 });

  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ready, false);
  assert.equal(body.status, "dependency_unavailable");
  assert.equal(JSON.stringify(body).includes("sensitive upstream detail"), false);
});

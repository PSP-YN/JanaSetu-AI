import test from "node:test";
import assert from "node:assert/strict";
import { getPublicScheme, listPublicSchemes } from "@/lib/public-scheme-content";

test("public scheme pages fail closed and remain buildable when Supabase is unavailable", async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const previousFetch = globalThis.fetch;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://offline.invalid";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
    globalThis.fetch = (async () => { throw new TypeError("simulated database outage"); }) as typeof fetch;

    assert.deepEqual(await listPublicSchemes(), []);
    assert.equal(await getPublicScheme("pm-kisan"), null);

    let call = 0;
    globalThis.fetch = (async () => {
      call += 1;
      if (call === 1) {
        return new Response(JSON.stringify([{
          id: "00000000-0000-4000-8000-000000000001",
          slug: "pm-kisan",
          name: "PM-KISAN",
          category: "Agriculture",
          level: "central",
          state_code: null,
          current_version_id: "00000000-0000-4000-8000-000000000002"
        }]), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response("upstream unavailable", { status: 503 });
    }) as typeof fetch;

    // A partial catalogue response is never published as a verified guide.
    assert.deepEqual(await listPublicSchemes(), []);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
  }
});

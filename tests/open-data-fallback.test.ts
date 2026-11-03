import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { GET } from "../app/api/schemes/open-data/route";

test("open-data catalogue falls back to page filtering when HF search is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    calls.push(url.pathname);
    if (url.pathname.endsWith("/search")) {
      return new Response(JSON.stringify({ error: "HF Hub authentication timed out" }), { status: 500 });
    }
    assert.ok(url.pathname.endsWith("/rows"), "fallback should request paginated rows");
    return new Response(JSON.stringify({
      num_rows_total: 4693,
      rows: [
        { row: { slug: "education-aid", name: "Education Support Scheme", description: "College fee support", state: "India" } },
        { row: { slug: "maternity-aid", name: "Maternity Assistance", description: "Health support", state: "India" } }
      ]
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const request = new NextRequest("http://localhost/api/schemes/open-data?q=education&offset=0&limit=2");
    const response = await GET(request);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.searchMode, "page-filter");
    assert.equal(body.records.length, 1);
    assert.equal(body.records[0].id, "open-education-aid");
    assert.equal(body.nextOffset, 2, "pagination must advance based on fetched rows, not filtered matches");
    assert.match(body.searchFallbackWarning, /page only/i);
    assert.deepEqual(calls, ["/search", "/rows"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

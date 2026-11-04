import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { GET } from "../app/api/schemes/open-data/route";

test("open-data search covers the complete bundled index, not only the first page", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamCalls = 0;
  globalThis.fetch = async () => { upstreamCalls += 1; throw new Error("Upstream search is unavailable"); };
  try {
    const request = new NextRequest("http://localhost/api/schemes/open-data?q=zupda%20vijlikaran&offset=0&limit=50");
    const response = await GET(request);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.searchMode, "local-full-index");
    assert.equal(body.searchFallbackWarning, true);
    assert.equal(body.searchFallbackReason, "publisher_search_endpoint_unavailable");
    assert.equal(body.catalogueTotal, 4693);
    assert.equal(body.total, 1);
    assert.equal(body.records.length, 1);
    assert.equal(body.records[0].id, "open-zvy");
    assert.equal(body.records[0].catalogueStatus, "catalogue-only");
    assert.equal(body.nextOffset, null);
    assert.equal(body.freshness, "stale");
    assert.equal(upstreamCalls, 0, "search must not depend on the broken upstream /search endpoint");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("open-data browse paginates the full local index", async () => {
  const request = new NextRequest("http://localhost/api/schemes/open-data?offset=100&limit=50");
  const response = await GET(request);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.searchMode, "local-browse");
  assert.equal(body.total, 4693);
  assert.equal(body.records.length, 50);
  assert.equal(body.nextOffset, 150);
  assert.equal(body.offset, 100);
});

test("open-data category filter is applied across the full index", async () => {
  const request = new NextRequest("http://localhost/api/schemes/open-data?category=Utility%20%26%20Sanitation&offset=0&limit=100");
  const response = await GET(request);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(body.total > 0);
  assert.ok(body.records.every((record: { tags: string[] }) => record.tags.includes("Utility & Sanitation")));
});


test("open-data category aliases match broad built-in category labels", async () => {
  const request = new NextRequest("http://localhost/api/schemes/open-data?category=Agriculture&offset=0&limit=100");
  const response = await GET(request);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(body.total > 0);
  assert.ok(body.records.every((record: { tags: string[] }) => record.tags.some((tag) => tag.toLowerCase().includes("agriculture"))));
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/api/sources/health/route";
import snapshotMetadata from "../data/smartduke-snapshot-meta.json";
import { loadSmartDukeRows } from "../lib/smartduke-snapshot";

function mockFetch(searchStatus = 500, metadataSha = snapshotMetadata.revision) {
  return async (input: RequestInfo | URL) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (url.hostname === "huggingface.co") {
      return new Response(JSON.stringify({ sha: metadataSha, lastModified: "2026-07-06T12:09:35.000Z" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.hostname === "datasets-server.huggingface.co" && url.pathname.endsWith("/search")) {
      return new Response(JSON.stringify({ error: "Hub auth timeout" }), { status: searchStatus, headers: { "content-type": "application/json" } });
    }
    if (url.hostname === "datasets-server.huggingface.co" && url.pathname.endsWith("/rows")) {
      return new Response(JSON.stringify({ rows: [{ row: { slug: "test" } }] }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response("not found", { status: 404 });
  };
}

test("source monitor reports local full-index search while upstream search is unavailable and snapshot is stale", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(500);
  try {
    const response = await GET();
    const report = await response.json();
    const source = report.sources.find((item: { id: string }) => item.id === "smartduke-scheme-catalogue");
    assert.equal(source.availability, "available");
    assert.equal(source.searchAvailability, "unavailable");
    assert.equal(source.rowsAvailability, "available");
    assert.equal(source.searchFallback, "bundled-full-index");
    assert.equal(source.localIndexAvailability, "available");
    assert.equal(source.indexedRows, 4693);
    assert.equal(source.freshness, "stale");
    assert.equal(source.updateAvailable, false);
    const official = report.sources.find((item: { id: string }) => item.id === "official-myscheme");
    assert.equal(official.publicCatalogueBenchmark.totalAdvertised, "5150+");
    assert.equal(official.publicCatalogueBenchmark.languagesAdvertised, 15);
    assert.equal(official.publicCatalogueBenchmark.languageSource, "https://www.myscheme.gov.in/faqs");
    assert.equal(report.overall, "attention_required");
    assert.equal(report.curatedCatalogue.status, "available_with_review_limits");
    assert.equal(report.curatedCatalogue.totalBuiltInRecords, 142);
    assert.equal(report.curatedCatalogue.sourceLinkedSchemeReferences, 46);
    assert.equal(report.curatedCatalogue.rulePrototypesPendingIndependentApproval, 4);
    assert.equal(report.curatedCatalogue.catalogueOnlySchemeReferences, 42);
    assert.equal(report.curatedCatalogue.budgetLineItemLeadsNotConfirmedSchemes, 96);
    assert.equal(report.curatedCatalogue.sourceCheckDateRange.earliest, "2026-11-02");
    assert.equal(report.curatedCatalogue.sourceCheckDateRange.latest, "2026-11-12");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("source monitor detects a newer publisher revision without silently replacing the local index", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(500, "new-publisher-revision");
  try {
    const response = await GET();
    const report = await response.json();
    const source = report.sources.find((item: { id: string }) => item.id === "smartduke-scheme-catalogue");
    assert.equal(source.updateAvailable, true);
    assert.equal(source.indexedRevision, snapshotMetadata.revision);
    assert.equal(source.latestRevision, "new-publisher-revision");
    assert.equal(report.overall, "attention_required");
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("bundled discovery snapshot passes its SHA-256 manifest, revision, row-count and unique-ID checks", () => {
  const rows = loadSmartDukeRows();
  assert.equal(rows.length, snapshotMetadata.rowsTotal);
  assert.equal(new Set(rows.map((row) => row.slug)).size, snapshotMetadata.rowsTotal);
});

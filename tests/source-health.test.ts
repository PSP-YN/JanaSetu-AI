import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/api/sources/health/route";

test("source monitor reports Hugging Face search outage and fallback status", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (url.hostname === "huggingface.co") return new Response("{}", { status: 200 });
    if (url.hostname === "datasets-server.huggingface.co" && url.pathname.endsWith("/search")) {
      return new Response(JSON.stringify({ error: "Hub auth timeout" }), { status: 500 });
    }
    return new Response("not found", { status: 404 });
  };
  try {
    const response = await GET();
    const report = await response.json();
    const source = report.sources.find((item: { id: string }) => item.id === "smartduke-scheme-catalogue");
    assert.equal(source.availability, "available", "dataset metadata endpoint can still be reachable");
    assert.equal(source.searchAvailability, "unavailable", "search API outage should be visible independently");
    assert.equal(source.searchFallback, "page-filter");
    assert.equal(report.overall, "attention_required");
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("source monitor treats HTTP 200 with an invalid search JSON body as unavailable", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (url.hostname === "huggingface.co") return new Response("{}", { status: 200 });
    if (url.hostname === "datasets-server.huggingface.co" && url.pathname.endsWith("/search")) {
      return new Response("not-json", { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response("not found", { status: 404 });
  };
  try {
    const response = await GET();
    const report = await response.json();
    const source = report.sources.find((item: { id: string }) => item.id === "smartduke-scheme-catalogue");
    assert.equal(source.searchStatus, 200);
    assert.equal(source.searchAvailability, "unavailable", "a successful HTTP status is not enough when the body cannot be parsed");
    assert.equal(report.overall, "attention_required");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

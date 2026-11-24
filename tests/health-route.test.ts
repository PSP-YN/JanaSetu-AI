import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "@/app/api/health/route";

test("health endpoint reports liveness separately from dependency readiness", async () => {
  const response = await GET();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, "janasetu-web");
  assert.equal(body.status, "ok");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

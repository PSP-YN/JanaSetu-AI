import test from "node:test";
import assert from "node:assert/strict";
import { readJsonObjectBody } from "@/lib/request";

test("streamed JSON object reader accepts a valid bounded object", async () => {
  const request = new Request("https://janasetu.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "test" })
  });
  const result = await readJsonObjectBody(request, 128);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, { action: "test" });
});

test("streamed JSON object reader rejects arrays and scalar JSON", async () => {
  for (const body of ["[]", "null", "42", "\"text\""]) {
    const request = new Request("https://janasetu.test/api", { method: "POST", body });
    const result = await readJsonObjectBody(request, 128);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.response.status, 400);
  }
});

test("streamed JSON object reader cancels an oversized chunked request before buffering it all", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("{\"value\":\"" + "x".repeat(80)));
      controller.enqueue(new TextEncoder().encode("x".repeat(80) + "\"}"));
    },
    cancel() { cancelled = true; }
  });
  const request = new Request("https://janasetu.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stream,
    duplex: "half"
  } as RequestInit & { duplex: "half" });
  const result = await readJsonObjectBody(request, 64, "Test body too large.");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 413);
    assert.deepEqual(await result.response.json(), { error: "Test body too large." });
  }
  assert.equal(cancelled, true);
});

import { test, expect } from "@playwright/test";

test("encrypted workspace restore requires an authenticated citizen session", async ({ request }) => {
  const response = await request.get("/api/workspace/sync");
  expect(response.status()).toBe(401);
});

test("workspace sync rejects cross-origin writes", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: "https://attacker.example", "content-type": "application/json" },
    data: { vault: {} }
  });
  expect(response.status()).toBe(403);
});

test("workspace sync rejects plaintext profile payloads", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: "http://127.0.0.1:3000", "content-type": "application/json" },
    data: { profile: { display_name: "Synthetic Citizen" } }
  });
  expect(response.status()).toBe(400);
});

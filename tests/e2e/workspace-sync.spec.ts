import { test, expect } from "@playwright/test";

const base = "http://127.0.0.1:3003";
const validEnvelope = {
  magic: "JANASETU-VAULT",
  version: 1,
  kdf: "PBKDF2-SHA-256",
  iterations: 600000,
  cipher: "AES-256-GCM",
  salt: "AAAAAAAAAAAAAAAAAAAAAA==",
  iv: "AAAAAAAAAAAAAAAA",
  ciphertext: "AAAAAAAAAAAAAAAAAAAAAA=="
};

test("encrypted workspace restore requires an authenticated citizen session", async ({ request }) => {
  const response = await request.get("/api/workspace/sync");
  expect([401, 503]).toContain(response.status());
});

test("workspace sync rejects cross-origin writes", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: "https://attacker.example", "content-type": "application/json" },
    data: { vault: validEnvelope, expected_revision: 0 }
  });
  expect(response.status()).toBe(403);
});

test("workspace sync rejects plaintext profile payloads", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: base, "content-type": "application/json" },
    data: { profile: { display_name: "Synthetic Citizen" } }
  });
  expect(response.status()).toBe(400);
});

test("workspace sync rejects malformed JSON", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: base, "content-type": "application/json" },
    data: "{"
  });
  expect(response.status()).toBe(400);
});

test("valid encrypted payload still requires authentication", async ({ request }) => {
  const response = await request.put("/api/workspace/sync", {
    headers: { origin: base, "content-type": "application/json" },
    data: { vault: validEnvelope, expected_revision: 0 }
  });
  expect([401, 503]).toContain(response.status());
});

test("legacy plaintext workspace endpoint is permanently retired", async ({ request }) => {
  const get = await request.get("/api/workspace");
  const put = await request.put("/api/workspace", {
    headers: { origin: base, "content-type": "application/json" },
    data: { profile_data: { fullName: "Synthetic Citizen" } }
  });
  expect(get.status()).toBe(410);
  expect(put.status()).toBe(410);
});

test("sync policy status requires authentication", async ({ request }) => {
  const response = await request.get("/api/workspace/sync/status");
  expect([401, 503]).toContain(response.status());
});

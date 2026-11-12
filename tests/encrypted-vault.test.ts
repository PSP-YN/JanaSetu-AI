import test from "node:test";
import assert from "node:assert/strict";
import { encryptVault, decryptVault } from "../lib/encrypted-vault";

test("encrypted vault round-trips structured workspace data without exposing plaintext", async () => {
  const payload = { preferred_language: "kn", assessments: [{ scheme: "synthetic-scheme", outcome: "needs_review" }], application_drafts: [{ status: "awaiting_citizen_review" }], document_refs: [], reminders: [] };
  const blob = await encryptVault(payload, "synthetic-test-password-2026");
  const text = await blob.text();
  assert.equal(text.includes("synthetic-scheme"), false);
  const file = new File([blob], "demo.janasetu");
  assert.deepEqual(await decryptVault(file, "synthetic-test-password-2026"), payload);
});

test("each vault encryption uses a fresh salt and IV", async () => {
  const first = JSON.parse(await (await encryptVault({ value: "synthetic" }, "synthetic-test-password-2026")).text());
  const second = JSON.parse(await (await encryptVault({ value: "synthetic" }, "synthetic-test-password-2026")).text());
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
});

test("encrypted vault rejects a wrong password", async () => {
  const blob = await encryptVault({ app: "JanaSetu" }, "synthetic-test-password-2026");
  const file = new File([blob], "demo.janasetu");
  await assert.rejects(() => decryptVault(file, "incorrect-password-2026"), /Incorrect password|integrity check/);
});

test("encrypted vault rejects tampered ciphertext", async () => {
  const blob = await encryptVault({ app: "JanaSetu" }, "synthetic-test-password-2026");
  const envelope = JSON.parse(await blob.text());
  const changed = envelope.ciphertext.slice(0, -4) + "AAAA";
  const file = new File([JSON.stringify({ ...envelope, ciphertext: changed })], "tampered.janasetu");
  await assert.rejects(() => decryptVault(file, "synthetic-test-password-2026"), /Incorrect password|integrity check/);
});

test("encrypted vault requires a 12-character password", async () => {
  await assert.rejects(() => encryptVault({}, "short"), /at least 12 characters/);
});

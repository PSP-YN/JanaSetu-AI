import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";

const source = readFileSync(new URL("../extension/vault.js", import.meta.url), "utf8");
function loadVault() {
  const context: Record<string, unknown> = {
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    btoa: (value: string) => Buffer.from(value, "binary").toString("base64"),
    atob: (value: string) => Buffer.from(value, "base64").toString("binary"),
    isValidProfile: (value: unknown) => !!value && typeof value === "object" && !Array.isArray(value) && (value as { marker?: unknown }).marker === "synthetic-test-profile"
  };
  context.globalThis = context;
  runInNewContext(source, context);
  return context.JanaSetuVault as {
    encryptProfile(profile: unknown, password: string): Promise<Record<string, unknown>>;
    decryptProfile(envelope: Record<string, unknown>, password: string): Promise<unknown>;
  };
}

test("extension vault encrypts profiles with AES-GCM and round-trips valid profile data", async () => {
  const vault = loadVault();
  const profile = { marker: "synthetic-test-profile", fullName: "Synthetic Citizen", mobileNumber: "9000000000" };
  const envelope = await vault.encryptProfile(profile, "synthetic-passphrase-2026");
  assert.equal(envelope.magic, "JANASETU-EXTENSION-VAULT");
  assert.equal(envelope.cipher, "AES-256-GCM");
  assert.equal(envelope.kdf, "PBKDF2-SHA-256");
  assert.equal(JSON.stringify(envelope).includes("Synthetic Citizen"), false);
  assert.equal(JSON.stringify(await vault.decryptProfile(envelope, "synthetic-passphrase-2026")), JSON.stringify(profile));
});

test("extension vault uses fresh salt and nonce for every encryption", async () => {
  const vault = loadVault();
  const profile = { marker: "synthetic-test-profile" };
  const first = await vault.encryptProfile(profile, "synthetic-passphrase-2026");
  const second = await vault.encryptProfile(profile, "synthetic-passphrase-2026");
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.iv, second.iv);
});

test("extension vault rejects wrong passphrases and modified ciphertext", async () => {
  const vault = loadVault();
  const envelope = await vault.encryptProfile({ marker: "synthetic-test-profile" }, "synthetic-passphrase-2026");
  await assert.rejects(vault.decryptProfile(envelope, "another-passphrase-2026"), /Incorrect passphrase|integrity/);
  const tampered = { ...envelope, ciphertext: String(envelope.ciphertext).replace(/^./, String(envelope.ciphertext).startsWith("A") ? "B" : "A") };
  await assert.rejects(vault.decryptProfile(tampered, "synthetic-passphrase-2026"));
});

test("extension vault rejects weak passphrases and malformed envelopes", async () => {
  const vault = loadVault();
  await assert.rejects(vault.encryptProfile({ marker: "synthetic-test-profile" }, "short"), /12 and 256/);
  await assert.rejects(vault.decryptProfile({ magic: "JANASETU-EXTENSION-VAULT", version: 1 }, "synthetic-passphrase-2026"));
});

test("extension stores only encrypted profile envelopes and requires unlock before autofill", () => {
  const popup = readFileSync(new URL("../extension/popup.js", import.meta.url), "utf8");
  const html = readFileSync(new URL("../extension/popup.html", import.meta.url), "utf8");
  assert.match(popup, /encryptedProfile:\s*envelope/);
  assert.doesNotMatch(popup, /storage\.local\.set\(\{\s*profile\s*,/);
  assert.match(popup, /const profile=unlockedProfile/);
  assert.match(popup, /if\(!profile\)\{say\("profileFirst"\);setVaultStatus/);
  assert.match(popup, /chrome\.storage\.local\.remove\(\["profile", "importedAt"\]\)/);
  assert.match(html, /id="vault-password"[^>]*type="password"/);
  assert.match(html, /id="vault-unlock"/);
  assert.match(html, /id="vault-lock"/);
  assert.match(html, /<script src="vault.js"><\/script>/);
});

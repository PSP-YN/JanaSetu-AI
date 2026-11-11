import test from "node:test";
import assert from "node:assert/strict";
import { encryptVault, decryptVault } from "../lib/encrypted-vault";

test("encrypted vault round-trips payload and does not expose plaintext", async () => {
  const payload = { app: "JanaSetu", citizen: "Synthetic Demo Citizen", documentFiles: [{ name: "sample.pdf", data: "c2FtcGxl" }] };
  const blob = await encryptVault(payload, "correct-horse-battery-staple");
  const text = await blob.text();
  assert.equal(text.includes("Synthetic Demo Citizen"), false);
  const file = new File([blob], "demo.janasetu");
  assert.deepEqual(await decryptVault(file, "correct-horse-battery-staple"), payload);
});

test("encrypted vault rejects a wrong password", async () => {
  const blob = await encryptVault({ app: "JanaSetu" }, "correct-horse-battery-staple");
  const file = new File([blob], "demo.janasetu");
  await assert.rejects(() => decryptVault(file, "incorrect-password"), /Incorrect password|integrity check/);
});

test("encrypted vault requires a 12-character password", async () => {
  await assert.rejects(() => encryptVault({}, "short"), /at least 12 characters/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { buildFormAssistantBackup } from "../lib/form-assistant-backup";

test("form assistant export contains a validated profile and the extension import envelope", () => {
  const backup = buildFormAssistantBackup({
    fullName: "Synthetic Citizen",
    state: "Karnataka",
    district: "Mysuru",
    mobileNumber: "9876543210",
    pincode: "570001",
    villageOrTown: "Mysuru",
    institutionName: "Synthetic College",
    courseName: "Computer Science"
  }, "kn", "2026-11-12T00:00:00.000Z");
  assert.equal(backup.app, "JanaSetu");
  assert.equal(backup.schemaVersion, 1);
  assert.equal(backup.language, "kn");
  assert.equal(backup.profile.mobileNumber, "9876543210");
  assert.equal(backup.profile.institutionName, "Synthetic College");
});

test("form assistant export rejects extra identity and bank identifiers", () => {
  assert.throws(() => buildFormAssistantBackup({
    fullName: "Synthetic Citizen",
    state: "Karnataka",
    aadhaarNumber: "000000000000"
  }, "en"));
});

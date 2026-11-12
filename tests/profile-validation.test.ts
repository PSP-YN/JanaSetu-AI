import test from "node:test";
import assert from "node:assert/strict";
import { parseCitizenProfile } from "../lib/profile-validation";
import { parseBackupProfile } from "../lib/backup-validation";

const base = { fullName: "Synthetic Citizen", state: "Karnataka", district: "Mysuru" };

test("citizen profile accepts optional contact, postal, household and education fields", () => {
  const parsed = parseCitizenProfile({
    ...base,
    mobileNumber: "9876543210",
    emailAddress: "citizen@example.test",
    addressLine1: "12 Test Road",
    villageOrTown: "Mysuru",
    pincode: "570001",
    fatherOrGuardianName: "Synthetic Guardian",
    socialCategory: "OBC",
    landholdingAcres: 1.25,
    institutionName: "Synthetic College",
    courseName: "Computer Science",
    courseYear: "2nd year",
    rationCardCategory: "PHH"
  });
  assert.ok(parsed);
  assert.equal(parsed.mobileNumber, "9876543210");
  assert.equal(parsed.pincode, "570001");
  assert.equal(parsed.landholdingAcres, 1.25);
  assert.equal(parsed.socialCategory, "OBC");
});

test("citizen profile rejects malformed contact and postal values", () => {
  assert.equal(parseCitizenProfile({ ...base, mobileNumber: "123" }), null);
  assert.equal(parseCitizenProfile({ ...base, emailAddress: "not-an-email" }), null);
  assert.equal(parseCitizenProfile({ ...base, pincode: "57001" }), null);
  assert.equal(parseCitizenProfile({ ...base, socialCategory: "VIP" }), null);
});

test("backup parser preserves the expanded profile and still rejects Aadhaar and bank identifiers", () => {
  const restored = parseBackupProfile({ ...base, mobileNumber: "9876543210", pincode: "570001", institutionName: "Synthetic College" });
  assert.ok(restored);
  assert.equal(restored.institutionName, "Synthetic College");
  assert.equal(parseBackupProfile({ ...base, aadhaarNumber: "000000000000" }), null);
  assert.equal(parseBackupProfile({ ...base, bankAccountNumber: "1234567890" }), null);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("app/app/page.tsx", "utf8");
const validation = readFileSync("lib/profile-validation.ts", "utf8");
const extension = readFileSync("extension/fill.js", "utf8");

test("citizen profile exposes the fields needed by the four initial scheme workflows", () => {
  for (const field of [
    "mobileNumber", "emailAddress", "addressLine1", "addressLine2", "villageOrTown",
    "pincode", "fatherOrGuardianName", "motherName", "socialCategory",
    "rationCardCategory", "landholdingAcres", "institutionName", "courseName", "courseYear"
  ]) {
    assert.match(page, new RegExp(field));
    assert.match(validation, new RegExp(field));
  }
});

test("form assistant export is explicitly plaintext and requires citizen confirmation", () => {
  assert.match(page, /window\.confirm\(warning\)/);
  assert.match(page, /plaintext JSON file/);
  assert.match(page, /JanaSetu-Form-Assistant-Profile\.json/);
  assert.match(page, /Export for form assistant/);
});

test("extension matches profile fields by reviewed label aliases and never treats a field as an official submission", () => {
  for (const field of ["villageOrTown", "pincode", "fatherOrGuardianName", "motherName", "socialCategory", "landholdingAcres", "institutionName", "courseName", "courseYear", "rationCardCategory"]) {
    assert.match(extension, new RegExp(field));
  }
  assert.match(extension, /approved/);
  assert.doesNotMatch(extension, /submitApplication\s*:\s*true/);
});

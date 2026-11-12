import test from "node:test";
import assert from "node:assert/strict";
import { PROFILE_FORM_COPY } from "../lib/profile-form-copy";
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

test("form assistant export is explicitly plaintext, localized and requires citizen confirmation", () => {
  assert.match(page, /window\.confirm\(warning\)/);
  assert.match(page, /JanaSetu-Form-Assistant-Profile\.json/);
  assert.match(page, /t\("formAssistantExportWarning"\)/);
  assert.match(page, /t\("exportFormAssistant"\)/);
  assert.match(PROFILE_FORM_COPY.en.formAssistantExportWarning, /plain-text JSON file/);
  assert.match(PROFILE_FORM_COPY.en.formAssistantExportWarning, /not encrypted/i);
});

test("extension matches profile fields by reviewed label aliases and never treats a field as an official submission", () => {
  for (const field of ["mobileNumber", "emailAddress", "villageOrTown", "pincode", "fatherOrGuardianName", "motherName", "socialCategory", "landholdingAcres", "institutionName", "courseName", "courseYear", "rationCardCategory"]) {
    assert.match(extension, new RegExp(field));
  }
  assert.match(extension, /approved/);
  assert.doesNotMatch(extension, /submitApplication\s*:\s*true/);
});


test("new profile contact, education and form-assistant export copy is translated in all six supported languages", () => {
  const keys = [
    "contactSectionTitle", "contactSectionText", "mobileNumberLabel", "emailAddressLabel",
    "addressLine1Label", "addressLine2Label", "villageTownCityLabel", "pinCodeLabel",
    "fatherGuardianNameLabel", "motherNameLabel", "socialCategoryLabel", "rationCardCategoryLabel",
    "cultivableLandAcresLabel", "institutionNameLabel", "courseNameLabel", "courseYearLabel",
    "exportFormAssistant", "formAssistantExportWarning", "formAssistantExportCreated", "formAssistantExportFailed"
  ];
  for (const language of ["en", "hi", "kn", "ta", "te", "ml"] as const) {
    for (const key of keys) {
      assert.equal(typeof PROFILE_FORM_COPY[language][key], "string", language + ":" + key);
      assert.ok(PROFILE_FORM_COPY[language][key].trim().length > 0, language + ":" + key);
    }
  }
  assert.match(PROFILE_FORM_COPY.en.formAssistantExportWarning, /not encrypted/i);
  assert.match(page, /profileFormText\(lang, key\)/);
  assert.match(page, /t\("formAssistantExportWarning"\)/);
  assert.match(page, /t\("formAssistantExportCreated"\)/);
  assert.doesNotMatch(page, /<Field label="Mobile number"/);
});

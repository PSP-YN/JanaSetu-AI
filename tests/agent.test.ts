import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMES, type CitizenProfile } from "../lib/catalog";
import { evaluateScheme, runBenefitsAgent } from "../lib/agent";

const base: CitizenProfile = {
  fullName: "Test Citizen",
  age: 34,
  gender: "woman",
  state: "Karnataka",
  district: "Mysuru",
  residenceType: "urban",
  annualIncome: 150000,
  occupation: "farmer",
  hasCultivableLand: true,
  pmKisanExcluded: "no",
  ownsPuccaHouse: false,
  previousHousingBenefit: "no",
  householdHasLpg: false,
  poorHouseholdDeclaration: true,
  isStudent: false,
  top20Percentile: null,
  regularUndergraduate: null,
  otherScholarship: null,
  diplomaOrDistance: null
};

test("PMUY screen never promotes a missing answer to a match", () => {
  const profile = { ...base, householdHasLpg: null };
  const result = evaluateScheme(SCHEMES.find((s) => s.id === "pm-ujjwala")!, profile);
  assert.equal(result.state, "needs_verification");
  assert.ok(result.checks.some((item) => item.state === "unknown"));
});

test("PMAY-U 2.0 rejects a rural profile for this urban route", () => {
  const result = evaluateScheme(SCHEMES.find((s) => s.id === "pmay-u-2")!, { ...base, residenceType: "rural" });
  assert.equal(result.state, "not_matched");
});

test("PM-USP cited income threshold is checked deterministically", () => {
  const scheme = SCHEMES.find((s) => s.id === "pm-usp-csss")!;
  const result = evaluateScheme(scheme, {
    ...base, isStudent: true, top20Percentile: true, regularUndergraduate: true,
    diplomaOrDistance: false, annualIncome: 500000, otherScholarship: false
  });
  assert.equal(result.checks.find((item) => item.key === "income")?.state, "not_matched");
});

test("agent returns an inspectable multi-step tool trace", () => {
  const result = runBenefitsAgent(base);
  assert.ok(result.trace.length >= 4);
  assert.ok(result.trace.some((item) => item.tool === "evaluate_scheme_rules"));
  assert.ok(result.assessments.length > 0);
});


import { parseCitizenMessage } from "../lib/intake";

test("Hindi intake extracts supported profile facts for review", () => {
  const result = parseCitizenMessage("मैं 34 साल की महिला किसान हूं, कर्नाटक में रहती हूं, वार्षिक आय 1.5 लाख है");
  assert.equal(result.updates.age, 34);
  assert.equal(result.updates.gender, "woman");
  assert.equal(result.updates.occupation, "Farmer");
  assert.equal(result.updates.state, "Karnataka");
  assert.equal(result.updates.annualIncome, 150000);
  assert.ok(result.recognizedFields.includes("Annual household income"));
});

test("Tamil intake extracts supported facts without making an eligibility decision", () => {
  const result = parseCitizenMessage("நான் 32 வயது பெண் விவசாயி, தமிழ்நாடு, ஆண்டு வருமானம் 2 லட்சம்");
  assert.equal(result.updates.age, 32);
  assert.equal(result.updates.gender, "woman");
  assert.equal(result.updates.occupation, "Farmer");
  assert.equal(result.updates.state, "Tamil Nadu");
  assert.equal(result.updates.annualIncome, 200000);
  assert.ok(result.note.includes("Review every value"));
});

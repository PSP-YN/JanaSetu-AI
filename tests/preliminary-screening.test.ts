import test from "node:test";
import assert from "node:assert/strict";
import { runBenefitsAgent } from "../lib/agent";
import type { CitizenProfile } from "../lib/catalog";

const profile: CitizenProfile = {
  fullName: "Synthetic Demo Citizen",
  age: 32,
  gender: "woman",
  state: "Karnataka",
  district: "Mysuru",
  residenceType: "rural",
  annualIncome: 180000,
  occupation: "Farmer",
  hasCultivableLand: true,
  pmKisanExcluded: "unknown",
  ownsPuccaHouse: false,
  previousHousingBenefit: "unknown",
  householdHasLpg: false,
  poorHouseholdDeclaration: true,
  isStudent: true,
  top20Percentile: true,
  regularUndergraduate: true,
  otherScholarship: false,
  diplomaOrDistance: false
};

test("pending schemes expose source-note checklists but never assert eligibility", () => {
  const result = runBenefitsAgent(profile);
  assert.ok(result.assessments.length >= 3);
  for (const assessment of result.assessments) {
    assert.equal(assessment.schemeReviewStatusAtAssessment, "pending");
    assert.equal(assessment.state, "needs_verification");
    assert.match(assessment.headline, /Preliminary screen/);
    assert.match(assessment.explanation, /not an eligibility decision or rejection/);
    assert.ok(assessment.checks.length > 0);
  }
  assert.match(result.trace.find((item) => item.tool === "evaluate_scheme_rules")?.detail ?? "", /never produce a match\/rejection result/);
});

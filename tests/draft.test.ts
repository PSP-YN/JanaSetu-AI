import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMES, type CitizenProfile } from "../lib/catalog";
import { createDraftRecord } from "../lib/draft";

const profile: CitizenProfile = {
  fullName: "Synthetic Citizen", age: 34, gender: "woman", state: "Karnataka", district: "Mysuru",
  residenceType: "urban", annualIncome: 150000, occupation: "Farmer",
  hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
  previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
  isStudent: false, top20Percentile: null, regularUndergraduate: null,
  otherScholarship: null, diplomaOrDistance: null
};

test("pending scheme draft explicitly labels scheme approval as pending", () => {
  const { draft, assessment } = createDraftRecord("pm-kisan", profile);
  assert.equal(draft.schemeReviewStatus, "pending");
  assert.match(draft.status, /Scheme review pending/);
  assert.equal(assessment.schemeReviewStatusAtAssessment, "pending");
  assert.ok(assessment.checks.length > 0);
  assert.match(assessment.headline, /Preliminary screen/);
  assert.equal(assessment.state, "needs_verification");
});

test("approved scheme with unknown profile facts is not mislabeled as source approval pending", () => {
  const approved = SCHEMES.map((scheme) => scheme.id === "pm-kisan" ? { ...scheme, reviewStatus: "approved" as const } : scheme);
  const incomplete = { ...profile, hasCultivableLand: null, pmKisanExcluded: "unknown" as const };
  const { draft, assessment } = createDraftRecord("pm-kisan", incomplete, approved);
  assert.equal(draft.schemeReviewStatus, "approved");
  assert.match(draft.status, /eligibility requires official verification/i);
  assert.doesNotMatch(draft.status, /scheme review pending/i);
  assert.equal(assessment.schemeReviewStatusAtAssessment, "approved");
  assert.equal(assessment.state, "needs_verification");
});

test("draft creation rejects a non-State/UT value", () => {
  assert.throws(() => createDraftRecord("pm-kisan", { ...profile, state: "Atlantis" }), /State\/UT/i);
});

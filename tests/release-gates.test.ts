import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMES, type CitizenProfile } from "../lib/catalog";
import { evaluateScheme } from "../lib/agent";
import { readJsonBody } from "../lib/request";

const syntheticProfile: CitizenProfile = {
  fullName: "Synthetic Test", age: 30, gender: "woman", state: "Karnataka", district: "Mysuru",
  residenceType: "urban", annualIncome: 200000, occupation: "Farmer",
  hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
  previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
  isStudent: false, top20Percentile: null, regularUndergraduate: null,
  otherScholarship: null, diplomaOrDistance: null
};

test("all built-in deterministic schemes remain pending human approval", () => {
  const screened = SCHEMES.filter((scheme) => scheme.catalogueStatus === "rule-screened");
  assert.equal(screened.length, 4);
  for (const scheme of screened) {
    assert.equal(scheme.reviewStatus, "pending", scheme.id + " must remain pending");
    const result = evaluateScheme(scheme, syntheticProfile);
    assert.equal(result.state, "needs_verification");
    assert.equal(result.checks.length, 0, "unapproved rule conditions must not be evaluated");
    assert.match(result.headline, /Human review pending/);
  }
});

test("bounded JSON parser rejects oversized requests", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "x".repeat(128) })
  });
  const result = await readJsonBody(request, 32);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 413);
});

test("bounded JSON parser rejects malformed JSON", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{invalid"
  });
  const result = await readJsonBody(request, 128);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 400);
});

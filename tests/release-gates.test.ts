import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMES, type CitizenProfile } from "../lib/catalog";
import { evaluateScheme } from "../lib/agent";
import { readJsonBody } from "../lib/request";
import { invalidateUnapprovedAssessments, invalidateUnapprovedApplications } from "../lib/assessment-safety";
import { parseCitizenProfile } from "../lib/profile-validation";

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
    assert.ok(result.checks.length > 0, "pending schemes may show source-note checklist comparisons");
    assert.match(result.headline, /Preliminary screen/);
    assert.equal(result.state, "needs_verification", "pending schemes never produce an eligibility result");
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


test("streaming JSON parser stops reading when chunked body exceeds the limit", async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new TextEncoder().encode("x".repeat(20)));
    },
    cancel() { cancelled = true; }
  });
  const request = new Request("https://example.test/api", { method: "POST", body, duplex: "half" } as RequestInit);
  const result = await readJsonBody(request, 32);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 413);
  assert.equal(cancelled, true);
});


test("profile validation rejects wrong types, out-of-range values and extra fields", () => {
  assert.equal(parseCitizenProfile({ state: "Karnataka", age: { value: 25 } }), null);
  assert.equal(parseCitizenProfile({ state: "Karnataka", age: 250 }), null);
  assert.equal(parseCitizenProfile({ state: "Karnataka", annualIncome: -1 }), null);
  assert.equal(parseCitizenProfile({ state: "Karnataka", aadhaar: "1234" }), null);
  assert.equal(parseCitizenProfile({ state: "Karnataka", isStudent: "yes" }), null);
});

test("profile validation fills omitted optional fields with safe defaults", () => {
  const profile = parseCitizenProfile({ state: "Karnataka" });
  assert.ok(profile);
  assert.equal(profile?.pmKisanExcluded, "unknown");
  assert.equal(profile?.hasCultivableLand, null);
  assert.equal(profile?.fullName, "");
});


test("bounded JSON parser rejects non-object payloads at the profile boundary", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "null"
  });
  const result = await readJsonBody(request, 128);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value, null);
});


test("saved positive assessment for an unapproved scheme is invalidated", () => {
  const old = [{ schemeId: "pm-kisan", state: "potential_match", headline: "Potential match", explanation: "Old", checks: [], nextActions: [] }];
  const safe = invalidateUnapprovedAssessments(old);
  assert.equal(safe[0].state, "needs_verification");
  assert.match(safe[0].headline, /Human review pending/);
});

test("imported application drafts cannot retain a reviewed state for a pending scheme", () => {
  const old = [{ schemeId: "pm-kisan", reviewRequired: false, assessmentState: "potential_match" as const, status: "Reviewed", reviewedAt: "2026-01-01" }];
  const safe = invalidateUnapprovedApplications(old);
  assert.equal(safe[0].reviewRequired, true);
  assert.equal(safe[0].assessmentState, "needs_verification");
  assert.equal(safe[0].reviewedAt, null);
  assert.match(safe[0].status, /Scheme review pending/);
});

test("profile validation accepts blank optional State/UT but rejects whitespace and unknown locations", () => {
  assert.equal(parseCitizenProfile({ state: "" })?.state, "");
  assert.equal(parseCitizenProfile({ state: "   " }), null);
  assert.equal(parseCitizenProfile({ state: "Atlantis" }), null);
  assert.equal(parseCitizenProfile({ state: "Karnataka " }), null);
});

test("saved assessments for removed schemes are invalidated instead of retaining old matches", () => {
  const old = [{ schemeId: "deleted-scheme", state: "potential_match" as const, headline: "Potential match", explanation: "Old", checks: [], nextActions: [], schemeReviewStatusAtAssessment: "approved" as const }];
  const safe = invalidateUnapprovedAssessments(old);
  assert.equal(safe[0].state, "needs_verification");
  assert.match(safe[0].headline, /no longer in the current catalogue/i);
  assert.equal(safe[0].checks.length, 0);
});

test("legacy assessments are re-run after a scheme becomes approved", () => {
  const approved = SCHEMES.map((scheme) => scheme.id === "pm-kisan" ? { ...scheme, reviewStatus: "approved" as const } : scheme);
  const legacy = [{ schemeId: "pm-kisan", state: "potential_match" as const, headline: "Old positive", explanation: "Old", checks: [], nextActions: [] }];
  const safe = invalidateUnapprovedAssessments(legacy, approved);
  assert.equal(safe[0].state, "needs_verification");
  assert.match(safe[0].headline, /re-run assessment/i);
});

test("saved applications for removed schemes are marked unavailable and require review", () => {
  const old = [{ schemeId: "removed-scheme", reviewRequired: false, assessmentState: "potential_match" as const, status: "Reviewed", reviewedAt: "2026-01-01" }];
  const safe = invalidateUnapprovedApplications(old);
  assert.equal(safe[0].reviewRequired, true);
  assert.equal(safe[0].schemeReviewStatus, "missing");
  assert.equal(safe[0].assessmentState, "needs_verification");
  assert.equal(safe[0].reviewedAt, null);
  assert.match(safe[0].status, /no longer in the current catalogue/i);
});

test("translated occupation values normalize to stable canonical profile values", () => {
  assert.equal(parseCitizenProfile({ occupation: "ಕೃಷಿ ಕಾರ್ಮಿಕ" })?.occupation, "Agricultural worker");
  assert.equal(parseCitizenProfile({ occupation: "किसान" })?.occupation, "Farmer");
  assert.equal(parseCitizenProfile({ occupation: "unknown occupation" }), null);
});

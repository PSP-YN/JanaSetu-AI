import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMES, type CitizenProfile } from "../lib/catalog";
import { evaluateScheme } from "../lib/agent";
import { readJsonBody } from "../lib/request";
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

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

test("all four rule screens stay blocked until human source approval", () => {
  const screened = SCHEMES.filter((scheme) => scheme.catalogueStatus === "rule-screened");
  assert.equal(screened.length, 4);
  for (const scheme of screened) {
    assert.equal(scheme.reviewStatus, "pending");
    const result = evaluateScheme(scheme, base);
    assert.equal(result.state, "needs_verification");
    assert.ok(result.checks.length > 0);
    assert.match(result.headline, /Preliminary screen/);
    assert.match(result.explanation, /not an eligibility decision or rejection/);
  }
});

test("PMUY approved-rule regression keeps missing answers unknown", () => {
  const scheme = { ...SCHEMES.find((s) => s.id === "pm-ujjwala")!, reviewStatus: "approved" as const };
  const result = evaluateScheme(scheme, { ...base, householdHasLpg: null });
  assert.equal(result.state, "needs_verification");
  assert.ok(result.checks.some((item) => item.state === "unknown"));
});

test("PMAY-U approved-rule regression rejects a rural profile", () => {
  const scheme = { ...SCHEMES.find((s) => s.id === "pmay-u-2")!, reviewStatus: "approved" as const };
  const result = evaluateScheme(scheme, { ...base, residenceType: "rural" });
  assert.equal(result.state, "not_matched");
});

test("PM-USP approved-rule regression checks the cited income threshold", () => {
  const scheme = { ...SCHEMES.find((s) => s.id === "pm-usp-csss")!, reviewStatus: "approved" as const };
  const result = evaluateScheme(scheme, {
    ...base, isStudent: true, top20Percentile: true, regularUndergraduate: true,
    diplomaOrDistance: false, annualIncome: 500000, otherScholarship: false
  });
  assert.equal(result.checks.find((item) => item.key === "income")?.state, "not_matched");
});

test("missing catalogue metadata cannot bypass human approval", () => {
  const scheme = { ...SCHEMES.find((s) => s.id === "pm-ujjwala")!, catalogueStatus: undefined, reviewStatus: undefined };
  const result = evaluateScheme(scheme, base);
  assert.equal(result.state, "needs_verification");
  assert.ok(result.checks.length > 0);
  assert.match(result.headline, /Preliminary screen/);
  assert.match(result.explanation, /not an eligibility decision or rejection/);
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


test("expanded catalogue has unique source-indexed records and explicit rule coverage", () => {
  const ids = SCHEMES.map((scheme) => scheme.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(SCHEMES.length, 142);
  assert.equal(SCHEMES.filter((scheme) => scheme.catalogueStatus === "rule-screened").length, 4);
  assert.equal(SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only").length, 138);
});

test("benefits agent does not silently eligibility-score catalogue-only records", () => {
  const result = runBenefitsAgent(base);
  assert.ok(result.schemes.every((scheme) => scheme.catalogueStatus === "rule-screened"));
  assert.ok(!result.schemes.some((scheme) => scheme.catalogueStatus === "catalogue-only"));
});


test("Karnataka budget leads remain catalogue-only and carry official budget provenance", () => {
  const leads = SCHEMES.filter((scheme) => scheme.id.startsWith("ka-budget-"));
  assert.equal(leads.length, 96);
  assert.ok(leads.every((scheme) => scheme.catalogueStatus === "catalogue-only"));
  assert.ok(leads.every((scheme) => scheme.jurisdiction === "state"));
  assert.ok(leads.every((scheme) => scheme.sourceUrl.startsWith("https://finance.karnataka.gov.in/")));
  assert.ok(leads.every((scheme) => scheme.ruleNotes.some((note) => note.includes("not human-reviewed"))));
});


test("agent executes eligibility, document checklist and safe form-fill tools with a human gate", () => {
  const result = runBenefitsAgent(base);
  const names = result.trace.map((item) => item.tool);
  assert.deepEqual(names, ["search_scheme_catalog", "evaluate_scheme_rules", "build_document_checklist", "prepare_form_filling"]);
  assert.ok(result.documentChecklists.length > 0);
  assert.ok(result.documentChecklists.every((item) => item.items.every((doc) => doc.status === "citizen_to_verify")));
  assert.ok(result.formFillPlans.every((plan) => plan.requiresHumanConfirmation && plan.mayFillOnlyAfterCitizenApproval && plan.maySubmit === false));
  assert.ok(result.formFillPlans.every((plan) => plan.fields.every((field) => field.requiresCitizenReview)));
  assert.deepEqual(result.humanConfirmation, { required: true, stage: "before_portal_field_filling_and_before_any_submission", submissionPerformed: false });
  assert.ok(result.formFillPlans.every((plan) => plan.fields.every((field) => !/aadhaar|pan|bank|otp|captcha|password/i.test(field.key + " " + field.label))));
});


test("regional-language intake extracts supported profile facts in Kannada, Telugu and Malayalam", () => {
  const kannada = parseCitizenMessage("ನಾನು 34 ವರ್ಷದ ಮಹಿಳಾ ರೈತ, ಕರ್ನಾಟಕದಲ್ಲಿ ವಾಸಿಸುತ್ತೇನೆ, ವಾರ್ಷಿಕ ಆದಾಯ 1.5 ಲಕ್ಷ");
  assert.equal(kannada.updates.age, 34);
  assert.equal(kannada.updates.gender, "woman");
  assert.equal(kannada.updates.occupation, "Farmer");
  assert.equal(kannada.updates.state, "Karnataka");
  assert.equal(kannada.updates.annualIncome, 150000);

  const telugu = parseCitizenMessage("నేను 32 ఏళ్ల మహిళా రైతు, ఆంధ్రప్రదేశ్, వార్షిక ఆదాయం 2 లక్షలు");
  assert.equal(telugu.updates.age, 32);
  assert.equal(telugu.updates.gender, "woman");
  assert.equal(telugu.updates.occupation, "Farmer");
  assert.equal(telugu.updates.state, "Andhra Pradesh");
  assert.equal(telugu.updates.annualIncome, 200000);

  const malayalam = parseCitizenMessage("ഞാൻ 30 വയസ്സുള്ള വനിതാ കർഷക, കേരളം, വാർഷിക വരുമാനം 1.2 ലക്ഷം");
  assert.equal(malayalam.updates.age, 30);
  assert.equal(malayalam.updates.gender, "woman");
  assert.equal(malayalam.updates.occupation, "Farmer");
  assert.equal(malayalam.updates.state, "Kerala");
  assert.equal(malayalam.updates.annualIncome, 120000);
});

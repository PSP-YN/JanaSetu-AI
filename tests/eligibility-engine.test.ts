import test from "node:test";
import assert from "node:assert/strict";
import { assessApprovedScheme, prepareApplicationDraft, isApprovedRuleSetForPublication, isWithinSchemeEffectivePeriod } from "../lib/eligibility-engine";
import type { CitizenProfile } from "../lib/catalog";

const profile: CitizenProfile = {
  fullName:"Test Citizen",age:25,gender:"woman",state:"Karnataka",district:"Mysuru",residenceType:"rural",
  annualIncome:180000,occupation:"Farmer",hasCultivableLand:true,pmKisanExcluded:"no",ownsPuccaHouse:null,
  previousHousingBenefit:"unknown",householdHasLpg:false,poorHouseholdDeclaration:true,isStudent:false,
  top20Percentile:null,regularUndergraduate:null,otherScholarship:null,diplomaOrDistance:null
};
const evidence={sourceUrl:"https://example.gov.in/scheme",sourceCheckedAt:"2026-11-10T00:00:00.000Z",sourceHash:"a".repeat(64),excerpt:"Official scheme eligibility clause reviewed by independent reviewers."};
const ruleSet={
  schemaVersion:1,state:"approved",
  rules:[
    {key:"minimum_age",label:"Applicant must be at least 18",profileField:"age",operator:"gte",expected:18,evidence,reviewStatus:"approved"},
    {key:"state",label:"Applicant must reside in Karnataka",profileField:"state",operator:"eq",expected:"Karnataka",evidence,reviewStatus:"approved"}
  ],
  application:{fields:[
    {key:"applicant_name",label:"Applicant name",profileField:"fullName",required:true,type:"text",maxLength:100},
    {key:"annual_income",label:"Annual household income",profileField:"annualIncome",required:true,type:"number",min:0,max:1000000}
  ],documents:["Income certificate"]}
};
const scheme={schemeId:"test-scheme",publicationStatus:"published" as const,verificationStatus:"independently_approved" as const,ruleSet,effectiveFrom:"2026-01-01",effectiveTo:"2027-12-31"};
const now=new Date("2026-11-11T12:00:00.000Z");

test("unapproved scheme versions never produce an eligibility result",()=>{
  const result=assessApprovedScheme(profile,{...scheme,verificationStatus:"source_checked" as never},now);
  assert.equal(result.state,"needs_verification");
  assert.equal(result.schemeReviewStatusAtAssessment,undefined);
});

test("approved, fresh, fully matched rules produce only a potential match",()=>{
  const result=assessApprovedScheme(profile,scheme,now);
  assert.equal(result.state,"potential_match");
  assert.equal(result.schemeReviewStatusAtAssessment,"approved");
  assert.match(result.headline,/official verification still required/i);
});

test("failed deterministic rules do not become an eligible result",()=>{
  const result=assessApprovedScheme({...profile,age:16},scheme,now);
  assert.equal(result.state,"not_matched");
});

test("missing profile data and stale evidence require verification",()=>{
  const missing=assessApprovedScheme({...profile,age:""},scheme,now);
  assert.equal(missing.state,"needs_verification");
  const staleRuleSet={...ruleSet,rules:ruleSet.rules.map((r)=>({...r,evidence:{...evidence,sourceCheckedAt:"2026-01-01T00:00:00.000Z"}}))};
  const stale=assessApprovedScheme(profile,{...scheme,ruleSet:staleRuleSet},now);
  assert.equal(stale.state,"needs_verification");
});

test("application preparation maps only allowlisted profile fields and requires citizen review",()=>{
  const assessment=assessApprovedScheme(profile,scheme,now);
  const draft=prepareApplicationDraft(profile,scheme,assessment);
  assert.equal(draft.status,"ready_for_citizen_review");
  assert.equal(draft.submissionStatus,"not_submitted");
  assert.ok(draft.fields.every((field)=>field.requiresCitizenConfirmation));
  assert.equal(draft.fields[0].value,"Test Citizen");
  assert.deepEqual(draft.documents,["Income certificate"]);
});

test("required missing application fields block the draft",()=>{
  const incomplete={...profile,fullName:""};
  const assessment=assessApprovedScheme(incomplete,scheme,now);
  const draft=prepareApplicationDraft(incomplete,scheme,assessment);
  assert.equal(draft.status,"blocked");
  assert.ok(draft.missingFields.includes("Applicant name"));
});

test("unsafe government credentials cannot be mapped from citizen profiles",()=>{
  const unsafe={...ruleSet,application:{...ruleSet.application,fields:[{key:"aadhaar_number",label:"Aadhaar",profileField:"fullName",required:true,type:"text"}]}};
  const result=assessApprovedScheme(profile,{...scheme,ruleSet:unsafe},now);
  assert.equal(result.state,"needs_verification");
});


test("approved scheme mappings can use extended profile fields without treating postal PIN codes as authentication PINs", () => {
  const extendedRuleSet = {
    ...ruleSet,
    rules: [
      ...ruleSet.rules,
      { key: "postal_code", label: "Applicant PIN code", profileField: "pincode", operator: "eq", expected: "570001", evidence, reviewStatus: "approved" as const }
    ],
    application: {
      fields: [
        ...ruleSet.application.fields,
        { key: "postal_code", label: "PIN code", profileField: "pincode", required: true, type: "text" as const, maxLength: 6 }
      ],
      documents: []
    }
  };
  const citizen = { ...profile, pincode: "570001" };
  const approved = { ...scheme, ruleSet: extendedRuleSet };
  const result = assessApprovedScheme(citizen, approved, now);
  assert.equal(result.state, "potential_match");
  const draft = prepareApplicationDraft(citizen, approved, result);
  assert.equal(draft.status, "ready_for_citizen_review");
  assert.equal(draft.fields[draft.fields.length - 1]?.value, "570001");

  const unsafeSecurityPinRuleSet = {
    ...extendedRuleSet,
    rules: [...extendedRuleSet.rules, { key: "security_pin", label: "Security PIN", profileField: "pincode", operator: "eq", expected: "570001", evidence, reviewStatus: "approved" as const }]
  };
  assert.equal(isApprovedRuleSetForPublication(unsafeSecurityPinRuleSet, now), false);
});

test("date-only scheme end dates remain valid throughout the Indian calendar day",()=>{
  const sameDay={...scheme,effectiveFrom:"2026-11-11",effectiveTo:"2026-11-11"};
  const result=assessApprovedScheme(profile,sameDay,now);
  assert.equal(result.state,"potential_match");
  const future={...scheme,effectiveFrom:"2026-11-12",effectiveTo:"2027-12-31"};
  assert.equal(assessApprovedScheme(profile,future,now).state,"needs_verification");
});

test("publication gate rejects unsupported operators and malformed document checklists",()=>{
  const unsupported={...ruleSet,rules:ruleSet.rules.map((r)=>({...r,operator:"unsupported"}))};
  assert.equal(isApprovedRuleSetForPublication(unsupported,now),false);
  const blankDocument={...ruleSet,application:{...ruleSet.application,documents:["  "]}};
  assert.equal(isApprovedRuleSetForPublication(blankDocument,now),false);
  assert.equal(isApprovedRuleSetForPublication(ruleSet,now),true);
});

test("public effective-period validation uses Indian calendar-day boundaries",()=>{
  assert.equal(isWithinSchemeEffectivePeriod("2026-11-11","2026-11-11",now),true);
  assert.equal(isWithinSchemeEffectivePeriod("2026-11-12","2027-12-31",now),false);
  assert.equal(isWithinSchemeEffectivePeriod("2025-01-01","2026-11-10",now),false);
});

test("scheme rules reject non-government evidence hosts even when HTTPS is used",()=>{
  const unsafe={...ruleSet,rules:ruleSet.rules.map((r)=>({...r,evidence:{...evidence,sourceUrl:"https://example.com/official-looking-scheme"}}))};
  assert.equal(assessApprovedScheme(profile,{...scheme,ruleSet:unsafe},now).state,"needs_verification");
});

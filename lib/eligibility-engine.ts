import type { Assessment, CitizenProfile, RuleCheck } from "./catalog";

type ProfileField = keyof CitizenProfile;
type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "is_true" | "is_false";
type Scalar = string | number | boolean;
type Evidence = { sourceUrl: string; sourceCheckedAt: string; sourceHash: string; excerpt: string };
type EligibilityRule = {
  key: string; label: string; profileField: ProfileField; operator: Operator;
  expected?: Scalar | Scalar[]; evidence: Evidence; reviewStatus: "approved";
};
export type ApprovedSchemeVersion = {
  schemeId: string;
  publicationStatus: string;
  verificationStatus: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  ruleSet: unknown;
};
export type ApplicationFieldMapping = {
  key: string; label: string; profileField: ProfileField; required: boolean;
  type: "text" | "number" | "boolean"; maxLength?: number; min?: number; max?: number;
  allowedValues?: Scalar[];
};
type ApprovedRuleSet = {
  schemaVersion: 1; state: "approved"; rules: EligibilityRule[];
  application?: { fields: ApplicationFieldMapping[]; documents: string[] };
};
export type PreparedField = {
  key: string; label: string; value: string | number | boolean | null;
  source: "citizen_profile"; status: "provided" | "missing";
  requiresCitizenConfirmation: true;
};
export type PreparedApplication = {
  status: "ready_for_citizen_review" | "blocked";
  fields: PreparedField[]; documents: string[]; missingFields: string[];
  validationErrors: string[]; requiresCitizenApproval: true; submissionStatus: "not_submitted";
};

const PROFILE_FIELDS = new Set<ProfileField>([
  "fullName","age","gender","state","district","residenceType","annualIncome","occupation",
  "hasCultivableLand","pmKisanExcluded","ownsPuccaHouse","previousHousingBenefit","householdHasLpg",
  "poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance"
]);
const FORBIDDEN = /(aadhaar|aadhar|bank|account_number|ifsc|otp|password|biometric|pin)/i;
const OPERATORS = new Set<Operator>(["eq","neq","gt","gte","lt","lte","in","not_in","is_true","is_false"]);
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const isScalar = (value: unknown): value is Scalar => typeof value === "string" || typeof value === "number" && Number.isFinite(value) || typeof value === "boolean";
const isIsoDate = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const isHash = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);

function parseRuleSet(value: unknown): ApprovedRuleSet | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.state !== "approved" || !Array.isArray(value.rules) || value.rules.length === 0 || value.rules.length > 100) return null;
  const rules: EligibilityRule[] = [];
  const ruleKeys = new Set<string>();
  for (const item of value.rules) {
    if (!isRecord(item) || typeof item.key !== "string" || !/^[a-z][a-z0-9_]{1,79}$/.test(item.key) ||
      typeof item.label !== "string" || !item.label.trim() || item.label.length > 180 ||
      typeof item.profileField !== "string" || !PROFILE_FIELDS.has(item.profileField as ProfileField) ||
      typeof item.operator !== "string" || !OPERATORS.has(item.operator as Operator) ||
      item.reviewStatus !== "approved" || !isRecord(item.evidence)) return null;
    if (FORBIDDEN.test(item.key) || FORBIDDEN.test(item.profileField)) return null;
    if (ruleKeys.has(item.key)) return null;
    ruleKeys.add(item.key);
    const evidence = item.evidence;
    if (typeof evidence.sourceUrl !== "string" || !evidence.sourceUrl.startsWith("https://") ||
      !isIsoDate(evidence.sourceCheckedAt) || !isHash(evidence.sourceHash) ||
      typeof evidence.excerpt !== "string" || evidence.excerpt.trim().length < 12 || evidence.excerpt.length > 1000) return null;
    const operator = item.operator as Operator;
    if (["eq","neq","gt","gte","lt","lte"].includes(operator) && !isScalar(item.expected)) return null;
    if (["in","not_in"].includes(operator) && (!Array.isArray(item.expected) || item.expected.length === 0 || item.expected.length > 100 || !item.expected.every(isScalar))) return null;
    rules.push({ key:item.key,label:item.label,profileField:item.profileField as ProfileField,operator,expected:item.expected as Scalar | Scalar[] | undefined,evidence:evidence as Evidence,reviewStatus:"approved" });
  }
  let application: ApprovedRuleSet["application"];
  if (value.application !== undefined) {
    if (!isRecord(value.application) || !Array.isArray(value.application.fields) || value.application.fields.length > 0 && value.application.fields.length > 100) return null;
    if (!Array.isArray(value.application.documents) || value.application.documents.length > 100 || !value.application.documents.every((d) => typeof d === "string" && d.length <= 240)) return null;
    const fields: ApplicationFieldMapping[] = [];
    const fieldKeys = new Set<string>();
    for (const item of value.application.fields) {
      if (!isRecord(item) || typeof item.key !== "string" || !/^[a-z][a-z0-9_]{1,79}$/.test(item.key) ||
        typeof item.label !== "string" || !item.label.trim() || item.label.length > 180 ||
        typeof item.profileField !== "string" || !PROFILE_FIELDS.has(item.profileField as ProfileField) ||
        typeof item.required !== "boolean" || !["text","number","boolean"].includes(String(item.type))) return null;
      if (FORBIDDEN.test(item.key) || FORBIDDEN.test(item.profileField) || fieldKeys.has(item.key)) return null;
      fieldKeys.add(item.key);
      if (item.maxLength !== undefined && (!Number.isInteger(item.maxLength) || Number(item.maxLength) < 1 || Number(item.maxLength) > 500)) return null;
      if (item.min !== undefined && (typeof item.min !== "number" || !Number.isFinite(item.min))) return null;
      if (item.max !== undefined && (typeof item.max !== "number" || !Number.isFinite(item.max))) return null;
      if (item.min !== undefined && item.max !== undefined && Number(item.min) > Number(item.max)) return null;
      if (item.allowedValues !== undefined && (!Array.isArray(item.allowedValues) || item.allowedValues.length > 100 || !item.allowedValues.every(isScalar))) return null;
      fields.push({ key:item.key,label:item.label,profileField:item.profileField as ProfileField,required:item.required,type:item.type as ApplicationFieldMapping["type"],maxLength:item.maxLength as number | undefined,min:item.min as number | undefined,max:item.max as number | undefined,allowedValues:item.allowedValues as Scalar[] | undefined });
    }
    application = { fields, documents:value.application.documents as string[] };
  }
  return { schemaVersion:1,state:"approved",rules,application };
}

function missing(value: unknown): boolean {
  return value === null || value === undefined || value === "" || value === "unknown";
}
function evaluateRule(rule: EligibilityRule, profile: CitizenProfile): RuleCheck["state"] {
  const actual = profile[rule.profileField] as unknown;
  if (missing(actual)) return "unknown";
  const expected = rule.expected;
  switch (rule.operator) {
    case "eq": return actual === expected ? "matched" : "not_matched";
    case "neq": return actual !== expected ? "matched" : "not_matched";
    case "gt": return typeof actual === "number" && typeof expected === "number" ? actual > expected ? "matched" : "not_matched" : "unknown";
    case "gte": return typeof actual === "number" && typeof expected === "number" ? actual >= expected ? "matched" : "not_matched" : "unknown";
    case "lt": return typeof actual === "number" && typeof expected === "number" ? actual < expected ? "matched" : "not_matched" : "unknown";
    case "lte": return typeof actual === "number" && typeof expected === "number" ? actual <= expected ? "matched" : "not_matched" : "unknown";
    case "in": return Array.isArray(expected) ? expected.includes(actual as Scalar) ? "matched" : "not_matched" : "unknown";
    case "not_in": return Array.isArray(expected) ? expected.includes(actual as Scalar) ? "not_matched" : "matched" : "unknown";
    case "is_true": return actual === true ? "matched" : actual === false ? "not_matched" : "unknown";
    case "is_false": return actual === false ? "matched" : actual === true ? "not_matched" : "unknown";
  }
}

export function assessApprovedScheme(profile: CitizenProfile, scheme: ApprovedSchemeVersion, now = new Date()): Assessment {
  const base = { schemeId:scheme.schemeId, checks:[] as RuleCheck[], nextActions:[] as string[] };
  if (scheme.publicationStatus !== "published" || scheme.verificationStatus !== "independently_approved") {
    return { ...base,state:"needs_verification",headline:"Scheme verification is incomplete",explanation:"This scheme version is not independently approved and published. No eligibility result can be issued.",nextActions:["Wait for independent source, eligibility-rule and legal review."] };
  }
  if (scheme.effectiveFrom && !isIsoDate(scheme.effectiveFrom) || scheme.effectiveTo && !isIsoDate(scheme.effectiveTo)) {
    return { ...base,state:"needs_verification",headline:"Scheme effective dates are invalid",explanation:"The effective period cannot be trusted; no eligibility assessment was made.",nextActions:["Verify the current official scheme notification."] };
  }
  const rules = parseRuleSet(scheme.ruleSet);
  if (!rules) return { ...base,state:"needs_verification",headline:"Eligibility rules are not machine-verifiable",explanation:"The published scheme does not contain a complete, approved, supported rule-set version. No automated assessment was made.",nextActions:["Complete the structured eligibility rules and independent review."] };
  if (scheme.effectiveFrom && Date.parse(scheme.effectiveFrom) > now.getTime() || scheme.effectiveTo && Date.parse(scheme.effectiveTo) < now.getTime()) {
    return { ...base,state:"needs_verification",headline:"Scheme version is outside its effective period",explanation:"The approved scheme version is not currently effective.",nextActions:["Check the latest official scheme notification."] };
  }
  const checks: RuleCheck[] = rules.rules.map((rule) => {
    const checkedAt = new Date(rule.evidence.sourceCheckedAt);
    const fresh = Number.isFinite(checkedAt.getTime()) && now.getTime() - checkedAt.getTime() <= 90 * 86400000 && checkedAt.getTime() <= now.getTime() + 86400000;
    const state = fresh ? evaluateRule(rule,profile) : "unknown";
    return { key:rule.key,label:rule.label,state,evidence:fresh ? rule.evidence.excerpt : "Official source evidence is older than the 90-day freshness window.",rule:rule.operator+" "+JSON.stringify(rule.expected ?? "") };
  });
  const failed = checks.some((check) => check.state === "not_matched");
  const unknown = checks.some((check) => check.state === "unknown");
  const state: Assessment["state"] = failed ? "not_matched" : unknown ? "needs_verification" : "potential_match";
  const nextActions = checks.filter((check) => check.state === "unknown").map((check) => "Verify: "+check.label);
  if (state === "potential_match") nextActions.push("Review the official source and all declarations before preparing an application.");
  if (state === "not_matched") nextActions.push("This profile does not match at least one independently reviewed rule; confirm the latest official rules before deciding not to apply.");
  return {
    schemeId:scheme.schemeId,schemeReviewStatusAtAssessment:"approved",state,
    headline:state === "potential_match" ? "Potential match — official verification still required" : state === "not_matched" ? "Does not match one or more reviewed rules" : "More information or fresh evidence is required",
    explanation:"This is a deterministic screen against the currently approved scheme version. It is not a government decision, benefit guarantee or substitute for department verification.",
    checks,nextActions
  };
}

export function prepareApplicationDraft(profile: CitizenProfile, scheme: ApprovedSchemeVersion, assessment: Assessment): PreparedApplication {
  const base: PreparedApplication = { status:"blocked",fields:[],documents:[],missingFields:[],validationErrors:[],requiresCitizenApproval:true,submissionStatus:"not_submitted" };
  if (assessment.state !== "potential_match" || assessment.schemeId !== scheme.schemeId || assessment.schemeReviewStatusAtAssessment !== "approved" || scheme.publicationStatus !== "published" || scheme.verificationStatus !== "independently_approved") {
    return { ...base,validationErrors:["A potential-match assessment against an independently approved, published scheme is required before preparing fields."] };
  }
  const rules = parseRuleSet(scheme.ruleSet);
  if (!rules?.application || rules.application.fields.length === 0) {
    return { ...base,validationErrors:["This scheme has no independently reviewed application-field mapping."] };
  }
  const fields: PreparedField[] = [];
  const missingFields: string[] = [];
  const validationErrors: string[] = [];
  for (const mapping of rules.application.fields) {
    const raw = profile[mapping.profileField] as unknown;
    const absent = missing(raw);
    if (absent && mapping.required) missingFields.push(mapping.label);
    if (!absent) {
      if (mapping.type === "text" && typeof raw !== "string" || mapping.type === "number" && (typeof raw !== "number" || !Number.isFinite(raw)) || mapping.type === "boolean" && typeof raw !== "boolean") {
        validationErrors.push(mapping.label+" has an invalid value type.");
      }
      if (typeof raw === "string" && mapping.maxLength !== undefined && raw.length > mapping.maxLength) validationErrors.push(mapping.label+" exceeds its maximum length.");
      if (typeof raw === "number" && mapping.min !== undefined && raw < mapping.min || typeof raw === "number" && mapping.max !== undefined && raw > mapping.max) validationErrors.push(mapping.label+" is outside the allowed range.");
      if (mapping.allowedValues && !mapping.allowedValues.includes(raw as Scalar)) validationErrors.push(mapping.label+" is not one of the allowed values.");
    }
    fields.push({ key:mapping.key,label:mapping.label,value:absent ? null : raw as string | number | boolean,status:absent ? "missing" : "provided",source:"citizen_profile",requiresCitizenConfirmation:true });
  }
  return {
    status:missingFields.length || validationErrors.length ? "blocked" : "ready_for_citizen_review",
    fields,documents:rules.application.documents,missingFields,validationErrors,
    requiresCitizenApproval:true,submissionStatus:"not_submitted"
  };
}

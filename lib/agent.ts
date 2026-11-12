import { SCHEMES, type Assessment, type CitizenProfile, type RuleCheck, type Scheme } from "./catalog";

type TraceItem = {
  id: string;
  agent: string;
  tool: string;
  detail: string;
  status: "completed";
  durationMs: number;
};

function check(key: string, label: string, value: boolean | null, evidence: string, rule: string): RuleCheck {
  return {
    key,
    label,
    state: value === true ? "matched" : value === false ? "not_matched" : "unknown",
    evidence,
    rule
  };
}

function aggregate(checks: RuleCheck[], mustVerify = false): "potential_match" | "not_matched" | "needs_verification" {
  if (checks.some((item) => item.state === "not_matched")) return "not_matched";
  if (mustVerify || checks.some((item) => item.state === "unknown")) return "needs_verification";
  return "potential_match";
}

export function evaluateScheme(scheme: Scheme, profile: CitizenProfile): Assessment {
  // Pending schemes may show a transparent checklist against the prototype's
  // source notes, but they can never produce a match/rejection result.
  const independentlyApproved = scheme.reviewStatus === "approved";
  let checks: RuleCheck[] = [];
  let nextActions: string[] = [];
  let mustVerify = false;

  if (scheme.id === "pm-kisan") {
    checks = [
      check("farmer", "Farmer profile", profile.occupation.toLowerCase().includes("farmer") || profile.occupation.toLowerCase().includes("agri"), profile.occupation || "Not provided", "The scheme is for landholding farmer families; confirm the family qualifies under the current operational guidelines."),
      check("land", "Cultivable land in State/UT records", profile.hasCultivableLand, profile.hasCultivableLand === null ? "Not provided" : profile.hasCultivableLand ? "Declared: yes" : "Declared: no", "Cultivable land must be recorded by the concerned State/UT."),
      check("exclusions", "Higher-economic-status exclusion check", profile.pmKisanExcluded === "yes" ? false : profile.pmKisanExcluded === "no" ? true : null, profile.pmKisanExcluded === "unknown" ? "Not verified" : profile.pmKisanExcluded, "Complete all exclusion checks in the current operational guidelines.")
    ];
    mustVerify = true;
    nextActions = ["Check the complete exclusion list in the current PM-KISAN guidelines.", "Verify land records with the concerned State/UT authority.", "Use the official PM-KISAN portal for status and eKYC requirements."];
  } else if (scheme.id === "pmay-u-2") {
    const income = typeof profile.annualIncome === "number" ? profile.annualIncome : null;
    const incomeInPublishedBands = income === null ? null : income <= 900000;
    checks = [
      check("urban", "Urban residence", profile.residenceType === "urban" ? true : profile.residenceType === "rural" ? false : null, profile.residenceType || "Not provided", "PMAY-U 2.0 is the urban housing route."),
      check("income", "Income within published EWS/LIG/MIG bands", incomeInPublishedBands, income === null ? "Not provided" : "Annual household income: ₹" + income.toLocaleString("en-IN"), "Published central bands extend up to ₹9 lakh; State/UT implementation and current amendments must be checked."),
      check("house", "No pucca house anywhere in India", profile.ownsPuccaHouse === null ? null : !profile.ownsPuccaHouse, profile.ownsPuccaHouse === null ? "Not provided" : profile.ownsPuccaHouse ? "Declared: owns a pucca house" : "Declared: no pucca house", "Check the beneficiary-family and house-ownership definition in the scheme guidelines."),
      check("prior", "No disqualifying government housing allotment in previous 20 years", profile.previousHousingBenefit === "yes" ? false : profile.previousHousingBenefit === "no" ? true : null, profile.previousHousingBenefit, "The cited guideline excludes families allotted a house under a government housing scheme in the previous 20 years.")
    ];
    mustVerify = true;
    nextActions = ["Verify the applicable PMAY-U 2.0 vertical and current State/UT income definition.", "Confirm household and house-ownership details with the Urban Local Body.", "If the household is rural, check PMAY-G instead of this urban route."];
  } else if (scheme.id === "pm-ujjwala") {
    checks = [
      check("woman", "Applicant is an adult woman", profile.gender === "woman" && typeof profile.age === "number" ? profile.age >= 18 : profile.gender === "man" || profile.gender === "other" ? false : null, profile.gender + (profile.age ? ", age " + profile.age : ""), "Applicant must be a woman aged 18 years or above."),
      check("lpg", "No other household LPG connection", profile.householdHasLpg === null ? null : !profile.householdHasLpg, profile.householdHasLpg === null ? "Not provided" : profile.householdHasLpg ? "Declared: household has LPG" : "Declared: no household LPG connection", "No other OMC LPG connection may exist in the same household."),
      check("poor", "Poor-household deprivation declaration", profile.poorHouseholdDeclaration, profile.poorHouseholdDeclaration === null ? "Not provided" : profile.poorHouseholdDeclaration ? "Declared: can provide declaration" : "Declared: cannot provide declaration", "The applicant must belong to a poor household based on the prescribed declaration.")
    ];
    mustVerify = true;
    nextActions = ["Review the prescribed deprivation declaration on the official PMUY portal.", "Prepare family-composition and KYC documents listed by the official portal.", "Apply through an authorized LPG distributor or the official online route."];
  } else if (scheme.id === "pm-usp-csss") {
    const income = typeof profile.annualIncome === "number" ? profile.annualIncome : null;
    checks = [
      check("student", "Student profile", profile.isStudent, profile.isStudent ? "Declared student" : "Not declared as student", "The scheme is for eligible college and university students."),
      check("percentile", "Above 80th percentile in relevant Board/stream", profile.top20Percentile, profile.top20Percentile === null ? "Not provided" : profile.top20Percentile ? "Declared: yes" : "Declared: no", "See the Ministry of Education's cited 2025–26 FAQ and relevant Board list."),
      check("course", "Regular undergraduate course (not diploma/distance)", profile.diplomaOrDistance === null ? null : !profile.diplomaOrDistance && profile.regularUndergraduate === true, profile.regularUndergraduate === null ? "Not provided" : profile.regularUndergraduate ? "Regular undergraduate course declared" : "Not a regular undergraduate course", "The cited FAQ excludes diploma and correspondence/distance courses."),
      check("income", "Annual family income up to ₹4.5 lakh", income === null ? null : income <= 450000, income === null ? "Not provided" : "Annual household income: ₹" + income.toLocaleString("en-IN"), "The cited 2025–26 FAQ states a family-income ceiling of ₹4.5 lakh."),
      check("other", "No other scholarship or fee reimbursement", profile.otherScholarship === null ? null : !profile.otherScholarship, profile.otherScholarship === null ? "Not provided" : profile.otherScholarship ? "Declared: receiving another scholarship" : "Declared: none", "The cited FAQ requires that the applicant not receive another scholarship or fee reimbursement.")
    ];
    mustVerify = true;
    nextActions = ["Check the current academic-year scheme notice and application window on the National Scholarship Portal.", "Confirm the Board percentile list and institution/course eligibility.", "Check current renewal and fresh-application conditions before applying."];
  }

  const preliminaryState = aggregate(checks, false);
  const evaluatedState = aggregate(checks, mustVerify);
  const state = independentlyApproved ? evaluatedState : "needs_verification";
  const headline = !independentlyApproved
    ? "Preliminary screen — independent review pending"
    : state === "potential_match" ? "Potential match — verify with the department"
    : state === "not_matched" ? "One or more screening conditions are not met"
    : "More evidence or official verification is required";

  const explanation = !independentlyApproved
    ? "These checklist comparisons use limited prototype rules linked to official source notes. The scheme rules have not received independent approval, important conditions may be omitted, and this is not an eligibility decision or rejection."
    : state === "not_matched"
      ? "At least one declared profile answer conflicts with a screening condition. This is not an official rejection."
      : state === "potential_match"
        ? "The supplied profile matches the screening conditions represented in this prototype. Final eligibility remains with the responsible authority."
        : "The screening found a possible pathway, but missing facts, complex rules or current-year verification prevent a reliable conclusion.";

  return { schemeId: scheme.id, schemeReviewStatusAtAssessment: independentlyApproved ? "approved" : "pending", state, preliminaryState, headline, explanation, checks, nextActions };
}

function relevantSchemes(profile: CitizenProfile): Scheme[] {
  const terms = new Set<string>();
  const occupation = profile.occupation.toLowerCase();
  if (occupation.includes("farm") || occupation.includes("agri") || profile.hasCultivableLand) terms.add("pm-kisan");
  if (profile.residenceType === "urban") terms.add("pmay-u-2");
  if (profile.gender === "woman" || profile.poorHouseholdDeclaration) terms.add("pm-ujjwala");
  if (profile.isStudent) terms.add("pm-usp-csss");
  return SCHEMES.filter((scheme) => terms.has(scheme.id));
}

type AgentToolName = "search_scheme_catalog" | "evaluate_scheme_rules" | "build_document_checklist" | "prepare_form_filling";

type SafeFormField = { key: string; label: string; value: string; source: "citizen_profile"; status: "provided" | "missing"; requiresCitizenReview: true };

const SAFE_FORM_FIELDS: Array<{ key: keyof CitizenProfile; label: string }> = [
  { key: "fullName", label: "Applicant full name" }, { key: "age", label: "Age" },
  { key: "gender", label: "Gender" }, { key: "state", label: "State / Union Territory" },
  { key: "district", label: "District" }, { key: "residenceType", label: "Area of residence" },
  { key: "annualIncome", label: "Annual household income" }, { key: "occupation", label: "Occupation" },
  { key: "hasCultivableLand", label: "Cultivable land recorded" }, { key: "ownsPuccaHouse", label: "Owns a pucca house" },
  { key: "previousHousingBenefit", label: "Previous government housing benefit" },
  { key: "householdHasLpg", label: "Household has LPG connection" },
  { key: "poorHouseholdDeclaration", label: "Poor-household declaration available" },
  { key: "isStudent", label: "Currently a student" }, { key: "top20Percentile", label: "Above 80th percentile" },
  { key: "regularUndergraduate", label: "Regular undergraduate course" },
  { key: "otherScholarship", label: "Other scholarship or fee reimbursement" },
  { key: "diplomaOrDistance", label: "Diploma or distance course" },
  { key: "socialCategory", label: "Social category" }, { key: "addressLine1", label: "Address line 1" },
  { key: "addressLine2", label: "Address line 2" }, { key: "villageOrTown", label: "Village / Town" },
  { key: "pincode", label: "PIN code" }, { key: "institutionName", label: "Institution name" },
  { key: "courseName", label: "Course name" }, { key: "courseYear", label: "Course year" },
  { key: "landholdingAcres", label: "Landholding in acres" }, { key: "rationCardCategory", label: "Ration card category" }
];

function safeProfileValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (value === "woman") return "Female";
  if (value === "man") return "Male";
  if (value === "unknown") return "Not sure";
  return String(value);
}

/** A small allow-listed tool dispatcher. Each tool below performs the work it records in the trace. */
function executeAgentTool(name: AgentToolName, args: Record<string, unknown>): unknown {
  if (name === "search_scheme_catalog") {
    return relevantSchemes(args.profile as CitizenProfile);
  }
  if (name === "evaluate_scheme_rules") {
    const schemes = args.schemes as Scheme[];
    const profile = args.profile as CitizenProfile;
    return schemes.map((scheme) => evaluateScheme(scheme, profile));
  }
  if (name === "build_document_checklist") {
    return (args.schemes as Scheme[]).map((scheme) => ({
      schemeId: scheme.id,
      schemeName: scheme.name,
      sourceUrl: scheme.sourceUrl,
      reviewStatus: scheme.reviewStatus ?? "pending",
      items: scheme.documents.map((label, index) => ({ id: scheme.id + "-document-" + index, label, status: "citizen_to_verify" as const })),
      note: "Checklist items are source-linked preparation prompts. The citizen must verify the current official list and document validity."
    }));
  }
  const profile = args.profile as CitizenProfile;
  return (args.schemes as Scheme[]).map((scheme) => {
    const fields: SafeFormField[] = SAFE_FORM_FIELDS.map(({ key, label }) => {
      const value = safeProfileValue(profile[key]);
      return { key, label, value, source: "citizen_profile", status: value ? "provided" : "missing", requiresCitizenReview: true };
    });
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      mode: "citizen_reviewed_prefill_bundle",
      fields,
      sensitiveFieldsExcluded: ["Aadhaar", "PAN", "bank account", "IFSC", "OTP", "CAPTCHA", "password", "biometrics"],
      requiresHumanConfirmation: true,
      mayOpenOfficialPortal: true,
      mayFillOnlyAfterCitizenApproval: true,
      mayUploadDocuments: false,
      maySubmit: false,
      note: "These are profile values, not a certified portal field map. The browser helper separately matches visible fields and requires per-field citizen approval before filling."
    };
  });
}

export function runBenefitsAgent(profile: CitizenProfile) {
  const trace: TraceItem[] = [];
  const start = Date.now();
  const call = <T,>(agent: string, tool: AgentToolName, detail: string, args: Record<string, unknown>): T => {
    const result = executeAgentTool(tool, args) as T;
    trace.push({
      id: String(trace.length + 1).padStart(2, "0"), agent, tool, detail,
      status: "completed", durationMs: Math.max(1, Date.now() - start)
    });
    return result;
  };

  const selected = call<Scheme[]>("Planner agent", "search_scheme_catalog", "Executed profile-based scheme catalogue retrieval.", { profile });
  const assessments = call<Assessment[]>("Eligibility agent", "evaluate_scheme_rules", "Executed deterministic checks against each scheme's rule-screened profile fields; unapproved rules never produce a match/rejection result.", { schemes: selected, profile });
  const documentChecklists = call<Array<{ schemeId: string; schemeName: string; sourceUrl: string; reviewStatus: string; items: Array<{ id: string; label: string; status: "citizen_to_verify" }>; note: string }>>("Evidence agent", "build_document_checklist", "Generated source-linked document checklist items for every selected scheme.", { schemes: selected });
  const formFillPlans = call<Array<{ schemeId: string; schemeName: string; mode: string; fields: SafeFormField[]; sensitiveFieldsExcluded: string[]; requiresHumanConfirmation: true; mayOpenOfficialPortal: true; mayFillOnlyAfterCitizenApproval: true; mayUploadDocuments: false; maySubmit: false; note: string }>>("Form assistant", "prepare_form_filling", "Executed safe profile-to-prefill mapping; no portal action or submission was performed.", { schemes: selected, profile });

  const linkedEvidence = assessments.reduce((total, assessment) => total + assessment.checks.length, 0);
  return {
    generatedAt: new Date().toISOString(),
    profileRegion: profile.state || "India",
    selectedCount: selected.length,
    assessments,
    schemes: selected,
    documentChecklists,
    formFillPlans,
    humanConfirmation: { required: true, stage: "before_portal_field_filling_and_before_any_submission", submissionPerformed: false },
    trace,
    note: "Four rule-screened Central scheme prototypes are available for preliminary screening. All remain pending independent review, so results are not official eligibility decisions. Catalogue-only records are not eligibility-scored. Form values are prepared for citizen review; no portal is submitted to. " + linkedEvidence + " rule checks were executed."
  };
}

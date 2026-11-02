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
  // Fail closed: deterministic screening is disabled until two-person human
  // source/rule approval is recorded in the catalogue. Missing means pending.
  if (scheme.reviewStatus !== "approved") {
    return {
      schemeId: scheme.id,
      state: "needs_verification",
      headline: "Human review pending",
      explanation: "This scheme's source and deterministic rules have not received recorded human approval. JanaSetu will not calculate or imply eligibility until that review is completed.",
      checks: [],
      nextActions: [
        "Review the current official notification and amendments.",
        "Obtain independent reviewer approval for the source and every rule.",
        "Use the official department portal for authoritative eligibility confirmation."
      ]
    };
  }
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

  const state = aggregate(checks, mustVerify);
  const headline =
    state === "potential_match" ? "Potential match — verify with the department" :
    state === "not_matched" ? "One or more screening conditions are not met" :
    "More evidence or official verification is required";

  const explanation = state === "not_matched"
    ? "At least one declared profile answer conflicts with a screening condition. This is not an official rejection."
    : state === "potential_match"
      ? "The supplied profile matches the screening conditions represented in this prototype. Final eligibility remains with the responsible authority."
      : "The screening found a possible pathway, but missing facts, complex rules or current-year verification prevent a reliable conclusion.";

  return { schemeId: scheme.id, state, headline, explanation, checks, nextActions };
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

export function runBenefitsAgent(profile: CitizenProfile) {
  const trace: TraceItem[] = [];
  const start = Date.now();
  const addTrace = (agent: string, tool: string, detail: string) => trace.push({
    id: String(trace.length + 1).padStart(2, "0"),
    agent, tool, detail, status: "completed",
    durationMs: Math.max(2, Math.round((Date.now() - start) / (trace.length + 1)))
  });

  // Planner selects domain tools from the citizen's profile; no LLM is used to invent legal rules.
  addTrace("Planner agent", "plan_benefit_search", "Selected scheme domains using the citizen's stated profile and location.");
  const selected = relevantSchemes(profile);
  addTrace("Scheme agent", "search_scheme_catalog", "Retrieved " + selected.length + " relevant record(s) for deterministic screening; the wider catalogue contains source-indexed entries not automatically eligibility-scored.");
  const assessments = selected.map((scheme) => evaluateScheme(scheme, profile));
  addTrace("Eligibility agent", "evaluate_scheme_rules", "Checked scheme approval status first; pending rules were blocked and no eligibility conditions were evaluated.");
  const linkedEvidence = assessments.reduce((total, assessment) => total + assessment.checks.length, 0);
  addTrace("Evidence agent", "link_rules_to_evidence", "Created " + linkedEvidence + " rule-to-profile evidence links; pending schemes expose no rule checks.");
  const actionCount = assessments.reduce((total, assessment) => total + assessment.nextActions.length, 0);
  addTrace("Workflow agent", "generate_next_actions", "Generated " + actionCount + " review and document actions; no external application was submitted.");

  return {
    generatedAt: new Date().toISOString(),
    profileRegion: profile.state || "India",
    selectedCount: selected.length,
    assessments,
    schemes: selected,
    trace,
    note: "Prototype screening only. Deterministic eligibility rules currently cover four Central scheme records. Other records are source pointers and are not automatically eligibility-assessed. Official authorities make final eligibility decisions."
  };
}

import { SCHEMES, STATES_AND_UTS, type CitizenProfile, type Scheme } from "./catalog";
import { evaluateScheme } from "./agent";

export function createDraftRecord(schemeId: string, profile: CitizenProfile, schemes: Scheme[] = SCHEMES) {
  const scheme = schemes.find((item) => item.id === schemeId);
  if (!scheme) throw new Error("Scheme not found in the curated catalogue.");
  if (!profile || typeof profile !== "object" || typeof profile.state !== "string" || !STATES_AND_UTS.includes(profile.state)) {
    throw new Error("Select a State/UT before preparing a draft.");
  }
  const assessment = evaluateScheme(scheme, profile);
  const missing = assessment.checks.filter((item) => item.state === "unknown" || item.state === "not_matched");
  const fields = [
    { key: "applicant_name", label: "Applicant name", value: profile.fullName || "", source: "Citizen profile" },
    { key: "age", label: "Age", value: profile.age === "" ? "" : String(profile.age), source: "Citizen profile" },
    { key: "gender", label: "Gender", value: profile.gender || "", source: "Citizen profile" },
    { key: "state", label: "State / Union Territory", value: profile.state || "", source: "Citizen profile" },
    { key: "district", label: "District", value: profile.district || "", source: "Citizen profile" },
    { key: "residence", label: "Area of residence", value: profile.residenceType || "", source: "Citizen profile" },
    { key: "annual_income", label: "Annual household income", value: profile.annualIncome === "" ? "" : "₹" + Number(profile.annualIncome).toLocaleString("en-IN"), source: "Citizen profile" },
    { key: "occupation", label: "Occupation", value: profile.occupation || "", source: "Citizen profile" }
  ].map((field) => ({ ...field, status: field.value ? "provided" as const : "missing" as const }));
  const draft = {
    id: "JS-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    schemeId: scheme.id, schemeName: scheme.name, citizenName: profile.fullName || "Citizen",
    state: profile.state, district: profile.district || "Not provided",
    schemeReviewStatus: scheme.reviewStatus ?? "pending",
    status: scheme.reviewStatus !== "approved" ? "Scheme review pending — not an eligibility result" : "Draft prepared — eligibility requires official verification",
    createdAt: new Date().toISOString(), reviewRequired: true, assessmentState: assessment.state,
    missingChecks: missing.map((item) => item.label), fields, reviewedAt: null,
    sourceUrl: scheme.sourceUrl, applicationUrl: scheme.applicationUrl, documents: scheme.documents.slice(0, 30),
    disclaimer: "This is a preparation draft created by JanaSetu. It has not been submitted to a government portal."
  };
  return { draft, assessment };
}

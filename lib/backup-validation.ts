import { SCHEMES, STATES_AND_UTS, type Assessment, type CitizenProfile, type LanguageCode } from "./catalog";
import { parseCitizenProfile } from "./profile-validation";

export type DraftField = { key: string; label: string; value: string; source: string; status: "provided" | "missing" };
export type LocalApplicationRecord = {
  id: string; schemeId: string; schemeName: string; citizenName: string;
  state: string; district: string; status: string; createdAt: string;
  reviewRequired: boolean; assessmentState?: Assessment["state"];
  schemeReviewStatus?: "pending" | "approved" | "missing";
  missingChecks: string[]; sourceUrl: string; disclaimer: string;
  fields?: DraftField[]; reviewedAt?: string | null;
};
export type LocalDocumentRecord = { id: string; name: string; type: string; size: number; addedAt: string; status: string };
export type LocalTaskRecord = { id: string; title: string; dueAt: string; status: string; note: string };

const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;
const MAX_TEXT = 5000;
const text = (value: unknown, max = MAX_TEXT): string | null =>
  typeof value === "string" && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) ? value : null;
const iso = (value: unknown): string | null => {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toISOString();
};
const id = (value: unknown): string | null => typeof value === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(value) ? value : null;
const enumAssessment = (value: unknown): Assessment["state"] =>
  value === "potential_match" || value === "not_matched" || value === "needs_verification" ? value : "needs_verification";

export function parseBackupProfile(value: unknown): CitizenProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "fullName", "age", "gender", "state", "district", "residenceType", "annualIncome", "occupation",
    "hasCultivableLand", "pmKisanExcluded", "ownsPuccaHouse", "previousHousingBenefit", "householdHasLpg",
    "poorHouseholdDeclaration", "isStudent", "top20Percentile", "regularUndergraduate", "otherScholarship", "diplomaOrDistance"
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) return null;
  return parseCitizenProfile(value);
}

export function parseBackupLanguage(value: unknown): LanguageCode {
  return value === "hi" || value === "kn" || value === "ta" || value === "te" || value === "ml" ? value : "en";
}

export function parseBackupDocuments(value: unknown): LocalDocumentRecord[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item): LocalDocumentRecord[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const docId = id(record.id), name = text(record.name, 255), type = text(record.type, 100), addedAt = iso(record.addedAt);
    if (!docId || !name || !type || !addedAt || typeof record.size !== "number" || !Number.isFinite(record.size) || record.size < 0 || record.size > MAX_DOCUMENT_BYTES) return [];
    const safeName = name.split(/[\\/]/).pop()?.trim();
    if (!safeName) return [];
    return [{ id: docId, name: safeName, type, size: record.size, addedAt, status: "Added — manual verification pending" }];
  });
}

export function parseBackupTasks(value: unknown): LocalTaskRecord[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item): LocalTaskRecord[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const taskId = id(record.id), title = text(record.title, 160), dueAt = iso(record.dueAt), note = text(record.note, 500);
    if (!taskId || !title || !dueAt || !note) return [];
    return [{ id: taskId, title, dueAt, status: "open", note }];
  });
}

function parseDraftFields(value: unknown): DraftField[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.slice(0, 50).flatMap((item): DraftField[] => {
    if (!item || typeof item !== "object") return [];
    const field = item as Record<string, unknown>;
    const key = text(field.key, 100), label = text(field.label, 160), fieldValue = text(field.value, 500), source = text(field.source, 160);
    if (!key || !label || fieldValue === null || !source) return [];
    return [{ key, label, value: fieldValue, source, status: fieldValue ? "provided" : "missing" }];
  });
}

export function parseBackupApplications(value: unknown, options: { trustLocalStorage?: boolean } = {}): LocalApplicationRecord[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item): LocalApplicationRecord[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const appId = id(record.id), schemeId = text(record.schemeId, 100);
    if (!appId || !schemeId) return [];
    const scheme = SCHEMES.find((entry) => entry.id === schemeId);
    const schemeName = text(record.schemeName, 200) || "Scheme unavailable";
    const citizenName = text(record.citizenName, 100) || "Citizen";
    const state = typeof record.state === "string" && STATES_AND_UTS.includes(record.state) ? record.state : "Not provided";
    const district = text(record.district, 100) || "Not provided";
    const createdAt = iso(record.createdAt) || new Date().toISOString();
    const missingChecks = Array.isArray(record.missingChecks) ? record.missingChecks.slice(0, 50).flatMap((check) => { const v = text(check, 200); return v ? [v] : []; }) : [];
    const reviewedAt = iso(record.reviewedAt);
    const preserveReviewedState = options.trustLocalStorage === true && scheme?.reviewStatus === "approved" && record.reviewRequired === false && reviewedAt !== null;
    return [{
      id: appId, schemeId, schemeName: scheme?.name || schemeName, citizenName, state, district,
      status: scheme?.reviewStatus === "approved" ? "Draft prepared — eligibility requires official verification" : scheme ? "Scheme review pending — not an eligibility result" : "Scheme no longer in the current catalogue — verify manually",
      createdAt, reviewRequired: !preserveReviewedState, assessmentState: enumAssessment(record.assessmentState),
      schemeReviewStatus: scheme?.reviewStatus ?? "missing", missingChecks,
      sourceUrl: scheme?.sourceUrl || "https://www.myscheme.gov.in/",
      disclaimer: "This is a preparation draft created by JanaSetu. It has not been submitted to a government portal.",
      fields: parseDraftFields(record.fields), reviewedAt: preserveReviewedState ? reviewedAt : null
    }];
  });
}

export function parseBackupAssessments(value: unknown, options: { trustLocalStorage?: boolean } = {}): Assessment[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item): Assessment[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const schemeId = text(record.schemeId, 100), headline = text(record.headline, 300), explanation = text(record.explanation, 3000);
    if (!schemeId || !headline || !explanation) return [];
    const scheme = SCHEMES.find((entry) => entry.id === schemeId);
    const preserveApprovalSnapshot = options.trustLocalStorage === true && scheme?.reviewStatus === "approved" && record.schemeReviewStatusAtAssessment === "approved";
    const checks = Array.isArray(record.checks) ? record.checks.slice(0, 100).flatMap((check): Assessment["checks"] => {
      if (!check || typeof check !== "object") return [];
      const row = check as Record<string, unknown>;
      const key = text(row.key, 100), label = text(row.label, 200), evidence = text(row.evidence, 1000), rule = text(row.rule, 1000);
      if (!key || !label || !evidence || !rule || !["matched", "not_matched", "unknown"].includes(String(row.state))) return [];
      return [{ key, label, evidence, rule, state: row.state as Assessment["checks"][number]["state"] }];
    }) : [];
    const nextActions = Array.isArray(record.nextActions) ? record.nextActions.slice(0, 50).flatMap((action) => { const v = text(action, 500); return v ? [v] : []; }) : [];
    return [{ schemeId, state: enumAssessment(record.state), headline, explanation, checks, nextActions,
      schemeReviewStatusAtAssessment: preserveApprovalSnapshot ? "approved" : "pending" }];
  });
}

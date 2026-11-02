import type { CitizenProfile } from "./catalog";

const keys: (keyof CitizenProfile)[] = [
  "fullName", "age", "gender", "state", "district", "residenceType", "annualIncome",
  "occupation", "hasCultivableLand", "pmKisanExcluded", "ownsPuccaHouse",
  "previousHousingBenefit", "householdHasLpg", "poorHouseholdDeclaration",
  "isStudent", "top20Percentile", "regularUndergraduate", "otherScholarship",
  "diplomaOrDistance"
];

const isBoolOrNull = (value: unknown): value is boolean | null => value === null || typeof value === "boolean";
const isNumberOrEmpty = (value: unknown, max: number): value is number | "" =>
  value === "" || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max);

export function parseCitizenProfile(value: unknown): CitizenProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !keys.includes(key as keyof CitizenProfile))) return null;

  const defaults: CitizenProfile = {
    fullName: "", age: "", gender: "", state: "", district: "", residenceType: "",
    annualIncome: "", occupation: "", hasCultivableLand: null, pmKisanExcluded: "unknown",
    ownsPuccaHouse: null, previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
  };
  const profile = { ...defaults, ...input } as CitizenProfile;

  if (typeof profile.fullName !== "string" || profile.fullName.length > 100) return null;
  if (!isNumberOrEmpty(profile.age, 120) || (typeof profile.age === "number" && !Number.isInteger(profile.age))) return null;
  if (!["", "woman", "man", "other"].includes(profile.gender)) return null;
  if (typeof profile.state !== "string" || profile.state.length > 80) return null;
  if (typeof profile.district !== "string" || profile.district.length > 100) return null;
  if (!["", "urban", "rural"].includes(profile.residenceType)) return null;
  if (!isNumberOrEmpty(profile.annualIncome, 100_000_000)) return null;
  if (typeof profile.occupation !== "string" || profile.occupation.length > 100) return null;
  if (!isBoolOrNull(profile.hasCultivableLand) || !isBoolOrNull(profile.ownsPuccaHouse) ||
      !isBoolOrNull(profile.householdHasLpg) || !isBoolOrNull(profile.poorHouseholdDeclaration) ||
      !isBoolOrNull(profile.top20Percentile) || !isBoolOrNull(profile.regularUndergraduate) ||
      !isBoolOrNull(profile.otherScholarship) || !isBoolOrNull(profile.diplomaOrDistance)) return null;
  if (!["yes", "no", "unknown"].includes(profile.pmKisanExcluded)) return null;
  if (!["yes", "no", "unknown"].includes(profile.previousHousingBenefit)) return null;
  if (typeof profile.isStudent !== "boolean") return null;

  return profile;
}

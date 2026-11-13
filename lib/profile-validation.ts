import { STATES_AND_UTS, type CitizenProfile } from "./catalog";

const keys: (keyof CitizenProfile)[] = [
  "fullName", "age", "gender", "state", "district", "residenceType", "annualIncome",
  "occupation", "hasCultivableLand", "pmKisanExcluded", "ownsPuccaHouse",
  "previousHousingBenefit", "householdHasLpg", "poorHouseholdDeclaration",
  "isStudent", "top20Percentile", "regularUndergraduate", "otherScholarship",
  "diplomaOrDistance", "dateOfBirth", "sslcRegistrationNumber", "casteCertificateRdNumber", "incomeCertificateRdNumber", "universityRegistrationNumber", "taluk", "assemblyConstituency", "mobileNumber", "emailAddress", "addressLine1", "addressLine2",
  "villageOrTown", "pincode", "fatherOrGuardianName", "motherName", "socialCategory",
  "landholdingAcres", "institutionName", "courseName", "courseYear", "rationCardCategory"
];

const OCCUPATION_ALIASES: Record<string, string> = {
  farmer: "Farmer", "किसान": "Farmer", "ರೈತ": "Farmer", "விவசாயி": "Farmer", "రైతు": "Farmer", "കർഷകൻ": "Farmer",
  "agricultural worker": "Agricultural worker", "कृषि श्रमिक": "Agricultural worker", "ಕೃಷಿ ಕಾರ್ಮಿಕ": "Agricultural worker", "வேளாண் தொழிலாளர்": "Agricultural worker", "వ్యవసాయ కార్మికుడు": "Agricultural worker", "കൃഷിത്തൊഴിലാളി": "Agricultural worker",
  student: "Student", "छात्र": "Student", "ವಿದ್ಯಾರ್ಥಿ": "Student", "மாணவர்": "Student", "విద్యార్థి": "Student", "വിദ്യാർത്ഥി": "Student",
  "self-employed": "Self-employed", "स्व-रोज़गार": "Self-employed", "ಸ್ವಯಂ ಉದ್ಯೋಗಿ": "Self-employed", "சுயதொழில்": "Self-employed", "స్వయం ఉపాధి": "Self-employed", "സ്വയം തൊഴിൽ": "Self-employed",
  vendor: "Vendor", "विक्रेता": "Vendor", "ವ್ಯಾಪಾರಿ": "Vendor", "விற்பனையாளர்": "Vendor", "విక్రేత": "Vendor", "വിൽപ്പനക്കാരൻ": "Vendor",
  salaried: "Salaried", "वेतनभोगी": "Salaried", "ಸಂಬಳದ ಉದ್ಯೋಗಿ": "Salaried", "சம்பளப் பணியாளர்": "Salaried", "వేతన ఉద్యోగి": "Salaried", "ശമ്പളക്കാരൻ": "Salaried",
  unemployed: "Unemployed", "बेरोज़गार": "Unemployed", "ನಿರುದ್ಯೋಗಿ": "Unemployed", "வேலைஇல்லாதவர்": "Unemployed", "నిరుద్యోగి": "Unemployed", "തൊഴിൽരഹിതൻ": "Unemployed",
  homemaker: "Homemaker", "गृहिणी": "Homemaker", "ಗೃಹಿಣಿ": "Homemaker", "இல்லத்தரசி": "Homemaker", "വീട്ടമ്മ": "Homemaker",
  other: "Other", "अन्य": "Other", "ಇತರೆ": "Other", "மற்றவை": "Other", "ఇతర": "Other", "മറ്റുള്ളവ": "Other"
};
const isBoolOrNull = (value: unknown): value is boolean | null => value === null || typeof value === "boolean";
const isNumberOrEmpty = (value: unknown, max: number): value is number | "" =>
  value === "" || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max);

export function parseCitizenProfile(value: unknown, options: { allowIncompleteContact?: boolean } = {}): CitizenProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !keys.includes(key as keyof CitizenProfile))) return null;

  const defaults: CitizenProfile = {
    fullName: "", age: "", gender: "", state: "", district: "", residenceType: "",
    annualIncome: "", occupation: "", hasCultivableLand: null, pmKisanExcluded: "unknown",
    ownsPuccaHouse: null, previousHousingBenefit: "unknown", householdHasLpg: null,
    poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
    regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null,
    dateOfBirth: "", sslcRegistrationNumber: "", casteCertificateRdNumber: "", incomeCertificateRdNumber: "", universityRegistrationNumber: "", taluk: "", assemblyConstituency: "",
    mobileNumber: "", emailAddress: "", addressLine1: "", addressLine2: "", villageOrTown: "",
    pincode: "", fatherOrGuardianName: "", motherName: "", socialCategory: "",
    landholdingAcres: "", institutionName: "", courseName: "", courseYear: "", rationCardCategory: ""
  };
  const profile = { ...defaults, ...input } as CitizenProfile;

  if (typeof profile.fullName !== "string" || profile.fullName.length > 100) return null;
  const boundedText: (keyof CitizenProfile)[] = ["dateOfBirth","sslcRegistrationNumber","casteCertificateRdNumber","incomeCertificateRdNumber","universityRegistrationNumber","taluk","assemblyConstituency","mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode","fatherOrGuardianName","motherName","institutionName","courseName","courseYear"];
  for (const key of boundedText) if (typeof profile[key] !== "string" || String(profile[key]).length > 160) return null;
  if (profile.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth)) return null;
  if (!options.allowIncompleteContact && profile.mobileNumber && !/^\+?[0-9]{10,13}$/.test(profile.mobileNumber.replace(/[\s-]/g,""))) return null;
  if (!options.allowIncompleteContact && profile.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.emailAddress)) return null;
  if (!options.allowIncompleteContact && profile.pincode && !/^[0-9]{6}$/.test(profile.pincode)) return null;
  if (!["","General","OBC","SC","ST","EWS","Other"].includes(profile.socialCategory ?? "")) return null;
  if (!["","AAY","PHH","BPL","APL","Other"].includes(profile.rationCardCategory ?? "")) return null;
  if (!isNumberOrEmpty(profile.landholdingAcres, 100000)) return null;
  if (!isNumberOrEmpty(profile.age, 120) || (typeof profile.age === "number" && !Number.isInteger(profile.age))) return null;
  if (!["", "woman", "man", "other"].includes(profile.gender)) return null;
  if (typeof profile.state !== "string" || profile.state.length > 80 || profile.state !== profile.state.trim()) return null;
  if (profile.state !== "" && !STATES_AND_UTS.includes(profile.state)) return null;
  if (typeof profile.district !== "string" || profile.district.length > 100) return null;
  if (!["", "urban", "rural"].includes(profile.residenceType)) return null;
  if (!isNumberOrEmpty(profile.annualIncome, 100_000_000)) return null;
  if (typeof profile.occupation !== "string" || profile.occupation.length > 100) return null;
  const occupation = profile.occupation.trim();
  const canonicalOccupation = OCCUPATION_ALIASES[occupation.toLocaleLowerCase()] || OCCUPATION_ALIASES[occupation] || occupation;
  if (!["", "Farmer", "Agricultural worker", "Student", "Self-employed", "Vendor", "Salaried", "Unemployed", "Homemaker", "Other"].includes(canonicalOccupation)) return null;
  profile.occupation = canonicalOccupation;
  if (!isBoolOrNull(profile.hasCultivableLand) || !isBoolOrNull(profile.ownsPuccaHouse) ||
      !isBoolOrNull(profile.householdHasLpg) || !isBoolOrNull(profile.poorHouseholdDeclaration) ||
      !isBoolOrNull(profile.top20Percentile) || !isBoolOrNull(profile.regularUndergraduate) ||
      !isBoolOrNull(profile.otherScholarship) || !isBoolOrNull(profile.diplomaOrDistance)) return null;
  if (!["yes", "no", "unknown"].includes(profile.pmKisanExcluded)) return null;
  if (!["yes", "no", "unknown"].includes(profile.previousHousingBenefit)) return null;
  if (typeof profile.isStudent !== "boolean") return null;

  return profile;
}

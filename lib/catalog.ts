export type RuleState = "matched" | "not_matched" | "unknown";
export type AssessmentState = "potential_match" | "not_matched" | "needs_verification";

export interface CitizenProfile {
  fullName: string;
  age: number | "";
  gender: "woman" | "man" | "other" | "";
  state: string;
  district: string;
  residenceType: "urban" | "rural" | "";
  annualIncome: number | "";
  occupation: string;
  hasCultivableLand: boolean | null;
  pmKisanExcluded: "yes" | "no" | "unknown";
  ownsPuccaHouse: boolean | null;
  previousHousingBenefit: "yes" | "no" | "unknown";
  householdHasLpg: boolean | null;
  poorHouseholdDeclaration: boolean | null;
  isStudent: boolean;
  top20Percentile: boolean | null;
  regularUndergraduate: boolean | null;
  otherScholarship: boolean | null;
  diplomaOrDistance: boolean | null;
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  ministry: string;
  summary: string;
  benefit: string;
  sourceUrl: string;
  sourceName: string;
  sourcePeriod: string;
  sourceChecked: string;
  geography: string;
  documents: string[];
  ruleNotes: string[];
  tags: string[];
}

export interface RuleCheck {
  key: string;
  label: string;
  state: RuleState;
  evidence: string;
  rule: string;
}

export interface Assessment {
  schemeId: string;
  state: AssessmentState;
  headline: string;
  explanation: string;
  checks: RuleCheck[];
  nextActions: string[];
}

export const STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    category: "Agriculture",
    ministry: "Department of Agriculture & Farmers Welfare",
    summary: "Income support for eligible landholding farmer families, subject to the scheme's exclusion criteria and State/UT verification.",
    benefit: "₹6,000 per year in three equal instalments, transferred through DBT (subject to eligibility and scheme rules).",
    sourceUrl: "https://pmkisan.gov.in/",
    sourceName: "PM-KISAN official portal and operational guidelines",
    sourcePeriod: "Operational Guidelines; official portal accessed 1 Nov 2026",
    sourceChecked: "2026-11-01",
    geography: "Central scheme — India",
    documents: ["State/UT land record or cultivable-land evidence", "Bank account details for the official application channel", "Identity and eKYC requirements as specified by the portal"],
    ruleNotes: [
      "The scheme is for landholding farmer families with cultivable land recorded by the concerned State/UT.",
      "The scheme has exclusion categories, including institutional landholders and specified higher-economic-status categories. The catalogue screening is not a substitute for the complete official exclusion check.",
      "The State/UT administration identifies and verifies eligible farmer families."
    ],
    tags: ["farmer", "agriculture", "income support"]
  },
  {
    id: "pmay-u-2",
    name: "Pradhan Mantri Awas Yojana — Urban 2.0",
    category: "Housing",
    ministry: "Ministry of Housing and Urban Affairs",
    summary: "Housing assistance for eligible urban EWS, LIG and MIG beneficiary families through the scheme's defined verticals.",
    benefit: "Assistance is delivered under the applicable PMAY-U 2.0 vertical; the amount and route depend on the component and eligibility.",
    sourceUrl: "https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf",
    sourceName: "PMAY-U 2.0 Scheme Guidelines, September 2024",
    sourcePeriod: "Guidelines dated September 2024; confirm later amendments and State/UT implementation",
    sourceChecked: "2026-11-01",
    geography: "Urban areas — India",
    documents: ["Household and family details", "Income certificate or other accepted income evidence", "Declaration/evidence regarding pucca house ownership across India", "Prior housing-assistance declaration"],
    ruleNotes: [
      "The guidelines define EWS as annual household income up to ₹3 lakh, LIG as ₹3–6 lakh and MIG as ₹6–9 lakh; States/UTs may have flexibility to redefine EWS with Ministry concurrence.",
      "The beneficiary family should not own a pucca house in the name of the applicant or a family member anywhere in India, subject to guideline provisions.",
      "A beneficiary who was allotted a house under a government housing scheme in the previous 20 years is not eligible under the cited guideline provision.",
      "This screen only assesses the urban route. Rural households should be directed to verify the applicable PMAY-G route."
    ],
    tags: ["housing", "urban", "home"]
  },
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana 2.0",
    category: "Energy & household",
    ministry: "Ministry of Petroleum and Natural Gas",
    summary: "LPG connection support for adult women from poor households that meet the scheme requirements.",
    benefit: "Deposit-free LPG connection subject to the scheme's published benefits and current implementation terms.",
    sourceUrl: "https://pmuy.gov.in/ujjwala2.html",
    sourceName: "PMUY 2.0 official eligibility and application information",
    sourcePeriod: "Official PMUY 2.0 portal",
    sourceChecked: "2026-11-01",
    geography: "Central scheme — India",
    documents: ["KYC application form and accepted identity proof", "Ration card or State/UT family-composition document (or permitted migrant self-declaration)", "Address proof if required by the official process", "Bank account details", "Prescribed deprivation declaration"],
    ruleNotes: [
      "The applicant must be a woman who has attained 18 years of age.",
      "There must be no other LPG connection from an Oil Marketing Company within the same household.",
      "The adult woman must belong to a poor household based on submission of the prescribed deprivation declaration.",
      "The official portal lists the complete document and application requirements; do not upload Aadhaar or bank details to this prototype."
    ],
    tags: ["women", "household", "lpg", "energy"]
  },
  {
    id: "pm-usp-csss",
    name: "PM-USP Central Sector Scholarship (CSSS)",
    category: "Education",
    ministry: "Department of Higher Education, Ministry of Education",
    summary: "Merit-cum-means scholarship for eligible college and university students; screening conditions below are taken from the Ministry's 2025–26 FAQ.",
    benefit: "The cited 2025–26 FAQ describes ₹12,000 per annum at graduation level for the first three years and ₹20,000 per annum at postgraduate level, with course-specific terms.",
    sourceUrl: "https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/FAQs_PM_USP_CSSS_scheme_AY_2025_26.pdf",
    sourceName: "Ministry of Education — PM-USP CSSS FAQ",
    sourcePeriod: "Academic Year 2025–26 FAQ; current academic-year rules must be rechecked",
    sourceChecked: "2026-11-01",
    geography: "Central scheme — India; applications through National Scholarship Portal when open",
    documents: ["Class XII marksheet and relevant Board percentile/list evidence", "Current admission/enrolment proof for a regular undergraduate course", "Family income certificate or accepted income evidence", "Scholarship/fee-reimbursement declaration"],
    ruleNotes: [
      "The cited 2025–26 FAQ requires students to be above the 80th percentile of successful candidates in the relevant stream from the Board.",
      "The cited FAQ requires a regular course, family income up to ₹4.5 lakh per annum, and no other scholarship or fee reimbursement; diploma and distance/correspondence courses are excluded.",
      "Fresh and renewal rules, application windows and available slots vary by academic year. This prototype intentionally marks this scheme for current-year verification."
    ],
    tags: ["student", "college", "scholarship", "education"]
  }
];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" }
] as const;

export type LanguageCode = typeof LANGUAGE_OPTIONS[number]["code"];

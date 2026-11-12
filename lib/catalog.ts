import { KARNATAKA_BUDGET_LEADS } from "./karnataka-budget";
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
  mobileNumber?: string;
  emailAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  villageOrTown?: string;
  pincode?: string;
  fatherOrGuardianName?: string;
  motherName?: string;
  socialCategory?: "General" | "OBC" | "SC" | "ST" | "EWS" | "Other" | "";
  landholdingAcres?: number | "";
  institutionName?: string;
  courseName?: string;
  courseYear?: string;
  rationCardCategory?: "AAY" | "PHH" | "BPL" | "APL" | "Other" | "";
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
  catalogueStatus?: "rule-screened" | "catalogue-only";
  recordKind?: "scheme-reference" | "budget-line-item-lead" | "external-dataset-record";
  /** Human approval gate. Missing status is treated as pending, never approved. */
  reviewStatus?: "pending" | "approved";
  jurisdiction?: "central" | "state" | "ut";
  applicationUrl?: string;
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
  /** Approval state at the time of evaluation; legacy assessments without this must be re-run. */
  schemeReviewStatusAtAssessment?: "pending" | "approved";
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
    catalogueStatus: "rule-screened",
    reviewStatus: "pending",
    jurisdiction: "central",
    name: "PM-KISAN Samman Nidhi",
    category: "Agriculture",
    ministry: "Department of Agriculture & Farmers Welfare",
    summary: "Income support for eligible landholding farmer families, subject to the scheme's exclusion criteria and State/UT verification.",
    benefit: "₹6,000 per year in three equal instalments, transferred through DBT (subject to eligibility and scheme rules).",
    sourceUrl: "https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf",
    sourceName: "PM-KISAN operational guidelines (revised 29 March 2020) and live official portal",
    sourcePeriod: "Guidelines revised 29 March 2020. Live official portal rechecked 9 Nov 2026: 24th instalment released 30 Oct 2026; eKYC is mandatory and biometric eKYC is available through CSC VLE, the PM-KISAN mobile application and authorized state users. The portal temporarily withholds benefits in suspected post-01.02.2019 land-acquisition and multiple-family-member cases pending physical verification. Later circular reconciliation and the complete exclusion list remain open.",
    sourceChecked: "2026-11-09",
    geography: "Central scheme — India",
    documents: ["State/UT land record or cultivable-land evidence", "Bank account details for the official application channel", "Identity and eKYC requirements as specified by the portal"],
    ruleNotes: [
      "The scheme is for landholding farmer families with cultivable land recorded by the concerned State/UT.",
      "The scheme has exclusion categories, including institutional landholders and specified higher-economic-status categories. The catalogue screening is not a substitute for the complete official exclusion check.",
      "The State/UT administration identifies and verifies eligible farmer families.",
      "The live portal reports mandatory eKYC and temporary benefit holds for suspected post-01.02.2019 land acquisitions or multiple family-member claims pending physical verification; verify the current circular and beneficiary-specific status on the official portal."
    ],
    tags: ["farmer", "agriculture", "income support"]
  },
  {
    id: "pmay-u-2",
    catalogueStatus: "rule-screened",
    reviewStatus: "pending",
    jurisdiction: "central",
    name: "Pradhan Mantri Awas Yojana — Urban 2.0",
    category: "Housing",
    ministry: "Ministry of Housing and Urban Affairs",
    summary: "Housing assistance for eligible urban EWS, LIG and MIG beneficiary families through the scheme's defined verticals.",
    benefit: "Assistance is delivered under the applicable PMAY-U 2.0 vertical; the amount and route depend on the component and eligibility.",
    sourceUrl: "https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf",
    sourceName: "PMAY-U 2.0 Scheme Guidelines (September 2024), official guideline index and AHP SOP (April 2026)",
    sourcePeriod: "Official guideline index rechecked 9 Nov 2026 lists PMAY-U 2.0 guidelines dated September 2024, an Affordable Housing in Partnership SOP dated April 2026 and an Angikaar 2026 Guidelines document. The 2026 documents and all amendments/vertical rules have not been fully reconciled; State/UT implementation and current vertical requirements remain subject to independent human verification.",
    sourceChecked: "2026-11-09",
    geography: "Urban areas — India",
    documents: ["Household and family details", "Income certificate or other accepted income evidence", "Declaration/evidence regarding pucca house ownership across India", "Prior housing-assistance declaration"],
    ruleNotes: [
      "The guidelines define EWS as annual household income up to ₹3 lakh, LIG as ₹3–6 lakh and MIG as ₹6–9 lakh; States/UTs may have flexibility to redefine EWS with Ministry concurrence.",
      "The beneficiary family should not own a pucca house in the name of the applicant or a family member anywhere in India, subject to guideline provisions.",
      "A beneficiary who was allotted a house under a government housing scheme in the previous 20 years is not eligible under the cited guideline provision.",
      "This screen only assesses the urban route. Rural households should be directed to verify the applicable PMAY-G route.",
      "The current official guideline also defines a beneficiary family as husband, wife and unmarried sons/daughters, requires residence in the urban area, and contains vertical-specific rules; the prototype does not encode or verify every such condition."
    ],
    tags: ["housing", "urban", "home"]
  },
  {
    id: "pm-ujjwala",
    catalogueStatus: "rule-screened",
    reviewStatus: "pending",
    jurisdiction: "central",
    name: "Pradhan Mantri Ujjwala Yojana 2.0",
    category: "Energy & household",
    ministry: "Ministry of Petroleum and Natural Gas",
    summary: "LPG connection support for adult women from poor households that meet the scheme requirements.",
    benefit: "Deposit-free LPG connection subject to the scheme's published benefits and current implementation terms.",
    sourceUrl: "https://pmuy.gov.in/ujjwala2.html",
    sourceName: "PMUY 2.0 official eligibility page and FAQ",
    sourcePeriod: "Official PMUY 2.0 eligibility page and FAQ rechecked 9 Nov 2026: adult woman (18+), no OMC LPG connection registered to a family member listed in the household composition document, and a qualifying poor-household category/deprivation declaration. The FAQ enumerates SC/ST, PMAY-G, MBC, AAY, tea/ex-tea garden tribes, forest dwellers, island/river-island residents, SECC and 14-point-declaration categories; it also requires biometric Aadhaar authentication at the distributor. Documents include Aadhaar for adult family members, family-composition proof and bank details. Do not collect Aadhaar or bank data in the JanaSetu prototype. Current operational circulars still require independent reviewer reconciliation.",
    sourceChecked: "2026-11-09",
    geography: "Central scheme — India",
    documents: ["KYC application form and accepted identity proof", "Ration card or State/UT family-composition document (or permitted migrant self-declaration)", "Address proof if required by the official process", "Bank account details", "Prescribed deprivation declaration"],
    ruleNotes: [
      "The applicant must be a woman who has attained 18 years of age.",
      "No LPG connection from an Oil Marketing Company may already be registered to any family member listed in the household's ration card or other accepted family-composition document.",
      "The official FAQ identifies eligible poor-household categories including SC, ST, PMAY-G, Most Backward Classes, Antyodaya Anna Yojana, tea/ex-tea garden tribes, forest dwellers, island/river-island residents, SECC households and households meeting the prescribed 14-point deprivation declaration. The exact current category and evidence must be checked by the distributor/OMC.",
      "Biometric Aadhaar authentication is mandatory at the OMC distributor. JanaSetu must not collect Aadhaar copies/numbers or bank account details; citizens must complete those steps through the official OMC/distributor process.",
      "The FAQ permits prescribed migrant self-declarations for proof of address and family composition. A government-issued family-composition document is required where the ration card does not show all household members.",
      "PNG connection holders cannot receive a PMUY connection or a subsidized non-PMUY LPG connection. The official FAQ describes a deposit-free connection with first refill and stove benefits; confirm current OMC implementation terms."
    ],
    tags: ["women", "household", "lpg", "energy"]
  },
  {
    id: "pm-usp-csss",
    catalogueStatus: "rule-screened",
    reviewStatus: "pending",
    jurisdiction: "central",
    name: "PM-USP Central Sector Scholarship (CSSS)",
    category: "Education",
    ministry: "Department of Higher Education, Ministry of Education",
    summary: "Merit-cum-means scholarship for eligible college and university students; eligibility details must be checked against the current academic-year scheme notice and Board list.",
    benefit: "The Ministry FAQ located describes ₹12,000 per annum at graduation level for the first three years and ₹20,000 per annum at postgraduate level, with course-specific terms; confirm current-year rates and course treatment.",
    sourceUrl: "https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf",
    sourceName: "National Scholarship Portal PM-USP CSSS specifications (updated 7 Feb 2024) and Ministry FAQ (AY 2025–26)",
    sourcePeriod: "Official NSP AY 2026–27 pages rechecked 9 Nov 2026 remain inconsistent: the Students announcement says renewal student applications close 31 Oct 2026, while the All-Scholarships listing says 30 Sep 2026 for CSSS renewal. A search-indexed listing has also surfaced 30 Nov 2026, but that is not corroborated by the opened page. Treat the renewal window as unconfirmed/closed pending official clarification; 30 Nov is not a verified student deadline. The located detailed FAQ is AY 2025–26; do not infer an AY 2026–27 fresh-application window.",
    sourceChecked: "2026-11-09",
    geography: "Central scheme — India; applications through National Scholarship Portal when open",
    documents: ["Class XII marksheet and relevant Board percentile/list evidence", "Current admission/enrolment proof for a regular undergraduate course", "Family income certificate or accepted income evidence", "Scholarship/fee-reimbursement declaration"],
    ruleNotes: [
      "The cited 2025–26 FAQ requires students to be above the 80th percentile of successful candidates in the relevant stream from the Board.",
      "The cited FAQ requires a regular course, family income up to ₹4.5 lakh per annum, and no other scholarship or fee reimbursement; diploma and distance/correspondence courses are excluded.",
      "Fresh and renewal rules, application windows and available slots vary by academic year. This prototype intentionally marks this scheme for current-year verification.",
      "The AY 2025–26 FAQ also excludes students who took a drop after Class XII and describes renewal conditions of at least 50% marks and 75% attendance, with a maximum duration not exceeding five years; the current-year reviewer must verify whether these continue for AY 2026–27.",
      "The AY 2026–27 NSP pages are renewal listings with conflicting student deadlines (30 Sep vs 31 Oct 2026); 30 Nov 2026 is an L2 verification deadline, not a student application deadline. Do not show the application as open or infer a fresh-application window until clarified."
    ],
    tags: ["student", "college", "scholarship", "education"]
  }
];

// Source-indexed records are deliberately not eligibility-scored until current rules are reviewed.
SCHEMES.push(...([
  {
    "id": "pmss-police-martyred",
    "name": "Prime Minister’s Scholarship Scheme for Wards of States/UTs Police Personnel Martyred During Terror/Naxal Attacks",
    "category": "Scholarship",
    "ministry": "Ministry of Home Affairs",
    "summary": "Merit-based scholarship for eligible wards of State/UT police personnel martyred during terror or Naxal attacks.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pmss-capf-assam-rifles",
    "name": "Prime Minister’s Scholarship Scheme for Central Armed Police Forces and Assam Rifles",
    "category": "Scholarship",
    "ministry": "Ministry of Home Affairs",
    "summary": "Merit-based scholarship for eligible wards of Central Armed Police Forces and Assam Rifles personnel.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-swanath-degree",
    "name": "AICTE Swanath Scholarship Scheme — Technical Degree",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Education support for eligible students in technical degree programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pm-usp-sss-jkl",
    "name": "PM-USP Special Scholarship Scheme for Jammu, Kashmir and Ladakh",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Higher-education scholarship for eligible students from Jammu and Kashmir and Ladakh.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — Jammu and Kashmir and Ladakh",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-pragati-degree",
    "name": "AICTE Pragati Scholarship Scheme for Girl Students — Technical Degree",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Scholarship for eligible girl students pursuing technical degree programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-pragati-diploma",
    "name": "AICTE Pragati Scholarship Scheme for Girl Students — Technical Diploma",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Scholarship for eligible girl students pursuing technical diploma programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-saksham-diploma",
    "name": "AICTE Saksham Scholarship Scheme — Specially Abled Students, Technical Diploma",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Education support for eligible specially abled students in technical diploma programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-saksham-degree",
    "name": "AICTE Saksham Scholarship Scheme — Specially Abled Students, Technical Degree",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Education support for eligible specially abled students in technical degree programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "aicte-swanath-diploma",
    "name": "AICTE Swanath Scholarship Scheme — Technical Diploma",
    "category": "Scholarship",
    "ministry": "All India Council for Technical Education",
    "summary": "Education support for eligible students in technical diploma programmes.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "national-scholarship-pg",
    "name": "National Scholarship for Post Graduate Studies",
    "category": "Scholarship",
    "ministry": "University Grants Commission / Department of Higher Education",
    "summary": "Scholarship support for eligible students pursuing postgraduate studies.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "ishan-uday-ner",
    "name": "Ishan Uday Special Scholarship Scheme for North Eastern Region",
    "category": "Scholarship",
    "ministry": "University Grants Commission / Department of Higher Education",
    "summary": "Higher-education scholarship for eligible students from the North Eastern Region.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — North Eastern Region",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "beedi-cine-post-matric",
    "name": "Financial Assistance for Education to Wards of Beedi/Cine/IOMC/LSDM Workers — Post Matric",
    "category": "Scholarship",
    "ministry": "Ministry of Labour & Employment",
    "summary": "Education assistance for eligible post-matric students whose parent or guardian is covered by the listed worker categories.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "beedi-cine-pre-matric",
    "name": "Financial Assistance for Education to Wards of Beedi/Cine/IOMC/LSDM Workers — Pre Matric",
    "category": "Scholarship",
    "ministry": "Ministry of Labour & Employment",
    "summary": "Education assistance for eligible pre-matric students whose parent or guardian is covered by the listed worker categories.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pm-yasasvi-school",
    "name": "PM YASASVI — Top Class Education in Schools for OBC, EBC and DNT Students",
    "category": "Scholarship",
    "ministry": "Department of Social Justice & Empowerment",
    "summary": "School education support for eligible OBC, EBC and DNT students.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pm-yasasvi-college",
    "name": "PM YASASVI — Top Class Education in College for OBC, EBC and DNT Students",
    "category": "Scholarship",
    "ministry": "Department of Social Justice & Empowerment",
    "summary": "College education support for eligible OBC, EBC and DNT students.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "national-renewable-energy-fellowship",
    "name": "National Renewable Energy Fellowship Scheme",
    "category": "Scholarship",
    "ministry": "Ministry of New and Renewable Energy",
    "summary": "Fellowship support for eligible students or researchers in renewable-energy fields.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "isi-stipend-ug-pg",
    "name": "Stipend Scheme for Undergraduate and Postgraduate Studies at Indian Statistical Institute, Kolkata",
    "category": "Scholarship",
    "ministry": "Ministry of Statistics and Programme Implementation",
    "summary": "Stipend support for eligible undergraduate and postgraduate students at the Indian Statistical Institute, Kolkata.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "icar-nts-ug",
    "name": "ICAR National Talent Scholarship — Undergraduate",
    "category": "Scholarship",
    "ministry": "Department of Agricultural Research and Education / ICAR",
    "summary": "Scholarship for eligible undergraduate students in the ICAR higher-education system.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "icar-pg-scholarship",
    "name": "ICAR Post Graduate Scholarship",
    "category": "Scholarship",
    "ministry": "Department of Agricultural Research and Education / ICAR",
    "summary": "Scholarship support for eligible postgraduate students in agricultural education.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "icar-nts-pg",
    "name": "ICAR National Talent Scholarship — Postgraduate",
    "category": "Scholarship",
    "ministry": "Department of Agricultural Research and Education / ICAR",
    "summary": "Merit-based support for eligible postgraduate students under ICAR.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "icar-jrf-srf",
    "name": "ICAR Junior Research Fellowships and Senior Research Fellowships",
    "category": "Scholarship",
    "ministry": "Department of Agricultural Research and Education / ICAR",
    "summary": "Research fellowship opportunities listed by ICAR for eligible candidates.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "top-class-sc",
    "name": "Central Sector Scholarship of Top Class Education for SC Students",
    "category": "Scholarship",
    "ministry": "Department of Social Justice & Empowerment",
    "summary": "Higher-education assistance for eligible Scheduled Caste students.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "free-coaching-sc-obc-pmcares",
    "name": "Free Coaching for SCs, OBCs and Beneficiaries of PM CARES Children Scheme",
    "category": "Scholarship",
    "ministry": "Department of Social Justice & Empowerment",
    "summary": "Coaching assistance for eligible SC, OBC and PM CARES Children beneficiaries.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pre-matric-disability",
    "name": "Pre Matric Scholarship for Students with Disabilities",
    "category": "Scholarship",
    "ministry": "Department of Empowerment of Persons with Disabilities",
    "summary": "Pre-matric education assistance for eligible students with disabilities.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "post-matric-disability",
    "name": "Post Matric Scholarship for Students with Disabilities",
    "category": "Scholarship",
    "ministry": "Department of Empowerment of Persons with Disabilities",
    "summary": "Post-matric education assistance for eligible students with disabilities.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "top-class-disability",
    "name": "Scholarship for Top Class Education for Students with Disabilities",
    "category": "Scholarship",
    "ministry": "Department of Empowerment of Persons with Disabilities",
    "summary": "Higher-education support for eligible students with disabilities.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "national-means-merit",
    "name": "National Means Cum Merit Scholarship",
    "category": "Scholarship",
    "ministry": "Department of School Education & Literacy",
    "summary": "Merit-cum-means scholarship for eligible school students.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "national-fellowship-st",
    "name": "National Fellowship and Scholarship for Higher Education of ST Students",
    "category": "Scholarship",
    "ministry": "Ministry of Tribal Affairs",
    "summary": "Higher-education fellowship and scholarship support for eligible Scheduled Tribe students.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "nec-merit-scholarship",
    "name": "Financial Support to Students of North Eastern Region for Higher Professional Courses — NEC Merit Scholarship",
    "category": "Scholarship",
    "ministry": "North Eastern Council / DoNER",
    "summary": "Merit scholarship for eligible students from the North Eastern Region pursuing professional courses.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — North Eastern Region",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pmss-railways",
    "name": "Prime Minister’s Scholarship Scheme for Ministry of Railways",
    "category": "Scholarship",
    "ministry": "Ministry of Railways",
    "summary": "Merit-based scholarship for eligible wards in the railway personnel category.",
    "benefit": "Scholarship or education assistance under scheme-specific guidelines; amount, duration and award conditions vary.",
    "sourceUrl": "https://scholarships.gov.in/All-Scholarships",
    "sourceName": "National Scholarship Portal — AY 2026–27 listing",
    "sourcePeriod": "AY 2026–27 generic NSP catalogue landing page checked 4 November 2026; scheme-specific status and deadlines vary and require exact-entry verification. Do not infer a universal deadline.",
    "sourceChecked": "2026-11-04",
    "geography": "Central scheme — India",
    "documents": [
      "Use the scheme-specific Specifications and FAQ linked on the National Scholarship Portal; document requirements vary."
    ],
    "ruleNotes": [
      "This scheme title and application-window snapshot were listed on the National Scholarship Portal for AY 2026–27.",
      "Catalogue-only record: JanaSetu does not calculate eligibility or confirm an award. Read the scheme-specific live guidelines before applying."
    ],
    "tags": [
      "scholarship",
      "education",
      "nsp"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://scholarships.gov.in/All-Scholarships"
  },
  {
    "id": "pm-jay",
    "name": "Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    "category": "Health",
    "ministry": "National Health Authority, Ministry of Health & Family Welfare",
    "summary": "Hospitalisation cover for eligible beneficiary families at empanelled hospitals; verify beneficiary status rather than assuming universal enrolment.",
    "benefit": "Health cover up to ₹5 lakh per eligible family per year for covered secondary and tertiary hospitalisation, subject to scheme rules.",
    "sourceUrl": "https://nha.gov.in/img/resources/Adhikar-Patra.pdf",
    "sourceName": "National Health Authority — PM-JAY beneficiary charter",
    "sourcePeriod": "Official beneficiary charter; confirm current beneficiary criteria and package rules.",
    "sourceChecked": "2026-11-02",
    "geography": "Central scheme — India",
    "documents": [
      "Use the official beneficiary eligibility checker or a Common Service Centre; exact requirements depend on the beneficiary record."
    ],
    "ruleNotes": [
      "The NHA beneficiary charter describes cover up to ₹5 lakh per eligible family per year at empanelled hospitals.",
      "Eligibility follows the scheme's beneficiary identification process; JanaSetu does not query the beneficiary database."
    ],
    "tags": [
      "health",
      "hospital",
      "insurance",
      "ayushman"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://pmjay.gov.in/"
  },
  {
    "id": "pmmvy",
    "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0)",
    "category": "Women & child",
    "ministry": "Ministry of Women & Child Development",
    "summary": "Maternity benefit for eligible pregnant and lactating women in specified socio-economic categories; not an unconditional benefit for every pregnancy.",
    "benefit": "The Ministry describes ₹5,000 in two instalments for the first living child and ₹6,000 for a second living child if the second child is a girl, subject to conditions.",
    "sourceUrl": "https://www.wcd.gov.in/offerings/pradhan-mantri-matru-vandana-yojana",
    "sourceName": "Ministry of Women & Child Development — PMMVY",
    "sourcePeriod": "Ministry FAQ checked 2 November 2026; verify eligibility categories, ANC requirements and claim deadlines.",
    "sourceChecked": "2026-11-02",
    "geography": "Central scheme — India",
    "documents": [
      "Follow the current scheme checklist. Do not upload sensitive health records or bank details to JanaSetu."
    ],
    "ruleNotes": [
      "The Ministry lists eligibility categories including SC/ST, BPL, e-Shram, PM-JAY, MGNREGA job-card holders and specified income groups.",
      "First-child and second-child-girl benefits have separate pregnancy registration, antenatal-care and claim conditions."
    ],
    "tags": [
      "maternity",
      "pregnancy",
      "women",
      "child"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://pmmvy.wcd.gov.in/"
  },
  {
    "id": "pmsby",
    "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    "category": "Insurance",
    "ministry": "Department of Financial Services, Ministry of Finance",
    "summary": "Voluntary, renewable accident insurance for eligible individual savings-bank or post-office account holders.",
    "benefit": "Accident-related death and disability cover under current policy terms; confirm premium and cover with the participating bank or post office.",
    "sourceUrl": "https://financialservices.gov.in/pmsby",
    "sourceName": "Department of Financial Services — PMSBY",
    "sourcePeriod": "Official DFS scheme/FAQ page checked 2 November 2026; annual renewal and policy conditions can change.",
    "sourceChecked": "2026-11-02",
    "geography": "Central scheme — India",
    "documents": [
      "Participating bank or post-office account and consent/auto-debit as required by enrolment."
    ],
    "ruleNotes": [
      "The DFS page describes eligibility for participating account holders aged 18–70.",
      "Current premium, exclusions, claim events and cover must be confirmed against the current policy document."
    ],
    "tags": [
      "insurance",
      "accident",
      "bank",
      "disability"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central"
  },
  {
    "id": "pmjjby",
    "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    "category": "Insurance",
    "ministry": "Department of Financial Services, Ministry of Finance",
    "summary": "Voluntary, renewable one-year life insurance for eligible savings-bank or post-office account holders.",
    "benefit": "Life cover of ₹2 lakh for death due to any cause under current scheme terms; the DFS FAQ checked lists an annual premium of ₹436.",
    "sourceUrl": "https://www.financialservices.gov.in/pmjjby",
    "sourceName": "Department of Financial Services — PMJJBY",
    "sourcePeriod": "Official DFS FAQ checked 2 November 2026; premium, age and policy conditions may be revised.",
    "sourceChecked": "2026-11-02",
    "geography": "Central scheme — India",
    "documents": [
      "Participating bank or post-office savings account and consent/auto-debit as required by enrolment."
    ],
    "ruleNotes": [
      "The DFS FAQ lists an entry age of 18–50 years.",
      "The FAQ lists ₹2 lakh life cover and ₹436 annual premium; recheck the live DFS page before enrolment."
    ],
    "tags": [
      "insurance",
      "life cover",
      "bank",
      "family"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central"
  },
  {
    "id": "pmfby",
    "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    "category": "Agriculture",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "summary": "Crop insurance for farmers against notified crop losses arising from specified natural risks, subject to notified crops, areas and season cut-offs.",
    "benefit": "Insurance compensation for covered crop loss; sum insured and farmer premium depend on notified crop, area and season.",
    "sourceUrl": "https://pmfby.gov.in/faq",
    "sourceName": "PMFBY official portal — FAQ",
    "sourcePeriod": "Official FAQ checked 2 November 2026; season-specific notifications are decisive.",
    "sourceChecked": "2026-11-02",
    "geography": "Central scheme — India; State/season notifications apply",
    "documents": [
      "Land/cultivation evidence, bank and crop details as required by the notified-season process."
    ],
    "ruleNotes": [
      "The official FAQ describes coverage for food crops, oilseeds and notified annual commercial/horticultural crops.",
      "Coverage, cut-off dates, exclusions and notified areas vary by State and season; this record does not determine claims."
    ],
    "tags": [
      "farmer",
      "crop insurance",
      "agriculture",
      "risk"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://pmfby.gov.in/"
  },
  {
    "id": "mgnrega",
    "name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    "category": "Employment",
    "ministry": "Ministry of Rural Development",
    "summary": "Demand-driven wage-employment guarantee for eligible rural households, administered through Gram Panchayats and programme authorities.",
    "benefit": "Wage employment under the Act for eligible rural households; job-card, demand and payment status are handled by local authorities.",
    "sourceUrl": "https://mnregaweb4.nic.in/netnrega/workers/wrkinfo.aspx?lang=en",
    "sourceName": "MGNREGA Worker’s Portal",
    "sourcePeriod": "Official worker portal checked 2 November 2026; household job-card and work-demand status is dynamic.",
    "sourceChecked": "2026-11-02",
    "geography": "Central legislation — implemented by States/UTs",
    "documents": [
      "Rural household and job-card details; contact the Gram Panchayat for registration and work-demand requirements."
    ],
    "ruleNotes": [
      "The Worker’s Portal offers lookup using a job-card number or State, District, Block, Panchayat and Village.",
      "JanaSetu does not access personal worker records or guarantee work allocation or payment."
    ],
    "tags": [
      "rural",
      "employment",
      "wages",
      "job card"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "central",
    "applicationUrl": "https://mnregaweb4.nic.in/netnrega/workers/wrkinfo.aspx?lang=en"
  },
  {
    "id": "karnataka-shakti",
    "name": "Karnataka Shakti Scheme",
    "category": "Transport",
    "ministry": "Government of Karnataka — Transport Department / State RTCs",
    "summary": "Free travel for eligible women and gender minorities who are Karnataka residents on specified State RTC services within Karnataka.",
    "benefit": "Free travel on eligible ordinary and express State RTC services; luxury services and specified categories are excluded.",
    "sourceUrl": "https://bengaluruurban.nic.in/en/scheme/shakti-scheme/",
    "sourceName": "Bengaluru Urban District — Shakti Scheme",
    "sourcePeriod": "District government page dated 11 June 2023; confirm current service exclusions and ID rules.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Valid government photo ID or Shakti Smart Card as required by current travel instructions."
    ],
    "ruleNotes": [
      "The district page states Karnataka residence and valid photo ID are required; specified RTC ordinary/express services are covered.",
      "Luxury buses and specified inter-state/service categories are excluded."
    ],
    "tags": [
      "karnataka",
      "women",
      "transport",
      "free bus"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state"
  },
  {
    "id": "karnataka-anna-bhagya",
    "name": "Karnataka Anna Bhagya",
    "category": "Food security",
    "ministry": "Government of Karnataka — Food, Civil Supplies & Consumer Affairs Department",
    "summary": "Food-security support for eligible Karnataka BPL and Antyodaya Anna Yojana ration-card households.",
    "benefit": "Subsidised food-grain assistance under the State programme; verify current quantity and grain/DBT delivery mode on Ahara.",
    "sourceUrl": "https://bengaluruurban.nic.in/en/scheme/anna-bhagya/",
    "sourceName": "Bengaluru Urban District — Anna Bhagya Scheme",
    "sourcePeriod": "District government page; current delivery mode and quantity can change.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Valid BPL/AAY ration-card record and current family details as requested by the department."
    ],
    "ruleNotes": [
      "The district page identifies BPL and AAY ration-card holders as beneficiaries.",
      "Confirm current entitlement and delivery mode on the official Ahara Karnataka portal."
    ],
    "tags": [
      "karnataka",
      "food",
      "ration card",
      "bpl",
      "aay"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state",
    "applicationUrl": "https://ahara.karnataka.gov.in/"
  },
  {
    "id": "karnataka-gruha-lakshmi",
    "name": "Karnataka Gruha Lakshmi",
    "category": "Women & child",
    "ministry": "Government of Karnataka — Women & Child Development Department",
    "summary": "Monthly financial assistance described for the female head of an eligible Karnataka household, subject to current ration-card and exclusion rules.",
    "benefit": "₹2,000 per month as stated on the district government welfare-scheme listing; verify current beneficiary and payment status.",
    "sourceUrl": "https://chamrajnagar.nic.in/en/welfareschemes/",
    "sourceName": "Chamarajanagar District — Welfare Schemes",
    "sourcePeriod": "District government listing checked 2 November 2026; confirm current exclusions and disbursement notices.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Ration-card household details; provide bank/payment details only through the official State channel, never JanaSetu."
    ],
    "ruleNotes": [
      "The district government page lists ₹2,000/month for the female head of household.",
      "Tax/GST, ration-card and other exclusion conditions must be checked in the current department notice."
    ],
    "tags": [
      "karnataka",
      "women",
      "household",
      "cash assistance"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state",
    "applicationUrl": "https://sevasindhuservices.karnataka.gov.in/"
  },
  {
    "id": "karnataka-gruha-jyothi",
    "name": "Karnataka Gruha Jyothi",
    "category": "Energy",
    "ministry": "Government of Karnataka — Energy Department / State ESCOMs",
    "summary": "Electricity-bill support for eligible domestic connections under a household-specific consumption entitlement.",
    "benefit": "A Government-hosted policy study describes an entitlement based on average FY 2022–23 monthly consumption plus 10%, capped at 200 units; not a blanket 200-unit credit for every home.",
    "sourceUrl": "https://fpibengaluru.karnataka.gov.in/uploads/media_to_upload1762775113.pdf",
    "sourceName": "Karnataka policy research — From Guarantees to Rights",
    "sourcePeriod": "Government-hosted policy study; confirm latest billing rules with the relevant ESCOM.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Domestic electricity account and consumer details; follow current ESCOM/Seva Sindhu requirements."
    ],
    "ruleNotes": [
      "The cited study describes household-specific FY 2022–23 average consumption plus 10%, capped at 200 units, with special rules.",
      "Verify current billing, exceptions and registration directly with the relevant ESCOM."
    ],
    "tags": [
      "karnataka",
      "electricity",
      "energy",
      "household"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state",
    "applicationUrl": "https://sevasindhuservices.karnataka.gov.in/"
  },
  {
    "id": "karnataka-yuva-nidhi",
    "name": "Karnataka Yuva Nidhi",
    "category": "Employment",
    "ministry": "Government of Karnataka — Department of Skill Development, Entrepreneurship & Livelihood",
    "summary": "Unemployment assistance described for eligible Karnataka-domiciled graduates and diploma holders, subject to current pass-out-year, waiting-period and exclusion rules.",
    "benefit": "A 2024 Karnataka Legislative Council draft guideline describes ₹3,000/month for graduates and ₹1,500/month for diploma holders; these are not asserted as current entitlement.",
    "sourceUrl": "https://kla.kar.nic.in/council/Replies/unstarred/19022024/usq403%2819022024%29.pdf",
    "sourceName": "Karnataka Legislative Council — draft Yuva Nidhi guidelines",
    "sourcePeriod": "Draft guidelines dated 2024; not a current final eligibility notification. Confirm current rules on Seva Sindhu.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Degree/diploma certificate and Karnataka domicile evidence; check current checklist."
    ],
    "ruleNotes": [
      "The linked Legislative Council document is explicitly a draft. Its original batch cohort and dates must not be reused as current rules.",
      "Confirm current eligible pass-out years, waiting period, work/study exclusions and benefit amount with the department."
    ],
    "tags": [
      "karnataka",
      "unemployment",
      "graduates",
      "diploma",
      "youth"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state",
    "applicationUrl": "https://sevasindhuservices.karnataka.gov.in/"
  },
  {
    "id": "karnataka-cm-kk-y",
    "name": "Chief Minister’s Kaushalya Karnataka Yojane (CMKKY)",
    "category": "Skills",
    "ministry": "Karnataka Skill Development Corporation",
    "summary": "Free short-term vocational training for Karnataka youth aged 18–35 in industry-aligned job roles, with assessment, certification and placement support described by the district government page.",
    "benefit": "Free vocational training and certification in listed job roles; course and placement availability vary by centre and batch.",
    "sourceUrl": "https://bangalorerural.nic.in/en/district-skill-development-office-2/",
    "sourceName": "Bangalore Rural District — District Skill Development Office",
    "sourcePeriod": "District government programme page; training centres, roles and batches change over time.",
    "sourceChecked": "2026-11-02",
    "geography": "State scheme — Karnataka",
    "documents": [
      "Age and identity proof plus education details as specified by the selected training centre."
    ],
    "ruleNotes": [
      "The district page describes free training for youth aged 18–35 with industry-aligned job roles and accredited centres.",
      "Confirm live course availability, centre status and current intake before referral."
    ],
    "tags": [
      "karnataka",
      "skills",
      "employment",
      "training",
      "youth"
    ],
    "catalogueStatus": "catalogue-only",
    "jurisdiction": "state"
  },
  ...KARNATAKA_BUDGET_LEADS
] as Scheme[]));

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" }
] as const;

export type LanguageCode = typeof LANGUAGE_OPTIONS[number]["code"];

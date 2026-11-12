import type { PortalAdapterDefinition } from "./types";

// Only PM-KISAN's first-step route has a read-only observed form contract.
// Other entries deliberately contain landing URLs only, not invented form paths.
export const portalAdapters: Record<string, PortalAdapterDefinition> = {
  "pm-kisan": {
    schemeSlug: "pm-kisan",
    officialOrigin: "https://pmkisan.gov.in",
    portalHomePath: "/RegistrationFormupdated.aspx",
    applicationPath: "/RegistrationFormupdated.aspx",
    accessStatus: "not_requested",
    allowedActions: [],
    authorizationReference: null,
    approvedAt: null,
    selectors: {
      aadhaar: "#txtsrch",
      mobile: "#ContentPlaceHolder1_txtMobileNo",
      state: "#ContentPlaceHolder1_DropDownState",
      captcha: "#ContentPlaceHolder1_txtcaptcha",
      declaration: "#chkDeclaration",
      otpAction: "#ContentPlaceHolder1_btnSendOTP"
    },
    sensitiveFields: ["aadhaar", "mobile", "captcha", "otp"],
    citizenGatedControls: ["aadhaar", "captcha", "otp", "declaration"]
  },
  "pmay-u-2": {
    schemeSlug: "pmay-u-2",
    officialOrigin: "https://pmaymis.gov.in",
    portalHomePath: "/PMAYMIS2_2024/PmayDefault.aspx",
    applicationPath: null,
    accessStatus: "not_requested",
    allowedActions: [],
    authorizationReference: null,
    approvedAt: null,
    selectors: {},
    sensitiveFields: [],
    citizenGatedControls: ["identity", "eligibility_declaration"]
  },
  "pm-ujjwala": {
    schemeSlug: "pm-ujjwala",
    officialOrigin: "https://pmuy.gov.in",
    portalHomePath: "/Ujjwala2.html",
    applicationPath: null,
    accessStatus: "not_requested",
    allowedActions: [],
    authorizationReference: null,
    approvedAt: null,
    selectors: {},
    sensitiveFields: ["identity", "mobile", "bank"],
    citizenGatedControls: ["identity", "otp", "declaration"]
  },
  "pm-usp-csss": {
    schemeSlug: "pm-usp-csss",
    officialOrigin: "https://scholarships.gov.in",
    portalHomePath: "/Students",
    applicationPath: null,
    accessStatus: "not_requested",
    allowedActions: [],
    authorizationReference: null,
    approvedAt: null,
    selectors: {},
    sensitiveFields: ["identity", "bank", "institution"],
    citizenGatedControls: ["institution_verification", "identity", "declaration"]
  }
};

export function getPortalAdapter(schemeSlug: string): PortalAdapterDefinition | null {
  return portalAdapters[schemeSlug] ?? null;
}

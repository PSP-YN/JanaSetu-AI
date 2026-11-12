import { getPortalAdapter } from "./portal-adapters/registry";
import { inspectAdapter, type PortalSnapshot } from "./portal-adapters/types";

export type EligibilityGate =
  | "approved_potential_match"
  | "needs_verification"
  | "not_assessed"
  | "not_a_match";

export type AutomationStepStatus =
  | "ready"
  | "requires_citizen_action"
  | "manual_handoff"
  | "blocked";

export type AutomationStep = {
  id: string;
  title: string;
  status: AutomationStepStatus;
  reason: string;
};

export type ApplicationAutomationInput = {
  schemeSlug: string;
  eligibility: EligibilityGate;
  requiredProfileFields: string[];
  suppliedProfileFields: string[];
  requiredDocuments: string[];
  availableDocuments: string[];
  portalSnapshot?: PortalSnapshot | null;
};

export type ApplicationAutomationPlan = {
  schemeSlug: string;
  status: "preparation_ready_for_review" | "preparation_incomplete" | "verification_required";
  steps: AutomationStep[];
  capabilities: {
    prepareApplication: boolean;
    inspectPortal: boolean;
    assistFormFilling: boolean;
    uploadDocuments: false;
    bypassIdentityOrCaptcha: false;
    submitApplication: false;
    markSubmittedWithoutReceipt: false;
  };
  disclaimer: string;
};

const uniqueStrings = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

export function buildApplicationAutomationPlan(
  input: ApplicationAutomationInput
): ApplicationAutomationPlan {
  const requiredProfileFields = uniqueStrings(input.requiredProfileFields);
  const suppliedProfileFields = new Set(uniqueStrings(input.suppliedProfileFields));
  const requiredDocuments = uniqueStrings(input.requiredDocuments);
  const availableDocuments = new Set(uniqueStrings(input.availableDocuments));

  const missingProfileFields = requiredProfileFields.filter((field) => !suppliedProfileFields.has(field));
  const missingDocuments = requiredDocuments.filter((document) => !availableDocuments.has(document));
  const profileReady = missingProfileFields.length === 0;
  const documentsReady = missingDocuments.length === 0;
  const eligibilityReady = input.eligibility === "approved_potential_match";

  const steps: AutomationStep[] = [
    {
      id: "profile_validation",
      title: "Validate citizen profile",
      status: profileReady ? "ready" : "requires_citizen_action",
      reason: profileReady
        ? "All required profile fields are present; the citizen must still verify their accuracy."
        : "Missing profile fields: " + missingProfileFields.join(", ")
    },
    {
      id: "eligibility_review",
      title: "Review scheme criteria",
      status: eligibilityReady ? "ready" : "blocked",
      reason: eligibilityReady
        ? "The scheme's independently approved rules indicate a potential match, not an official decision."
        : input.eligibility === "needs_verification"
          ? "Scheme source or rule verification is incomplete. Application preparation is held."
          : input.eligibility === "not_a_match"
            ? "The current profile does not meet the reviewed preliminary criteria. This is not a government rejection."
            : "Eligibility has not been assessed against an independently approved rule set."
    },
    {
      id: "document_checklist",
      title: "Complete evidence checklist",
      status: documentsReady ? "ready" : "requires_citizen_action",
      reason: documentsReady
        ? "All listed evidence items are marked available; the citizen must verify document validity."
        : "Evidence still needed: " + missingDocuments.join(", ")
    }
  ];

  const adapter = getPortalAdapter(input.schemeSlug);
  let inspectPortal = false;
  let assistFormFilling = false;

  if (!adapter) {
    steps.push({
      id: "official_portal_handoff",
      title: "Open official application route",
      status: "manual_handoff",
      reason: "No reviewed scheme-specific adapter exists. Use the official source and complete the portal manually."
    });
  } else if (!input.portalSnapshot) {
    steps.push({
      id: "official_portal_inspection",
      title: "Inspect official portal",
      status: "requires_citizen_action",
      reason: "Open the official portal yourself. JanaSetu will inspect only a registered route and will not log in or complete protected steps."
    });
  } else {
    const inspection = inspectAdapter(adapter, input.portalSnapshot);
    inspectPortal = inspection.matched;
    const protectedChallengePresent = inspection.portalHasCaptcha || inspection.portalHasOtp;
    const citizenGated = adapter.citizenGatedControls.length > 0;
    assistFormFilling =
      inspection.canAssistFormFilling &&
      !protectedChallengePresent &&
      !citizenGated &&
      eligibilityReady &&
      profileReady;

    steps.push({
      id: "official_portal_inspection",
      title: "Inspect official portal",
      status: inspection.matched ? "ready" : "manual_handoff",
      reason: inspection.reason
    });
    steps.push({
      id: "assisted_form_filling",
      title: "Fill reviewed, non-sensitive fields",
      status: assistFormFilling ? "ready" : "manual_handoff",
      reason: assistFormFilling
        ? "The exact route and reviewed adapter are authorized. Only reviewed non-sensitive fields may be filled after citizen approval."
        : protectedChallengePresent || citizenGated
          ? "Protected identity, OTP, CAPTCHA or declaration controls require the citizen. Automated filling is held."
          : "This portal adapter is not authorized and tested for form filling. Continue manually."
    });
  }

  steps.push(
    {
      id: "citizen_final_review",
      title: "Review the complete application",
      status: "requires_citizen_action",
      reason: "The citizen must inspect every field, declaration and attachment before proceeding."
    },
    {
      id: "official_submission",
      title: "Submit on the official portal",
      status: "requires_citizen_action",
      reason: "JanaSetu never clicks final Submit/Apply or bypasses OTP, CAPTCHA, Aadhaar/e-KYC, biometrics, payment or declarations. The citizen submits directly."
    },
    {
      id: "submission_receipt",
      title: "Record the official acknowledgement",
      status: "requires_citizen_action",
      reason: "Mark a case submitted only after the citizen records a verifiable official acknowledgement or receipt."
    }
  );

  const status = !eligibilityReady
    ? "verification_required"
    : profileReady && documentsReady
      ? "preparation_ready_for_review"
      : "preparation_incomplete";

  return {
    schemeSlug: input.schemeSlug,
    status,
    steps,
    capabilities: {
      prepareApplication: eligibilityReady,
      inspectPortal,
      assistFormFilling,
      uploadDocuments: false,
      bypassIdentityOrCaptcha: false,
      submitApplication: false,
      markSubmittedWithoutReceipt: false
    },
    disclaimer:
      "JanaSetu provides assisted preparation, not an official eligibility decision or government submission. Protected verification and final submission remain with the citizen."
  };
}

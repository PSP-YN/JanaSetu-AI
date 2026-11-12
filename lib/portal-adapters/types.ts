export type PortalAction = "inspect" | "assist_form_filling" | "submit_application" | "check_status";
export type IntegrationAccess = "not_requested" | "pending" | "approved" | "suspended" | "revoked";

export type PortalSnapshot = {
  origin: string;
  pathname: string;
  controls: string[];
  fileUploadCount: number;
  captchaPresent: boolean;
  otpPresent: boolean;
};

export type PortalAdapterDefinition = {
  schemeSlug: string;
  officialOrigin: string;
  applicationPath: string | null;
  accessStatus: IntegrationAccess;
  allowedActions: PortalAction[];
  authorizationReference: string | null;
  approvedAt: string | null;
  selectors: Record<string, string>;
  sensitiveFields: string[];
  citizenGatedControls: string[];
};

export type AdapterInspection = {
  schemeSlug: string;
  matched: boolean;
  missingControls: string[];
  observedFileUploadCount: number;
  portalHasCaptcha: boolean;
  portalHasOtp: boolean;
  canAssistFormFilling: boolean;
  canSubmitApplication: false;
  reason: string;
};

export function inspectAdapter(adapter: PortalAdapterDefinition, snapshot: PortalSnapshot): AdapterInspection {
  let origin = "";
  try { origin = new URL(snapshot.origin).origin; } catch { /* invalid origin */ }
  const matched = adapter.applicationPath !== null && origin === adapter.officialOrigin && snapshot.pathname === adapter.applicationPath;
  const required = Object.keys(adapter.selectors);
  const missingControls = required.filter((key) => !snapshot.controls.includes(adapter.selectors[key]));
  const approved = adapter.accessStatus === "approved" && Boolean(adapter.authorizationReference && adapter.approvedAt);
  const formFillAllowed = matched && approved && adapter.allowedActions.includes("assist_form_filling") && missingControls.length === 0;
  const blockedByHumanGate = snapshot.captchaPresent || snapshot.otpPresent || adapter.citizenGatedControls.length > 0;
  return {
    schemeSlug: adapter.schemeSlug,
    matched,
    missingControls,
    observedFileUploadCount: snapshot.fileUploadCount,
    portalHasCaptcha: snapshot.captchaPresent,
    portalHasOtp: snapshot.otpPresent,
    canAssistFormFilling: formFillAllowed,
    canSubmitApplication: false,
    reason: !matched ? "The current page does not match the registered official portal route."
      : !approved ? "Department integration access has not been approved."
      : blockedByHumanGate ? "The citizen must complete protected verification and final review directly."
      : missingControls.length ? "The live portal controls differ from the reviewed adapter contract."
      : "Form assistance may be enabled after reviewed field mapping and citizen consent; final submission remains citizen-controlled."
  };
}

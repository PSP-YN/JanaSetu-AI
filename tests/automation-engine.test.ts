import test from "node:test";
import assert from "node:assert/strict";
import { buildApplicationAutomationPlan } from "../lib/automation-engine";
import { getPortalAdapter } from "../lib/portal-adapters/registry";
import type { PortalAdapterDefinition } from "../lib/portal-adapters/types";

const completeInput = {
  schemeSlug: "pm-kisan",
  eligibility: "approved_potential_match" as const,
  requiredProfileFields: ["name", "state"],
  suppliedProfileFields: ["name", "state"],
  requiredDocuments: ["land_record"],
  availableDocuments: ["land_record"]
};

test("unknown schemes receive manual handoff and never inherit another portal adapter", () => {
  const plan = buildApplicationAutomationPlan({ ...completeInput, schemeSlug: "unknown-scheme" });
  assert.equal(plan.status, "preparation_ready_for_review");
  assert.equal(plan.capabilities.assistFormFilling, false);
  assert.equal(plan.capabilities.submitApplication, false);
  assert.equal(plan.steps.find((step) => step.id === "official_portal_handoff")?.status, "manual_handoff");
});

test("pending scheme verification blocks application preparation", () => {
  const plan = buildApplicationAutomationPlan({ ...completeInput, eligibility: "needs_verification" });
  assert.equal(plan.status, "verification_required");
  assert.equal(plan.capabilities.prepareApplication, false);
  assert.equal(plan.steps.find((step) => step.id === "eligibility_review")?.status, "blocked");
});

test("missing profile facts and documents remain explicit citizen actions", () => {
  const plan = buildApplicationAutomationPlan({
    ...completeInput,
    suppliedProfileFields: ["name"],
    availableDocuments: []
  });
  assert.equal(plan.status, "preparation_incomplete");
  assert.equal(plan.steps.find((step) => step.id === "profile_validation")?.status, "requires_citizen_action");
  assert.equal(plan.steps.find((step) => step.id === "document_checklist")?.status, "requires_citizen_action");
});

test("PM-KISAN adapter stays blocked while department authorization is absent", () => {
  const adapter = getPortalAdapter("pm-kisan");
  assert.ok(adapter);
  const plan = buildApplicationAutomationPlan({
    ...completeInput,
    portalSnapshot: {
      origin: adapter.officialOrigin,
      pathname: adapter.applicationPath!,
      controls: Object.values(adapter.selectors),
      fileUploadCount: 0,
      captchaPresent: true,
      otpPresent: true
    }
  });
  assert.equal(plan.capabilities.inspectPortal, true);
  assert.equal(plan.capabilities.assistFormFilling, false);
  assert.equal(plan.steps.find((step) => step.id === "assisted_form_filling")?.status, "manual_handoff");
});

test("protected verification and declaration gates block filling even on an authorized fixture", () => {
  const adapter = getPortalAdapter("pm-kisan");
  assert.ok(adapter);
  const authorized: PortalAdapterDefinition = {
    ...adapter,
    accessStatus: "approved",
    allowedActions: ["inspect", "assist_form_filling"],
    authorizationReference: "synthetic-test-authorization",
    approvedAt: "2026-11-12T00:00:00.000Z",
    citizenGatedControls: []
  };
  const plan = buildApplicationAutomationPlan({
    ...completeInput,
    portalSnapshot: {
      origin: authorized.officialOrigin,
      pathname: authorized.applicationPath!,
      controls: Object.values(authorized.selectors),
      fileUploadCount: 0,
      captchaPresent: true,
      otpPresent: false
    }
  });
  assert.equal(plan.capabilities.assistFormFilling, false);
  assert.equal(plan.capabilities.submitApplication, false);
});

test("final submission always requires the citizen and receipt evidence", () => {
  const plan = buildApplicationAutomationPlan(completeInput);
  assert.equal(plan.capabilities.submitApplication, false);
  assert.equal(plan.capabilities.markSubmittedWithoutReceipt, false);
  assert.equal(plan.steps.find((step) => step.id === "official_submission")?.status, "requires_citizen_action");
  assert.equal(plan.steps.find((step) => step.id === "submission_receipt")?.status, "requires_citizen_action");
});

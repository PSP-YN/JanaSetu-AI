import test from "node:test";
import assert from "node:assert/strict";
import { inspectAdapter } from "../lib/portal-adapters/types";
import { getPortalAdapter } from "../lib/portal-adapters/registry";

test("PM-KISAN live form contract detects current registration controls and keeps protected steps citizen-controlled", () => {
  const adapter = getPortalAdapter("pm-kisan");
  assert.ok(adapter);
  const result = inspectAdapter(adapter, {
    origin: "https://pmkisan.gov.in",
    pathname: "/RegistrationFormupdated.aspx",
    controls: [
      "#txtsrch",
      "#ContentPlaceHolder1_txtMobileNo",
      "#ContentPlaceHolder1_DropDownState",
      "#ContentPlaceHolder1_txtcaptcha",
      "#chkDeclaration",
      "#ContentPlaceHolder1_btnSendOTP"
    ],
    fileUploadCount: 0,
    captchaPresent: true,
    otpPresent: true
  });
  assert.equal(result.matched, true);
  assert.deepEqual(result.missingControls, []);
  assert.equal(result.observedFileUploadCount, 0);
  assert.equal(result.canAssistFormFilling, false);
  assert.equal(result.canSubmitApplication, false);
});

test("an unapproved integration cannot enable form assistance", () => {
  const adapter = getPortalAdapter("pm-kisan");
  assert.ok(adapter);
  const result = inspectAdapter(adapter, {
    origin: "https://pmkisan.gov.in",
    pathname: "/RegistrationFormupdated.aspx",
    controls: Object.values(adapter.selectors),
    fileUploadCount: 0,
    captchaPresent: true,
    otpPresent: true
  });
  assert.equal(result.canAssistFormFilling, false);
  assert.match(result.reason, /not been approved/i);
});

test("unknown schemes do not inherit a portal adapter", () => {
  assert.equal(getPortalAdapter("unreviewed-scheme"), null);
});

test("a lookalike domain cannot match the PM-KISAN adapter", () => {
  const adapter = getPortalAdapter("pm-kisan");
  assert.ok(adapter);
  const result = inspectAdapter(adapter, {
    origin: "https://pmkisan.gov.in.attacker.example",
    pathname: "/RegistrationFormupdated.aspx",
    controls: Object.values(adapter.selectors),
    fileUploadCount: 0,
    captchaPresent: true,
    otpPresent: true
  });
  assert.equal(result.matched, false);
  assert.equal(result.canSubmitApplication, false);
});

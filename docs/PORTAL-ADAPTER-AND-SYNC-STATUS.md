# Portal adapters and encrypted workspace sync

## Adapter model

JanaSetu uses a scheme-keyed adapter registry with a common contract. An adapter must match the exact official origin and path, declare reviewed selectors, list sensitive fields and citizen-gated controls, and have a department authorization reference plus an approved timestamp before form assistance can be enabled.

The generic adapter contract does not imply every portal is supported. Portals have different identity, CAPTCHA, OTP, consent, document, and workflow controls. A scheme without an adapter remains a manual official-portal workflow.

## PM-KISAN live portal observation

Read-only browser inspection of the official New Farmer Registration page at `https://pmkisan.gov.in/RegistrationFormupdated.aspx` observed:
- Aadhaar field selector: `#txtsrch`
- Mobile field selector: `#ContentPlaceHolder1_txtMobileNo`
- State selector: `#ContentPlaceHolder1_DropDownState`
- CAPTCHA field selector: `#ContentPlaceHolder1_txtcaptcha`
- Declaration checkbox: `#chkDeclaration`
- OTP action: `#ContentPlaceHolder1_btnSendOTP`
- File upload controls: zero on the inspected first-step form

This is a live page compatibility observation, not an end-to-end application test. No Aadhaar, mobile number, OTP, CAPTCHA, consent or submit action was entered or triggered. The adapter is deliberately marked `not_requested` because department authorization has not been recorded. Therefore form assistance and submission remain disabled.

## All-scheme behavior

The registry currently knows the four seeded scheme slugs (PM-KISAN, PMAY-U 2.0, PM Ujjwala 2.0, and CSSS). Their integration access is not requested. A missing or unapproved adapter falls back to manual navigation; JanaSetu must not guess selectors or claim automation. Each scheme needs its own live portal acceptance tests and official authorization evidence.

## Cross-device sync security model

The database already has an authenticated, user-owned `citizen_workspaces` row protected by RLS and a `cloud_workspace_sync` consent purpose. Cloud sync must store only a client-side encrypted envelope (AES-256-GCM) and must never upload plaintext profile fields, Aadhaar, bank credentials, OTPs, or document bytes through the workspace sync endpoint.

The deployed consent-policy table currently has no approved policy versions. The sync endpoint must fail closed until a legally/privacy-reviewed `cloud_workspace_sync` policy is activated and the citizen grants that exact policy. This is intentional; creating a consent button without an approved policy would be misleading.

## Release gates

1. Approve and publish the scheme rules independently.
2. Obtain and record department integration authorization for the exact allowed actions.
3. Pass live read-only selector/fingerprint tests and scheme-specific test fixtures.
4. Enable assisted form fill only for reviewed fields; keep Aadhaar, OTP, CAPTCHA, biometric and declarations under direct citizen control.
5. Keep final submission citizen-confirmed unless an official authorized API and auditable acknowledgement path are implemented.
6. Activate the legally reviewed encrypted-sync consent policy, then test two-device upload/download and key recovery.

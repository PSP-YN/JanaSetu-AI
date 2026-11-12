# Scheme portal adapters and encrypted workspace sync — release status

Updated: 12 November 2026

## Scheme automation contract

JanaSetu uses a scheme-keyed adapter registry. The common contract checks the exact official origin and path, required reviewed controls, sensitive fields, citizen-gated controls, allowed actions, department authorization reference and approval timestamp.

A common adapter runtime does not make all government portals interchangeable. Portals have different workflows, field semantics, identity verification, CAPTCHA/OTP, document rules, consent declarations, payment steps and submission receipts. A missing, unapproved or untested adapter must fall back to source-linked guidance and manual navigation. The system must never infer an authorization or selector from a scheme name.

## Current connected scheme integrations

The connected JanaSetu database currently has four integration records:

| Scheme | Official landing URL | Access status | Authorized actions |
|---|---|---|---|
| PM-KISAN | https://pmkisan.gov.in/ | `not_requested` | None |
| PMAY-U 2.0 | https://pmay-urban.gov.in/ | `not_requested` | None |
| PM Ujjwala 2.0 | https://www.pmuy.gov.in/ujjwala2.html | `not_requested` | None |
| CSSS / NSP | https://scholarships.gov.in/ | `not_requested` | None |

These are four seeded integrations, not evidence that the entire 142-record prototype catalogue or the 4,693-row third-party discovery snapshot is covered by working government adapters. No integration is production-authorized.

## PM-KISAN live portal observation

Read-only browser inspection of the official New Farmer Registration page at `https://pmkisan.gov.in/RegistrationFormupdated.aspx` observed:
- Aadhaar field selector: `#txtsrch`
- Mobile field selector: `#ContentPlaceHolder1_txtMobileNo`
- State selector: `#ContentPlaceHolder1_DropDownState`
- CAPTCHA field selector: `#ContentPlaceHolder1_txtcaptcha`
- Declaration checkbox: `#chkDeclaration`
- OTP action: `#ContentPlaceHolder1_btnSendOTP`
- File upload controls: zero on the inspected first-step form

This is a live page compatibility observation, not an end-to-end application test. No Aadhaar, mobile number, OTP, CAPTCHA, consent or submit action was entered or triggered. PM-KISAN access remains `not_requested`; form filling and submission are disabled.

## Cross-device encrypted sync implementation

The sync API and database migration now use guarded Supabase RPCs rather than direct REST table writes (direct citizen-workspace writes are revoked).

- Client-side PBKDF2-SHA-256 (600,000 iterations) derives an AES-256-GCM key.
- Random salt and IV are generated for each encryption.
- The vault password never leaves the browser.
- The API accepts only a strict encrypted envelope, rejects plaintext payloads, enforces an 8 MiB limit, checks authentication and same-origin writes, and uses no-store responses.
- Database RPCs check `auth.uid()`, active purpose-specific cloud-sync consent and envelope structure.
- The stored workspace contains only `profile_data.encrypted_workspace_v1`; structured plaintext workspace fields are cleared by the encrypted-sync write function.
- A monotonic revision provides compare-and-swap. A stale device receives HTTP 409 instead of overwriting newer data.
- Restore decrypts locally. JanaSetu cannot recover a lost vault password.

## Sync activation status

A draft policy `cloud_workspace_sync / 2026-11-12-draft-1` is registered as inactive, with no legal review reference or approval timestamp. The active consent check therefore remains false and the API must return 403 for an authenticated user without an approved policy and explicit consent.

The policy draft is documented in [Encrypted cross-device sync](ENCRYPTED-CROSS-DEVICE-SYNC.md). It must be reviewed by qualified privacy/legal counsel and the designated policy owner. No one should activate it by inserting a fake approval reference or by bypassing the consent gate.

## All-scheme behavior

The adapter resolver is scheme-specific. A scheme without a reviewed and approved integration remains in manual-navigation mode. The browser extension can preview and fill selected non-sensitive fields in synthetic tests. Live filling is blocked for all four initial scheme routes because none has exact-route department authorization. A `.gov.in` or `.nic.in` suffix alone is insufficient. The extension does not upload documents or submit forms. Portal scripts may react to field changes; citizens must inspect the page after any future authorized fill.

It is not technically or legally credible to claim automatic application submission for every Indian scheme without:
- an authoritative, current scheme and portal inventory;
- per-scheme source/rule approval;
- department/provider authorization for the exact integration;
- a live portal contract and field mapping;
- protected identity and consent steps handled under the portal's rules;
- auditable, verified submission receipts and status reconciliation.

## Release gates

1. Independently approve and publish each scheme's eligibility rules and source evidence.
2. Obtain department authorization for the exact scheme, official domain and allowed actions.
3. Pass live read-only selector/fingerprint tests and scheme-specific acceptance tests.
4. Enable only reviewed, non-sensitive form assistance; keep protected verification and declarations citizen-controlled.
5. Keep final submission citizen-confirmed unless a lawful delegated API explicitly authorizes the service to submit.
6. Record and verify a receipt before marking an application submitted.
7. Complete legal/privacy approval for cloud sync, activate the exact policy version and test authenticated two-device sync, conflict handling, wrong-password rejection, revocation and deletion.

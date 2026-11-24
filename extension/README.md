# JanaSetu Form Assistant — installation and usage

The extension is a user-triggered form assistant for Chromium-based browsers and Firefox (Manifest V3). It offers one-click autofill for a restricted allowlist of non-sensitive fields, plus a separate field-by-field review mode. The web application and extension UI have automated Chromium and Firefox coverage; the browser add-on itself still requires a real installation/acceptance test in each browser before a public release. It is **not** an official government integration and does not submit applications.

## Install on Chrome or Brave

1. Download the repository ZIP from [JanaSetu-AI](https://github.com/PSP-YN/JanaSetu-AI/archive/refs/heads/main.zip) and extract it.
2. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the extracted `JanaSetu-AI-main/extension` directory.
6. Pin the JanaSetu Form Assistant extension if desired.

## Install on Firefox (temporary developer installation)

1. Extract the repository ZIP.
2. Open `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on…**.
4. Choose `JanaSetu-AI-main/extension/manifest.json`.
5. The temporary add-on remains installed only until Firefox closes. A permanent public Firefox release requires Mozilla Add-ons signing and a reviewed distribution package; do not disable signature enforcement.

## Use it

1. Open JanaSetu and complete only the profile fields you are comfortable using.
2. In the profile form, select **Export for form assistant** and confirm the warning. This creates a plaintext JSON transfer file; it is not encrypted and is not a replacement for your encrypted `.janasetu` backup.
3. Open the extension popup, create a strong passphrase of at least 12 characters (16+ characters recommended), and import `JanaSetu-Form-Assistant-Profile.json`. The extension encrypts the profile before writing it to browser storage and verifies the saved ciphertext.
4. Delete the plaintext JSON transfer file after successful import. The extension cannot recover a forgotten passphrase.
5. Each time the popup opens, enter the passphrase and choose **Unlock / securely migrate profile**. The decrypted profile is available only for that popup session. Use **Lock profile now** to clear it earlier.
6. For a synthetic demonstration, open Karnataka SSP Post-Matric Create Account: https://ssp.postmatric.karnataka.gov.in/CA/ . The legacy SSP address currently redirects to `https://ssp.karnataka.gov.in/`; the popup supports both SSP hosts and reveals a one-session Aadhaar input. Do not use real citizen identifiers in a demonstration.
7. Verify the exact URL against the official scheme link and check the confirmation box.
8. Click **Autofill safe fields (recommended)** to fill only the built-in non-sensitive allowlist, or use **Preview matching fields** and approve values individually for a more controlled fill.
9. Re-check every filled value on the portal. JanaSetu stops after filling: it does not click Proceed, Verify, Next, Apply, Save or Submit, upload documents, or complete OTP/CAPTCHA/identity checks. Any further portal interaction is performed manually by the citizen.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, `scripting` and `notifications`. Notifications remind the citizen when OTP, CAPTCHA, consent/declaration or portal-button steps need manual action. It does not request broad host access.
- The citizen explicitly imports the backup, verifies the exact page and invokes either safe autofill or field-by-field preview. Safe autofill uses a fixed allowlist and does not include Aadhaar, contact details, financial/certificate identifiers, consent declarations or document uploads.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- It only attempts to fill visible form controls on an explicit allowlist of known government portal hosts (`ssp.postmatric.karnataka.gov.in`, `ssp.karnataka.gov.in`, `pmkisan.gov.in`, `pmaymis.gov.in`, `pmuy.gov.in`, `www.pmuy.gov.in`, `scholarships.gov.in`) over HTTPS, after the citizen verifies the exact page URL against JanaSetu's official source link and confirms it in the extension. A government-domain suffix is not proof that a page is official. It never clicks Proceed, Verify, Next, Apply, Save or Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- Imported profile data is encrypted at rest in extension local storage using PBKDF2-SHA-256 (600,000 iterations), AES-256-GCM, a fresh 16-byte salt, a fresh 12-byte nonce, and authenticated additional data. The passphrase and derived key are not persisted. The unlocked profile is held in popup memory and is discarded when the popup closes. Legacy plaintext profile migration writes and reads back the encrypted envelope before deleting the old value. If migration verification fails, the original plaintext value is preserved. The JSON transfer file exported by the web app remains plaintext on disk until the citizen deletes it.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Aadhaar is not part of My profile, the reusable JSON export or extension storage. For the Karnataka SSP demo only, the citizen may enter it in the extension popup for the current open-popup session; it is passed to the active SSP tab only for preview/fill and cleared after successful fill or when the tab URL changes. The citizen must approve the Aadhaar field individually. Bank credentials, OTPs, passwords, PINs and sensitive documents remain unsupported.
- The citizen-directed browser helper is separate from department-authorized API automation. It can fill an allowlist of non-sensitive fields with one explicit user action, or preview and fill individually selected fields; it never clicks Next, Apply, Save or Submit. It does not claim a scheme-specific adapter or official department authorization. The four server-side integration records remain `not_requested` until department authorization is recorded.

## Browser validation

The repository Playwright suite runs against Google Chrome and Firefox. This validates the web application, field-matching logic and popup workflow in the two target browser families; it does not substitute for installing the packaged add-on in a normal Chrome/Firefox profile. Chrome/Brave support the unpacked Manifest V3 package. Firefox temporary installation is described above; permanent distribution still needs Mozilla signing.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep only the encrypted profile envelope and non-sensitive preferences locally in the browser |
| `notifications` | Notify the citizen when OTP, CAPTCHA, consent/declaration or portal-button steps need manual action |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

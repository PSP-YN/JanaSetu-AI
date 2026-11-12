# JanaSetu Form Assistant — installation and usage

The extension is a user-triggered, field-by-field form-filling helper for Chromium-based browsers. It is **not** an official government integration and does not submit applications.

## Install on Chrome or Brave

1. Download the repository ZIP from [JanaSetu-AI](https://github.com/PSP-YN/JanaSetu-AI/archive/refs/heads/main.zip) and extract it.
2. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the extracted `JanaSetu-AI-main/extension` directory.
6. Pin the JanaSetu Form Assistant extension if desired.

## Use it

1. Open JanaSetu and complete only the profile fields you are comfortable using.
2. In the profile form, select **Export for form assistant** and confirm the warning. This creates a plaintext JSON profile export; it is not encrypted and is not a replacement for your encrypted `.janasetu` backup.
3. Open the extension popup and import `JanaSetu-Form-Assistant-Profile.json`. Keep the file private and delete it after import.
4. In JanaSetu, open the scheme official portal link in a new tab.
5. Open the extension popup and compare the full active page URL shown there with the official link in JanaSetu. The page must use HTTPS and end in .gov.in or .nic.in.
6. Tick the per-session address-confirmation checkbox. A URL change resets the confirmation and invalidates the preview.
7. Click **Preview matching fields**. Review the suggested label and value for every field. Invalid length/range fields and custom-pattern fields are disabled for manual entry.
8. Select only the individual fields you approve, then click **Fill selected fields**.
8. Re-check every filled value on the portal. Complete OTP, CAPTCHA, identity proofing, document upload and any other required steps yourself. Submit only through the official portal after your final review.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, and `scripting`. It does not request broad host access.
- The citizen explicitly imports the backup, previews matches, selects individual fields and clicks Fill.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- Citizen-directed field assistance is available only on HTTPS .gov.in and .nic.in pages after the citizen verifies the exact URL against JanaSetu's official link for that session. The domain suffix is a coarse filter, not proof that a page is genuine.
- It only attempts to fill visible, unambiguous, non-sensitive form controls. It never clicks Apply/Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- This is not a department-authorized or certified scheme integration. Portal compatibility is not guaranteed; the extension may fill only a subset or no fields.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Do not import Aadhaar numbers, bank credentials, OTPs, passwords, PINs or sensitive documents. The current profile schema does not ask for them.
- Do not use the extension for Aadhaar, PAN, bank identifiers, OTPs, passwords, PINs, CAPTCHA, e-KYC, biometrics, declarations, payments or document uploads. Never treat a successful fill as a completed or submitted application.
- The four initial scheme adapters remain not_requested; JanaSetu does not claim a department-certified integration for them. Citizen-directed local field assistance is separate from those adapter approvals.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

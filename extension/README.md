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
4. Navigate to the exact official government portal page over HTTPS.
5. Click **Preview matching fields** only on an exact portal route that has been independently reviewed and explicitly authorized for form assistance. A `.gov.in` or `.nic.in` suffix by itself is not sufficient.
6. Review the suggested label and value for every field. Invalid length/range fields and custom-pattern fields are disabled for manual entry.
7. Select only the individual fields you approve, then click **Fill selected fields**.
8. Re-check every filled value on the portal. Complete OTP, CAPTCHA, identity proofing, document upload and any other required steps yourself. Submit only through the official portal after your final review.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, and `scripting`. It does not request broad host access.
- The citizen explicitly imports the backup, previews matches, selects individual fields and clicks Fill.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- It only attempts to fill visible form controls on an exact route whose authorization policy is active. It never treats every government domain as supported. It never clicks Apply/Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Do not import Aadhaar numbers, bank credentials, OTPs, passwords, PINs or sensitive documents. The current profile schema does not ask for them.
- Current activation state: the four initial scheme adapters remain `not_requested` and none has an authorized form-filling action. The extension therefore blocks live portal filling until an exact route, field contract, department authorization and citizen-consent scope are approved and tested. It remains available for profile import and local review.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

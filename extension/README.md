# JanaSetu Form Assistant — installation and usage

The extension is a user-triggered, field-by-field form-filling helper for Chromium-based browsers. It is **not** an official government integration and does not submit applications. It can fill only fields it can match safely; no universal scheme-portal compatibility is claimed.

## Install on Chrome or Brave

1. Download the repository ZIP from [JanaSetu-AI](https://github.com/PSP-YN/JanaSetu-AI/archive/refs/heads/backend/harden-supabase-access.zip) and extract it.
2. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the extracted `JanaSetu-AI-main/extension` directory.
6. Pin the JanaSetu Form Assistant extension if desired.

## Use it

1. Open JanaSetu and complete only the profile fields you are comfortable using.
2. Export your JanaSetu JSON backup and keep it private; it contains personal profile information.
3. Open the extension popup and import that backup.
4. Navigate to the exact official government portal page over HTTPS.
5. Click **Preview matching fields**. The extension inspects only visible, empty controls on HTTPS `.gov.in` and `.nic.in` hosts.
6. Review the suggested label and value for every field. Invalid length/range fields and custom-pattern fields are disabled for manual entry.
7. Select only the individual fields you approve, then click **Fill selected fields**.
8. Re-check every filled value on the portal. JanaSetu stops after filling: it does not click Next, Apply, Save or Submit, upload documents, or complete OTP/CAPTCHA/identity checks. Any further portal interaction is performed manually by the citizen.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, and `scripting`. It does not request broad host access.
- The citizen explicitly imports the backup, previews matches, selects individual fields and clicks Fill.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- It only attempts to fill visible form controls. It never clicks Apply/Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Do not import Aadhaar numbers, bank credentials, OTPs, passwords, PINs or sensitive documents. The current profile schema does not ask for them.
- This extension has not been broadly tested against all government portals. Portal-specific tests and citizen review are required before real use.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

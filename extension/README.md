# JanaSetu Form Assistant — installation and usage

The extension is a user-triggered form-filling helper for Chromium-based browsers. It is **not** an official government integration.

## Install on Chrome or Brave

1. Download the repository ZIP from [JanaSetu-AI](https://github.com/PSP-YN/JanaSetu-AI/archive/refs/heads/main.zip) and extract it.
2. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the extracted `JanaSetu-AI/extension` directory.
6. Pin the JanaSetu Form Assistant extension if desired.

## Use it

1. Open JanaSetu and fill the profile with information you are comfortable sharing.
2. Export your JanaSetu JSON backup. Keep it private; it contains personal profile information.
3. Open the extension popup and import that backup.
4. Navigate to the official scheme application portal.
5. Click the extension and choose **Fill fields on active tab**.
6. Inspect every field. Correct mismatches and missing fields manually.
7. Complete portal-specific verification and submit yourself, only after reviewing the final form.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, and `scripting`. It does not request broad host access.
- The citizen explicitly imports the backup and clicks Fill.
- It only attempts to fill visible form controls; it does not click Apply/Submit, upload files, or bypass OTP, CAPTCHA, consent, or other checks.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label and option matching is heuristic. A field may be missed or mapped incorrectly. Treat all output as a draft.
- Do not import Aadhaar numbers, bank credentials, OTPs, or sensitive documents. The current profile schema does not ask for them.
- This extension has not been broadly tested against all government portals. Portal-specific testing and user review are required before using it for real applications.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |

The extension is a prototype for assisted preparation. It does not represent or act for any Government of India or State Government department.

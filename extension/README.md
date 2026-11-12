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
5. Click **Preview matching fields** only after opening the official HTTPS `.gov.in` or `.nic.in` page from JanaSetu and checking the exact URL yourself. A government-domain suffix is a technical allowlist, not proof that a page is official; verify the destination against the scheme's official source.
6. Review the suggested label and value for every field. Invalid length/range fields and custom-pattern fields are disabled for manual entry.
7. Select only the individual fields you approve, then click **Fill selected fields**.
8. Re-check every filled value on the portal. JanaSetu stops after filling: it does not click Next, Apply, Save or Submit, upload documents, or complete OTP/CAPTCHA/identity checks. Any further portal interaction is performed manually by the citizen.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, and `scripting`. It does not request broad host access.
- The citizen explicitly imports the backup, previews matches, selects individual fields and clicks Fill.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- It only attempts to fill visible form controls on HTTPS hosts ending in `.gov.in` or `.nic.in`, after the citizen verifies the exact page URL against JanaSetu's official source link and confirms it in the extension. A government-domain suffix is not proof that a page is official. It never clicks Next, Apply, Save or Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Do not import Aadhaar numbers, bank credentials, OTPs, passwords, PINs or sensitive documents. The current profile schema does not ask for them.
- The citizen-directed browser helper is separate from department-authorized API automation. It can preview and fill individually selected, safe fields on a citizen-verified HTTPS government page; it never clicks Next, Apply, Save or Submit. It does not claim a scheme-specific adapter or official department authorization. The four server-side integration records remain `not_requested` until department authorization is recorded.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

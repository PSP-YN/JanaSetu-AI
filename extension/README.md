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
4. For the judging demo, open Karnataka SSP Post-Matric Create Account: https://ssp.postmatric.karnataka.gov.in/CA/ .
5. Click the extension icon, check the exact HTTPS URL, and confirm the page in the popup. On this exact SSP host, the popup reveals a one-session Aadhaar input; it is not part of the profile export or extension storage. Enter it there only if you want to demonstrate the first-step field fill.
6. Click **Preview matching fields**. Review every suggested label and value. Invalid length/range fields and custom-pattern fields are disabled for manual entry.
7. Select only the individual fields you approve, then click **Fill selected fields**.
8. Re-check every filled value on the portal. JanaSetu stops after filling: it does not click Proceed, Verify, Next, Apply, Save or Submit, upload documents, or complete OTP/CAPTCHA/identity checks. Any further portal interaction is performed manually by the citizen.

## Safety and privacy

- Extension permissions are `activeTab`, `storage`, `scripting` and `notifications`. Notifications remind the citizen when OTP, CAPTCHA, consent/declaration or portal-button steps need manual action. It does not request broad host access.
- The citizen explicitly imports the backup, previews matches, selects individual fields and clicks Fill.
- Preview does not change the page. Fill re-scans the current page and checks the field fingerprint and empty state again to avoid stale previews and overwriting values typed after preview.
- It validates exact select/radio option matches, text maximum length and numeric minimum/maximum/step. A portal-defined custom `pattern` is not executed as an arbitrary regular expression; the field is disabled for manual entry.
- It only attempts to fill visible form controls on HTTPS hosts ending in `.gov.in` or `.nic.in`, after the citizen verifies the exact page URL against JanaSetu's official source link and confirms it in the extension. A government-domain suffix is not proof that a page is official. It never clicks Proceed, Verify, Next, Apply, Save or Submit, invokes form submission, uploads files, or bypasses OTP, CAPTCHA, consent, payment, identity proofing or other checks.
- Imported profile data is stored in the extension's local Chrome storage on that browser profile. Remove it by clearing the extension's local data or uninstalling the extension.
- Label matching remains heuristic. A field may be missed or mapped incorrectly. Treat all filled values as a draft and verify them yourself.
- Aadhaar is not part of My profile, the reusable JSON export or extension storage. For the Karnataka SSP demo only, the citizen may enter it in the extension popup for the current open-popup session; it is passed to the active SSP tab only for preview/fill and cleared after successful fill or when the tab URL changes. The citizen must approve the Aadhaar field individually. Bank credentials, OTPs, passwords, PINs and sensitive documents remain unsupported.
- The citizen-directed browser helper is separate from department-authorized API automation. It can preview and fill individually selected, safe fields on a citizen-verified HTTPS government page; it never clicks Next, Apply, Save or Submit. It does not claim a scheme-specific adapter or official department authorization. The four server-side integration records remain `not_requested` until department authorization is recorded.

## Permission rationale

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab only after the user invokes the extension |
| `scripting` | Inspect and fill visible fields in that active tab |
| `storage` | Keep the imported profile locally in the browser |
| `notifications` | Notify the citizen when OTP, CAPTCHA, consent/declaration or portal-button steps need manual action |

The extension is an assisted-preparation prototype. It does not represent or act for any Government of India or State Government department.

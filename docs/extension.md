# JanaSetu Form Assistant (experimental)

This extension is a local, user-triggered form-filling prototype. It is not a government integration and does not intentionally submit forms or upload files. It dispatches input/change events so websites can recognize filled values; a portal may react to those events, including by navigating or submitting. Inspect the page after filling.

## Install locally (Chrome / Chromium / Edge)

1. Open JanaSetu and create/review a profile.
2. Click **Backup** and save the JSON file to your device.
3. Download/clone this repository and open `extension/`.
4. In Chrome, visit `chrome://extensions`; enable **Developer mode**.
5. Choose **Load unpacked** and select the repository's `extension` folder.
6. Open the official scheme portal in a tab.
7. Click the extension icon, choose the exported JanaSetu JSON file, and click **Import reviewed profile**.
8. Click **Fill fields on active tab**. After filling, check whether the portal reacted or navigated. Review every populated field and submit only if the page has not already advanced and you decide to continue.

## Safety and limitations

- The extension requests `activeTab`, `storage`, and `scripting`; it does not request blanket access to all websites.
- Form matching is heuristic (visible labels, placeholders, names and IDs) and uses whole-word/phrase alias matching to avoid substring collisions such as `username` being treated as `name`.
- Select controls are filled only when exactly one enabled option has an exact normalized label or value match. Partial matches, missing options and duplicate matching options are skipped and are not counted as filled.
- Boolean declaration checkboxes are deliberately not auto-checked. Unknown or ambiguous values stay unchanged.
- The extension itself does not click Submit/Apply, call form submission APIs or upload files. Portal scripts may react to the input/change events it dispatches; inspect the page after filling. It does not solve CAPTCHA, bypass authentication or claim to have applied.
- Profile data is imported into extension storage on the current browser profile. Treat the backup as private; delete it when no longer needed.
- Do not import Aadhaar, bank account, OTP, or other highly sensitive identifiers into this prototype.
- Test only with dummy data before use on official portals.

## Cross-device continuity

Browser localStorage is device/browser-specific. For no-account, privacy-first use:
- Keep the working draft locally in JanaSetu.
- Export a versioned JSON backup for machine-readable restore on another device.
- Use PDF for printing/sharing a human-readable checklist, not as the restore format.
- Keep a human confirmation step before extension fill and before final submission.

A future production extension should add explicit portal-specific field mapping, test fixtures, conflict warnings, per-field consent, and a clear data wipe control.

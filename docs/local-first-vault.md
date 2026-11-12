# JanaSetu local-first encrypted vault

## What is local
- Citizen document binaries selected in the Documents area are stored in the browser's IndexedDB on that device.
- The application does not send those local document binaries to Supabase as part of the local vault workflow.
- Export creates one portable `.janasetu` file containing the citizen workspace and available local document binaries.
- The exported file uses AES-256-GCM authenticated encryption. A random 16-byte salt and 12-byte nonce are generated for each export. A password-derived key is created with PBKDF2-HMAC-SHA-256 (600,000 iterations).
- Import decrypts in the browser. A wrong password or modified ciphertext fails authentication before restore.
- The password is not uploaded or saved by JanaSetu. Losing it means losing access to that export.

## Limits and threat model
- Passwords must be at least 12 characters. Use a unique passphrase and keep an offline recovery copy.
- Exported vault size is limited to 40 MB; included document binaries are limited to 25 MB total; individual document selection is limited to 12 MB.
- The local IndexedDB copy is not application-level encrypted at rest. It is protected by the device/browser profile and operating-system controls. Use full-disk encryption and a locked user account. Clear site data only after exporting a vault.
- The encrypted export is protected by AES-GCM. This is not a third-party cryptographic audit or a guarantee against malware on the device, browser extensions, keyloggers, memory inspection, or a compromised browser.
- Old plaintext JSON backups are not accepted by the encrypted-vault import control.
- Previously added document checklist entries may not have corresponding binary files. Only files added after the local IndexedDB vault feature is enabled are included as document binaries; old entries remain references.
- The vault includes selected profile/workspace records and local document binaries, not a government portal account, application submission, or proof of eligibility.

## Local malware scanning (free)
The portable vault encryption and malware scanning are separate controls. Encryption does not make a file safe. The app does not mark a document clean automatically.

On Fedora:
```bash
sudo dnf install clamav clamav-update
sudo freshclam
chmod +x scripts/scan-local-document.sh
./scripts/scan-local-document.sh /path/to/document.pdf
```

The script updates ClamAV signatures and scans the selected file on the same machine. Exit codes: 0 = no detection, 1 = detection, 2 = scan unavailable/error. An unavailable or failed scan is never represented as clean.

The existing Supabase queue worker remains an optional integration for the separate cloud-quarantine workflow. It is not required for local vault export/import and does not need paid Render hosting for this hackathon demo.

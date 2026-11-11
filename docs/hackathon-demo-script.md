# JanaSetu AI — 2-minute hackathon demo script

## Before recording
- Open the deployed JanaSetu app over HTTPS (Web Crypto requires a secure context).
- Use synthetic profile data and harmless sample PDFs only. Never use real Aadhaar, bank, caste, income or medical documents.
- Keep the password out of the recording. Use a strong demo-only passphrase of at least 12 characters.
- Clear the browser profile before the demo if you want to show a fresh import.

## Recording flow (about 2 minutes)
**0:00–0:15 — Problem**
"Citizens often have to repeat the same information and gather the same evidence across different benefit applications. Sensitive documents should not need to live in another centralised database just to organise an application."

**0:15–0:40 — Discover and prepare**
"JanaSetu helps a citizen create a profile, explore a source-linked starter catalogue, understand potential eligibility, and prepare a draft. This is preliminary guidance, not an official eligibility decision or government submission."

**0:40–1:15 — Local document vault**
"Documents are stored in this browser's local IndexedDB. The vault export encrypts the profile, draft records and selected documents in one portable file using AES-256-GCM. The encryption key is derived from a password in the browser; JanaSetu does not receive or store that password."

Show export, then import the same file. Show that an incorrect password is rejected before importing.

**1:15–1:40 — Security boundary**
"Local vault encryption is separate from malware scanning. The demo does not claim that a file is virus-free. A file that has not been scanned remains unverified. Optional ClamAV scanning can run locally without a paid hosted worker."

**1:40–2:00 — Honest scope**
"JanaSetu is a citizen-side preparation layer. The department remains authoritative. The current catalogue is partial; scheme approvals, legal consent approval and government API authorisations are not being fabricated."

## On-screen demo checklist
1. Use a synthetic citizen profile.
2. Add a harmless sample PDF.
3. Export a password-protected .janasetu file.
4. Show that the file contents are encrypted, not readable JSON.
5. Import it with the correct password.
6. Try an incorrect password and show rejection.
7. State clearly that this proves local encryption/import, not a third-party security audit.

# Encrypted cross-device workspace sync

## Implementation

- Browser-side encryption uses PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM.
- The vault password never leaves the browser. Each encryption uses a random 16-byte salt and 12-byte IV.
- The API accepts only a strict versioned encrypted envelope, rejects plaintext payloads, enforces an 8 MiB request limit, authenticates the Supabase session, checks same-origin writes, and returns `Cache-Control: private, no-store`.
- Database reads/writes use guarded RPCs, not direct table REST access. The RPC checks `auth.uid()`, active cloud-sync consent and the envelope schema. The table remains protected by RLS and direct browser writes remain revoked.
- A monotonic revision implements compare-and-swap. If another device has saved a newer revision, the API returns HTTP 409; it does not silently overwrite. The user must restore the latest snapshot, reconcile their local changes and retry.
- Cloud storage contains only `profile_data.encrypted_workspace_v1`. Structured plaintext workspace columns are reset to empty values by the encrypted-sync RPC.
- Restore requires the same vault password. JanaSetu cannot recover a lost vault password.

## Current activation state

<badge>Disabled pending independent review</badge>

The database policy registry contains no legally approved active cloud-sync policy. The RPCs and API intentionally return a consent-policy error until an exact policy version is independently reviewed and activated. The application must not ask citizens to accept an unapproved draft or imply that sync is available.

## Cloud sync policy text — draft for legal review

> **JanaSetu Cloud Workspace Sync — Privacy Notice and Consent Draft (version 2026-11-12-draft-1)**
>
> If you enable cloud workspace sync, JanaSetu will store a client-encrypted copy of the workspace data you choose to sync in your own authenticated JanaSetu account. Your browser encrypts the workspace using a password you create before sending it. JanaSetu's application server and database receive the encrypted vault envelope, not the plaintext workspace or your vault password.
>
> Encryption currently uses PBKDF2-SHA-256 with 600,000 iterations to derive an AES-256-GCM key. Your vault password is not recoverable by JanaSetu. If you lose it and do not have another decrypted/local backup, JanaSetu cannot decrypt or restore the cloud vault.
>
> The synced workspace may contain profile details, language preference, preliminary assessments, application preparation drafts, document references and reminders. Do not include Aadhaar numbers, bank account numbers, OTPs, passwords, CAPTCHA answers, payment credentials or document bytes. The sync service rejects plaintext workspace payloads and stores the encrypted envelope only.
>
> The encrypted vault is stored in JanaSetu's Supabase database in the Mumbai region and is scoped to your authenticated account. It is used only to restore your workspace on devices where you sign in and provide your vault password. It is not used for advertising or sold to third parties. Infrastructure operators may process encrypted data to host, secure, back up and maintain the service.
>
> You can stop future synchronization by revoking cloud workspace sync consent. Revocation blocks subsequent reads and writes through the sync API. Revocation does not by itself guarantee immediate deletion of database backups or previously stored ciphertext. To request deletion, use the account/data deletion process described in the privacy notice. Backups may persist for a limited operational retention period before expiry.
>
> Cloud sync is optional. Local-only use and encrypted file export remain available. By opting in after this policy is approved, you authorize JanaSetu to store and retrieve the encrypted workspace envelope for the sync purpose described above. This consent is separate from consent for application preparation, document storage, assisted form filling or government portal actions.
>
> This draft is not legal advice or legal approval. It must be reviewed by qualified privacy/legal counsel, reconciled with the final privacy notice, retention schedule, subprocessors, backup policy and applicable Indian data-protection requirements, and approved by the designated policy owner before activation.

## Release checklist

- [ ] Qualified privacy/legal review completed; record reviewer and reference.
- [ ] Confirm the data inventory and ensure the synced payload excludes high-risk identifiers and document bytes.
- [ ] Approve a retention and deletion schedule, including database backups.
- [ ] Confirm incident response, account recovery, access logs and backup controls.
- [ ] Activate the exact policy version in the private policy registry.
- [ ] Complete authenticated two-account isolation tests.
- [ ] Complete two-browser/two-device sync, restore, wrong-password, stale-revision conflict and consent-revocation tests.
- [ ] Complete production smoke tests after deployment.

## Important limitations

The sync engine is implemented but cannot be declared production-enabled until the checklist's independent approval and end-to-end tests pass. Do not store the vault password in localStorage, cookies, telemetry or server logs. Keep an offline encrypted export as a recovery option.

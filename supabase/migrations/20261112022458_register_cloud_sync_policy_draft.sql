insert into private.consent_policy_versions(purpose,version,content_sha256,legal_review_reference,approved_at,active)
values (
  'cloud_workspace_sync',
  '2026-11-12-draft-1',
  encode(digest(convert_to($policy$JanaSetu Cloud Workspace Sync — Privacy Notice and Consent Draft (version 2026-11-12-draft-1)

If you enable cloud workspace sync, JanaSetu will store a client-encrypted copy of the workspace data you choose to sync in your own authenticated JanaSetu account. Your browser encrypts the workspace using a password you create before sending it. JanaSetu's application server and database receive the encrypted vault envelope, not the plaintext workspace or your vault password.

Encryption currently uses PBKDF2-SHA-256 with 600,000 iterations to derive an AES-256-GCM key. Your vault password is not recoverable by JanaSetu. If you lose it and do not have another decrypted/local backup, JanaSetu cannot decrypt or restore the cloud vault.

The synced workspace may contain profile details, language preference, preliminary assessments, application preparation drafts, document references and reminders. Do not include Aadhaar numbers, bank account numbers, OTPs, passwords, CAPTCHA answers, payment credentials or document bytes. The sync service rejects plaintext workspace payloads and stores the encrypted envelope only.

The encrypted vault is stored in JanaSetu's Supabase database in the Mumbai region and is scoped to your authenticated account. It is used only to restore your workspace on devices where you sign in and provide your vault password. It is not used for advertising or sold to third parties. Infrastructure operators may process encrypted data to host, secure, back up and maintain the service.

You can stop future synchronization by revoking cloud workspace sync consent. Revocation blocks subsequent reads and writes through the sync API. Revocation does not by itself guarantee immediate deletion of database backups or previously stored ciphertext. To request deletion, use the account/data deletion process described in the privacy notice. Backups may persist for a limited operational retention period before expiry.

Cloud sync is optional. Local-only use and encrypted file export remain available. By opting in after this policy is approved, you authorize JanaSetu to store and retrieve the encrypted workspace envelope for the sync purpose described above. This consent is separate from consent for application preparation, document storage, assisted form filling or government portal actions.

This draft is not legal advice or legal approval. It must be reviewed by qualified privacy/legal counsel, reconciled with the final privacy notice, retention schedule, subprocessors, backup policy and applicable Indian data-protection requirements, and approved by the designated policy owner before activation.$policy$, 'UTF8'), 'sha256'), 'hex'),
  null,
  null,
  false
)
on conflict (purpose, version) do nothing;

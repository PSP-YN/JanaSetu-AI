# JanaSetu private document scanner

This service runs ClamAV locally and uses a dedicated Supabase Auth scanner identity. It does not call third-party file-scanning services and does not use the Supabase service-role key.

## Security model

- Citizen uploads remain in the private `citizen-documents` bucket and start in `quarantined`.
- The scanner identity must be explicitly assigned an active `document_scanner_roles` row. Do not use a citizen or reviewer account.
- The scanner can read quarantined objects only through the storage policy for active scanner identities. Citizens can read only their own documents after a `clean` attestation.
- The worker claims documents using a 10-minute database lease. Claims use row locking with `SKIP LOCKED`, so multiple workers do not scan the same item concurrently.
- The worker validates size and file signatures, computes SHA-256, then streams bytes to local ClamAV using the INSTREAM protocol.
- A document becomes `clean` only after ClamAV returns `OK`; infected or structurally invalid files become `rejected`.
- Network, storage, ClamAV and indeterminate failures do not create a clean attestation. The lease expires and the document remains quarantined for retry.
- Scanning stops if the ClamAV daily signature database is missing or older than 48 hours.
- Logs contain document IDs and error classes only, never filenames, file contents, profile data or tokens.
- No service-role key is required. The scanner uses its own authenticated identity and the public/publishable key.

## Provisioning

1. Apply migration `20261111100000_add_leased_clamav_document_scanner.sql` to the dedicated JanaSetu Supabase project.
2. Create a dedicated Supabase Auth user for the scanner. Disable public sign-up for this identity and store its password in the scanner host's secret manager.
3. Assign the scanner role using the new user's UUID in the Supabase SQL editor:

   ```sql
   insert into private.document_scanner_roles(user_id, active)
   values ('SCANNER_AUTH_USER_UUID', true)
   on conflict (user_id) do update set active = true;
   ```

   Do not commit the UUID or credentials. Remove the role immediately if the host is compromised.
4. Copy `.env.example` to `.env`, fill in the dedicated JanaSetu project URL, publishable key and scanner credentials. Keep `.env` out of Git.
5. Run `docker compose up --build -d`. The first startup downloads ClamAV signatures; it may take several minutes.
6. Inspect health with `docker compose ps` and logs with `docker compose logs --tail=100 janasetu-document-scanner`. Logs must not contain file names, content, personal data or credentials.
7. Run the acceptance test below with a synthetic PDF/JPEG/PNG test document and a harmless EICAR test string in an isolated non-production test case. Confirm the EICAR file is rejected and never becomes downloadable. Never upload EICAR to a citizen case.

## Acceptance gates

- [ ] Scanner Auth user has only the scanner role; no human reviewer/publisher roles.
- [ ] A quarantined object can be read by the scanner identity but not by a citizen.
- [ ] A clean synthetic file is downloadable only after a clean ClamAV attestation.
- [ ] EICAR test file is rejected and remains unavailable to citizens.
- [ ] A wrong MIME/signature or size mismatch is rejected.
- [ ] A scanner outage, stale signature database, failed download or timeout leaves the object quarantined.
- [ ] An expired lease is reclaimed after worker restart.
- [ ] Revoking the scanner role prevents further claims and storage reads.
- [ ] Retention and deletion policy is approved before real citizen documents are enabled.

## Operational note

The Compose file deliberately does not publish the ClamAV TCP port. Run this on a continuously available, patched host with encrypted disks, restricted operator access, backups for configuration only, and monitored signature updates. A laptop or a sleeping free-tier web service is suitable for development, not a production document-processing SLA. Keep live uploads blocked until legal consent policy, scanner provisioning and the acceptance tests are complete.

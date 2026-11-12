# Source verification and freshness register

**Operational status: attention required — not approved for real-citizen eligibility decisions.**

Last reviewed in repository: 5 November 2026.

## Source register

| Source | Use in JanaSetu | Verification state | Refresh policy | Owner/action |
|---|---|---|---|---|
| SmartDuke Technologies scheme dataset (CC BY 4.0) | Search/discovery only | Third-party, machine-parsed, not independently verified | Snapshot age alert after 90 days; availability checked by `/api/sources/health` | Review each record against its linked department notification before promoting it |
| myScheme | Official discovery destination and manual reference | Government platform; no automated scraping | Manual review or approved API only | Obtain written authorization/API terms before any automated access |
| Central ministry / department pages | Rule evidence for four prototype screens | Source-linked; scheme-by-scheme review still required | Review at least quarterly and on detected amendment | Record reviewer, effective date, notification URL and test cases |
| Karnataka budget-derived leads | Discovery leads only | Model-classified, not human-reviewed, not verified schemes | Do not promote without primary source evidence | Human review and official notification required |

## Promotion workflow

1. Capture the official notification, guideline or department page URL. Prefer primary government domains and documents.
2. Record scheme title, department, jurisdiction, language, benefit, application window, effective date, superseding notice and date checked.
3. A reviewer compares every eligibility condition and exclusion against the primary source. Third-party parsed fields are never treated as authoritative.
4. A second reviewer approves any rule that can change a citizen-facing assessment.
5. Add boundary, unknown-answer, contradictory-fact and exclusion fixtures to the rule tests.
6. Publish a versioned rule record with reviewer identity/role and review date. Keep the previous version for audit.
7. If the official source is unavailable, materially changed or past its review threshold, mark the record stale and suppress deterministic screening until re-approved.

## Current release boundary

- Only four Central scheme records have deterministic prototype rules, and all remain pending two independent human approvals.
- The 4,693-row SmartDuke dataset is a third-party discovery catalogue, not an official or complete national scheme database.
- The 96 Karnataka budget-derived records are leads, not verified schemes.
- The source monitor checks availability of the third-party dataset metadata endpoint and reports snapshot age. It does not certify record accuracy or automatically scrape myScheme.
- myScheme terms prohibit automated bots/scrapers without express written authorization. Use an approved API or manual review.

## Required audit fields before production

`scheme_id`, `jurisdiction`, `official_title`, `primary_source_url`, `notification_number`, `effective_from`, `effective_to`, `supersedes`, `language`, `reviewed_at`, `reviewer_role`, `second_approver_role`, `rule_version`, `test_fixture_version`, `freshness_status`, `change_reason`.

No scheme should be marked verified solely because its URL resolves or its content appears in a third-party dataset.


## Official-source refresh — 4 November 2026

This refresh checked the four deterministic scheme records against live or current official sources. It is a source-preparation pass, not a full amendment audit, independent approval, legal opinion or eligibility validation.

| Scheme | Current official evidence checked | Catalogue consequence | Remaining blocker |
|---|---|---|---|
| PM-KISAN | Operational Guidelines revised 29 March 2020; live PM-KISAN portal snapshot checked 4 Nov 2026. Portal reports the 24th instalment released 30 Oct 2026, says eKYC is mandatory, and flags suspected post-01.02.2019 land acquisitions / multiple family-member claims for temporary withholding pending physical verification. | Source date and notes refreshed; the older guideline is not presented as the complete current rulebook. | Reconcile all post-2020 circulars, land transfer/succession handling, exclusions, eKYC and current State/UT verification instructions. |
| PMAY-U 2.0 | Official index checked 4 Nov 2026 lists September 2024 English/Hindi guidelines and an April 2026 AHP SOP. Guidelines state central EWS/LIG/MIG bands, family/house ownership criteria and 20-year prior allotment condition. | Source date and notes refreshed; no generic screen is represented as covering all four verticals. | Review BLC/AHP/ARH/ISS separately, applicable amendments, State/UT EWS flexibility, ULB verification and current SOPs. |
| PMUY 2.0 | Official eligibility page and FAQ checked 4 Nov 2026. FAQ describes adult woman, poor-household deprivation declaration, no household LPG connection according to family-composition document, mandatory biometric Aadhaar authentication, migrant document exceptions, PNG restriction and listed connection benefits. | Source date and notes refreshed; deprivation checklist and document requirements are called out. | Verify current deprivation declaration version, all checklist items, subsequent extension/circulars and OMC operating instructions. |
| PM-USP CSSS | Live NSP CSSS entry checked 4 Nov 2026. Exact entry shows AY 2026–27 renewal applications open 1 Jun–30 Nov 2026, defective/institute verification to 15 Dec and DNO/SNO/MNO verification to 31 Dec. Linked specifications are updated 7 Feb 2024; detailed FAQ is AY 2025–26. | Source date refreshed; the deadline is explicitly scoped to renewal, not fresh applications. | Obtain and compare current AY 2026–27 fresh/renewal rules, Board-wise percentile lists, course/renewal conditions and any updated FAQ. |

### Primary references checked

- PM-KISAN guidelines (revised 29.03.2020): https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf
- PM-KISAN live portal: https://pmkisan.gov.in/
- PM-KISAN FAQ: https://pmkisan.gov.in/Documents/RevisedFAQ.pdf
- PMAY-U 2.0 official guideline index: https://pmay-urban.gov.in/guideline
- PMAY-U 2.0 English guidelines (September 2024): https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf
- PMAY-U AHP SOP (April 2026): https://pmay-urban.gov.in/uploads/guidelines/AHP-SOP.pdf
- PMUY 2.0 eligibility page: https://www.pmuy.gov.in/ujjwala2.html
- PMUY FAQ: https://www.pmuy.gov.in/faq.html
- PMUY deprivation declaration: https://www.pmuy.gov.in/documents/Deprivation_Declaration_for_Poor_Households_English.pdf
- NSP live CSSS entry: https://scholarships.gov.in/All-Scholarships
- CSSS specifications updated 07.02.2024: https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf
- PM-USP CSSS FAQ AY 2025–26: https://scholarships.gov.in/public/schemeGuidelines/FAQ_DOHE_CSSS.pdf

**Important:** The source checks above do not establish an exhaustive amendment history. Each packet records inspected sources, known rule/code gaps, proposed boundary fixtures and unresolved questions. All four rules remain pending two independent human approvals and must continue to fail closed. The 4,693-row SmartDuke third-party catalogue remains a 5 July 2026 snapshot, older than the 90-day freshness threshold as of this review. No newer verified upstream snapshot was established in this pass. The 142-record built-in catalogue is still 4 rule-screened records plus 138 catalogue-only records; the 96 Karnataka budget leads remain unverified discovery leads.


## Official catalogue benchmark — 4 November 2026

The public myScheme homepage advertises **5,150+ total schemes**, including **740+ Central** and **4,400+ State/UT** schemes. The myScheme FAQ states that the platform supports **15 languages**. The Terms & Conditions page is marked last updated **18 September 2026**. This is a public headline benchmark only; it is not a row-level downloadable export and must not be directly reconciled or subtracted from the SmartDuke dataset count.

- Official portal: https://www.myscheme.gov.in/
- Official FAQs: https://www.myscheme.gov.in/faqs
- Terms of Use: https://www.myscheme.gov.in/terms-of-use
- Official contact: support-myscheme@digitalindia.gov.in; +91 11 24303714 (09:00–17:30 IST).

The Terms of Use explicitly prohibit software such as bots and scraper tools from automatically accessing, monitoring or copying platform pages unless myScheme expressly authorizes this in writing. Therefore JanaSetu does **not** scrape the site, reverse-engineer private endpoints, or automate account-based access. The required next step is a written request for an approved API/API Setu feed, permitted fields, refresh cadence, redistribution rights, attribution, rate limits and retention terms.

The external SmartDuke mirror remains a 4,693-row snapshot collected 5 July 2026, with repository last modified 6 July 2026. The live source monitor checked on 5 November 2026 reports metadata and row endpoints available, the indexed revision equal to the latest publisher revision, no update available, and the upstream `/search` endpoint unavailable. The snapshot is 123 days old and stale under the 90-day policy. A daily workflow checks for publisher revisions and opens a draft review PR only when a new validated revision appears; it never auto-merges or auto-approves data. The workflow's duplicate-PR check and recovery path are covered in the operations runbook.

### Third-party catalogue quality audit

A reproducible field-completeness audit and human exception queue are generated from the exact compressed snapshot:

- `docs/smartduke-catalogue-audit.json` — revision, collection date, unique identifiers, duplicate-title signals, missing-field counts and jurisdiction/category distribution.
- `docs/smartduke-record-review-queue.csv` — records with one or more missing metadata fields or duplicate-title flags, with two blank reviewer slots and a pending decision.

Audit result for the 5 July 2026 publisher snapshot (4,693 rows): all 4,693 slugs are unique; one normalized scheme-title duplicate group contains two rows; 4,306 rows have at least one quality flag. Missing fields include 4 categories, 4,012 ministry values, 293 department values, 9 application URLs, 4 descriptions, 4 benefit descriptions, 4 eligibility-text values, 4 application-process values and 17 document lists. Counts overlap across records. Missing ministry metadata is not proof that a record is invalid, but it makes the source inadequate for unsupervised authoritative use. Duplicate titles are flagged for manual reconciliation and never auto-deleted.

The audit is data-quality triage, not verification of scheme existence, current status, legal eligibility or official application routes. Every third-party record remains catalogue-only.


API Setu documentation identifies myScheme as a service-API partner and describes consumer subscription subject to publisher approval. The API directory search did not establish that a public row-level myScheme catalogue feed is currently available. Treat API Setu as an access-request route, not as an API already available to JanaSetu. References: https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html ; https://apisetu.gov.in/contact


## Live refresh verification — 13 November 2026

The production source monitor was checked against the live publisher endpoints on 13 November 2026. The local refresh script was also run directly.

- The publisher API returned the same revision (`a1bbf7b20778f4e82ed35e09b187bf4fd86a1a29`) and repository modification time (6 July 2026). The refresh script correctly reported **no publisher revision change** and did not rewrite the known-good snapshot.
- The 5 July 2026 collection snapshot is **130 days old** at the live production check, exceeding the 90-day policy. Its freshness remains `stale` and overall source health remains `attention_required`.
- Publisher metadata and row endpoints responded successfully; the publisher search endpoint was unavailable. JanaSetu retains the bundled full-text index of 4,693 rows as a discovery-only fallback.
- No new dataset revision was available to import. The collection date must not be advanced and the 90-day threshold must not be relaxed merely to clear the warning. A new revision must pass row-count, unique-slug, HTTPS-source, integrity and human-review checks before replacing the current index.

The live Supabase release gates were also inspected:

- Four scheme records remain `review_pending`; there are zero approval records and zero active reviewer-role assignments.
- Four portal integration records remain `not_requested`; zero have an authorization reference or approval timestamp.
- The only consent-policy row is an inactive `cloud_workspace_sync` draft with no legal approval reference. There is no approved `profile_storage` or `document_storage` policy.

These are external approval and authorization dependencies, not deployment switches. Scheme publication, persisted application preparation, cloud uploads and department-authorized portal API automation remain fail-closed until the corresponding independent reviewers, legal reviewer and department authorization are actually in place. Citizen-directed browser field filling remains separate and never performs final submission.

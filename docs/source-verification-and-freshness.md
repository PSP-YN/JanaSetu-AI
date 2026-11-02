# Source verification and freshness register

**Operational status: attention required — not approved for real-citizen eligibility decisions.**

Last reviewed in repository: 2 November 2026.

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

- Only four Central scheme records have deterministic prototype screening.
- The 4,693-row SmartDuke dataset is a third-party discovery catalogue, not an official or complete national scheme database.
- The 96 Karnataka budget-derived records are leads, not verified schemes.
- The source monitor checks availability of the third-party dataset metadata endpoint and reports snapshot age. It does not certify record accuracy or automatically scrape myScheme.
- myScheme terms prohibit automated bots/scrapers without express written authorization. Use an approved API or manual review.

## Required audit fields before production

`scheme_id`, `jurisdiction`, `official_title`, `primary_source_url`, `notification_number`, `effective_from`, `effective_to`, `supersedes`, `language`, `reviewed_at`, `reviewer_role`, `second_approver_role`, `rule_version`, `test_fixture_version`, `freshness_status`, `change_reason`.

No scheme should be marked verified solely because its URL resolves or its content appears in a third-party dataset.


## Official-source spot checks — 2 November 2026

These checks validate that the four rule-screened records have relevant official destinations; they do **not** constitute full rule-by-rule approval.

| Record | Official evidence observed | Required correction / caveat |
|---|---|---|
| PM-KISAN | Official operational-guidelines PDF on pmkisan.gov.in describes landholding farmer families, State/UT land records, ₹6,000/year and exclusion categories. | The located PDF is an older guideline copy. Reconcile it against all later circulars/updates before continuing to expose a deterministic result as current. |
| PMAY-U 2.0 | MoHUA guideline index lists PMAY-U 2.0 English/Hindi guidelines (September 2024) and an April 2026 SOP. The official guideline states income bands, no pucca house and 20-year prior housing assistance conditions. | Compare current operational SOP and all amendments, and preserve the rural PMAY-G routing caveat. |
| PMUY 2.0 | Official PMUY FAQ describes adult-woman applicant, poor-household declaration, no existing household LPG connection and age 18+. | Reconcile documents and benefit amounts with the latest extension/notifications before using them in any decision workflow. |
| PM-USP CSSS | Official NSP AY 2026–27 pages list the scheme and current cycle information. Search-indexed official NSP pages showed differing renewal dates (31 October and 30 November 2026). | Treat application-window status as uncertain until the live scheme-specific listing is manually checked. Eligibility logic currently cites the 2025–26 Ministry FAQ and must be re-reviewed for AY 2026–27. |

Primary references:
- PM-KISAN: https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf
- PMAY-U 2.0 guidelines: https://pmay-urban.gov.in/guideline
- PMUY FAQ: https://www.pmuy.gov.in/faq.html
- National Scholarship Portal: https://scholarships.gov.in/All-Scholarships

**Decision:** retain all four as prototype-only screening rules pending a named human review and second approval. The PM-USP application window must not be shown as open based on a stale or conflicting date. This spot check does not validate the remaining 138 built-in catalogue-only records or the 4,693 third-party dataset rows.

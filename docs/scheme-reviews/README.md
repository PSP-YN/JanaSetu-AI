# Independent scheme-review packets

**Prepared:** 4 November 2026
**Status:** All four schemes remain pending human approval. The eligibility engine must continue to fail closed.

This folder contains four structured evidence packets and reviewer sign-off records. The JSON files are the source of truth for reviewer decisions; the Markdown files below are readable briefing sheets. The preparation work is AI-assisted and is not an independent approval, legal opinion or official eligibility determination.

## Packets

| Scheme | Brief | Structured packet | Primary issue |
|---|---|---|---|
| PM-KISAN | [Review brief](pm-kisan-review.md) | [JSON packet](pm-kisan.json) | 2020 guideline vs current portal notices, full exclusion matrix, land transfers and eKYC |
| PMAY-U 2.0 | [Review brief](pmay-u-2-review.md) | [JSON packet](pmay-u-2.json) | Four verticals, family/house definition, income bands, State/UT rules and April 2026 AHP SOP |
| PMUY 2.0 | [Review brief](pm-ujjwala-review.md) | [JSON packet](pm-ujjwala.json) | Current deprivation declaration, family composition, LPG/PNG restrictions and biometric eKYC |
| PM-USP CSSS | [Review brief](pm-usp-csss-review.md) | [JSON packet](pm-usp-csss.json) | AY 2026–27 renewal listing vs AY 2025–26 FAQ and fresh/renewal rule separation |

## Required reviewers

Each scheme needs two different people:
1. **Independent source reviewer:** qualified to locate and interpret the current primary notifications, guidelines, SOPs and amendments.
2. **Independent rule reviewer:** independently checks every implemented condition, omission, threshold, exception and test fixture against those sources.

One person must not fill both roles. Each reviewer must provide name, organization/qualification, review date, explicit approve/reject decision and evidence references. Any disagreement or missing evidence leaves the scheme pending.

## Approval gate

- Complete the source amendment audit and source hashes/versions.
- Complete the eligibility matrix and resolve every material gap.
- Execute all proposed boundary, unknown-answer, contradictory-fact and exception tests.
- Obtain both independent reviewer sign-offs.
- Update rule implementation only in a reviewed PR with tests.
- Keep the review status pending until the maintainer verifies both signed records and CI evidence.
- Any material source amendment resets approval to pending.

Do not use real citizen data during review. Use synthetic profiles. Do not set any packet to approved merely because the research or tests were prepared by an AI assistant.


## Current source reconciliation

- [Four-scheme source reconciliation (4 November 2026)](source-reconciliation-2026-11-04.md) records current official notices and unresolved source conflicts.

## Catalogue review artifacts — 4 November 2026

- `../catalogue-review-register.csv` contains all 138 built-in catalogue-only records, each exactly once, with review status and a specific human action. It distinguishes 96 Karnataka budget line-item leads from 42 official-source scheme references.
- `../smartduke-catalogue-audit.json` records a reproducible field-completeness audit for all 4,693 third-party rows.
- `../smartduke-record-review-queue.csv` contains the 4,306 third-party rows with one or more metadata quality flags.
- `../myscheme-data-access-request.md` is an unsent request template for an authorized official feed.

None of these artifacts upgrades a catalogue-only entry to an approved scheme.

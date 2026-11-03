# Scheme source and rule approval workflow

## Release rule

All records with `catalogueStatus: "rule-screened"` require `reviewStatus: "approved"`. Missing or pending status fails closed: the eligibility engine returns `needs_verification` without evaluating rules. Catalogue-only records never enter the eligibility engine.

## Two-person review

Each scheme must have two independent reviewers. One may be a scheme-domain researcher; the second must independently validate the source and every implemented condition. The same person cannot approve both roles.

Required evidence per scheme:
- Primary official URL and archived copy/reference where legally permitted.
- Notification/guideline/SOP identifier, publication date, effective date, amendment history and date checked.
- Jurisdiction, responsible department and official application route.
- Eligibility/exclusion matrix with exact source section/page.
- Boundary tests for inclusive/exclusive values, missing fields, contradictions and unknown answers.
- Benefit amount, frequency, application window and document list, each independently checked.
- Reviewer role, name/organization, date, source version/hash and explicit approve/reject decision.
- Retest evidence after any source amendment.

## Current scheme status

| Scheme | Rule engine status | Approval |
|---|---|---|
| PM-KISAN | Disabled pending review | Pending two independent human approvals |
| PMAY-U 2.0 | Disabled pending review | Pending two independent human approvals |
| PMUY 2.0 | Disabled pending review | Pending two independent human approvals |
| PM-USP CSSS | Disabled pending review | Pending two independent human approvals |

The four records are intentionally blocked. Prior spot checks found that the PM-USP CSSS renewal/application window had conflicting dates in official material. PM-KISAN and PMAY-U source amendments and PMUY current application conditions also need reconciliation. No record should be changed to approved based solely on this document or an AI review.

## Approval change procedure

1. Reviewer 1 and reviewer 2 complete a separate review record and test evidence.
2. A maintainer compares both records; disagreement keeps the scheme pending.
3. Update the scheme's source metadata and rule implementation in a reviewed PR.
4. Set `reviewStatus: "approved"` only in the same PR that includes both signed review records and tests.
5. CI must prove that pending schemes remain blocked and approved schemes only evaluate the reviewed version.
6. Any source version change or material amendment resets status to pending.

Do not collect real citizen data during review. Use synthetic profiles only.


## Per-scheme review records

Blank, versioned review records are maintained under `docs/scheme-reviews/` for PM-KISAN, PMAY-U 2.0, PMUY and PM-USP CSSS. Each record starts pending with two independent reviewer slots. Reviewers must attach evidence and complete the eligibility matrix before a maintainer can approve a rule version.


## Review packet refresh — 4 November 2026

The four structured review packets have been populated with:
- Official source URLs, issuing authority, publication/revision date where known, and date checked.
- A current-source evidence summary with an explicit distinction between live portal snapshots and historical guideline documents.
- A condition-by-condition comparison of the current implementation against the source.
- Material omissions and questions for the independent source and rule reviewers.
- Proposed boundary fixtures marked proposed_not_executed; they are not represented as passing tests.
- Two independent reviewer slots, both intentionally blank and pending.

Packet files:
- docs/scheme-reviews/pm-kisan.json
- docs/scheme-reviews/pmay-u-2.json
- docs/scheme-reviews/pm-ujjwala.json
- docs/scheme-reviews/pm-usp-csss.json

The 4 November refresh is partial. It does not claim exhaustive amendment research. Any disagreement, missing source, unverified condition or missing evidence keeps the scheme pending. No AI-generated assessment can fill either reviewer slot.

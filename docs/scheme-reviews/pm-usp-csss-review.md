# PM-USP CSSS — independent source and rule review

**Status:** Pending two independent human approvals  
**Source check:** 4 November 2026  
**Structured record:** [pm-usp-csss.json](pm-usp-csss.json)

## Primary evidence inspected

- [Live NSP scheme catalogue](https://scholarships.gov.in/All-Scholarships) — exact CSSS entry checked 4 November 2026.
- [CSSS specifications](https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf) — updated 7 February 2024 (as indicated by the filename).
- [PM-USP CSSS FAQ](https://scholarships.gov.in/public/schemeGuidelines/FAQ_DOHE_CSSS.pdf) — AY 2025–26.

## Current AY 2026–27 window — official portal conflict

The two live official NSP pages disagree:

| Official page | Student renewal deadline | Institute verification | DNO/SNO/MNO or L2 verification |
|---|---:|---:|---:|
| [All-Scholarships CSSS entry](https://scholarships.gov.in/All-Scholarships) | 30 September 2026 | 15 October 2026 | 30 October 2026 |
| [NSP Students announcements](https://scholarships.gov.in/Students) | 31 October 2026 | 15 November 2026 | 30 November 2026 |

Both entries label the dates as renewal dates. The Students page says renewal is currently open even though its student deadline had passed by 4 November 2026. The public portal page footer says last updated June 2026. This is an unresolved official-source conflict, not a date we can safely choose between.

**Do not show the application as open, do not show 30 November as the student deadline, and do not infer any fresh-application window.** Require a current authenticated NSP scheme record or written Ministry/NSP clarification.

## Rule facts from the AY 2025–26 FAQ — current-year confirmation required

Fresh application conditions in the FAQ include above the 80th percentile in the relevant stream from the Board, regular (not correspondence/distance) course, family income up to ₹4.5 lakh, no other scholarship or fee reimbursement, no diploma, and no drop after Class XII. The FAQ describes merit allocation by gender, stream and category, with 5% horizontal reservation for benchmark disabilities (40% or more).

Renewal requires at least 50% marks and 75% attendance, annual renewal, and a maximum duration not exceeding five years, subject to the stated conditions. The FAQ describes course-specific scholarship rates; verify the current-year specifications before showing rates.

## Current implementation gap

The prototype checks a student flag, percentile boolean, regular-course/diploma-distance booleans, annual income and other scholarship boolean. It does not distinguish fresh from renewal, capture the Class XII year or drop, verify the Board-specific list/quota, verify institution/course, capture renewal marks/attendance/prior award/year or enforce the five-year cap.

## Reviewer tasks

1. Obtain written NSP/Department of Higher Education clarification resolving the conflicting AY 2026–27 renewal deadlines.
2. Obtain current AY 2026–27 specifications and FAQ; the AY 2025–26 FAQ is not proof of unchanged current-year rules.
3. Verify fresh application status and deadline separately from renewal.
4. Validate Board-wise percentile lists, stream/category/gender allocation and disability reservation.
5. Validate course type, year of Class XII, drop rule, income evidence and scholarship overlap.
6. Create separate fresh and renewal rule packs and review all proposed fixtures in the JSON packet.

**Decision remains pending.** Do not use a renewal deadline as a fresh deadline or present a self-declared percentile as verified merit eligibility.

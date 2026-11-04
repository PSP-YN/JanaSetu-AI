# Scheme catalogue: data provenance and rule notes

**Access/review date:** 4 November 2026
**Scope:** 142 built-in records across four deterministic prototypes, 42 official-source scheme references and 96 Karnataka budget-derived leads, plus a 4,693-row third-party discovery snapshot.
**Coverage statement:** This is not a complete India-wide scheme catalogue. State and Union Territory profile selection is implemented; Karnataka has six state scheme references and 96 budget-derived leads, but comprehensive State/UT coverage is not loaded.

## 1. PM-KISAN Samman Nidhi

Official source: https://pmkisan.gov.in/
Operational guidelines: https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf

Rules represented:
- Income support scheme for landholding farmer families with cultivable land recorded by the relevant State/UT.
- Farmer family definition in the published operational guidelines: husband, wife and minor children.
- The portal describes ₹6,000 per year in three equal instalments through DBT, subject to eligibility.
- The scheme has exclusion categories. The prototype only asks a high-level exclusion question and does not encode or verify every statutory/operational exclusion.

Prototype status: **screening lead only**. State land records, complete exclusion criteria, eKYC and beneficiary status must be checked through the current official process.

## 2. PMAY-U 2.0

Official scheme guidelines (September 2024): https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf
Official portal: https://pmay-urban.gov.in/

Rules represented:
- Urban route for eligible EWS/LIG/MIG families.
- Published central income bands: EWS up to ₹3 lakh; LIG ₹3 lakh to ₹6 lakh; MIG ₹6 lakh to ₹9 lakh per annum. The guidelines provide State/UT flexibility to redefine EWS with Ministry concurrence.
- Beneficiary family should not own a pucca house in the name of the beneficiary or any family member anywhere in India, subject to the guideline definitions/provisions.
- A family allotted a house under a government housing scheme in the previous 20 years is excluded under the cited guideline provision.

Prototype status: **screening lead only**. The code screens only the urban route; it does not encode every vertical, special case, State/UT modification or subsequent amendment. Rural residents should check PMAY-G separately. Current ULB verification is required.

## 3. Pradhan Mantri Ujjwala Yojana 2.0

Official scheme page: https://pmuy.gov.in/ujjwala2.html
Official FAQ: https://www.pmuy.gov.in/faq.html

Rules represented:
- Applicant must be a woman aged 18 or above.
- No other LPG connection from an Oil Marketing Company should exist in the same household.
- Adult woman must belong to a poor household based on the prescribed deprivation declaration.
- The official page lists KYC, family-composition/ration-card evidence, address proof where required, bank details and the deprivation declaration.

Prototype status: **screening lead only**. The prototype does not collect Aadhaar or bank details, verify household LPG connections or establish the deprivation declaration. Use the official application channel for exact current requirements.

## 4. PM-USP Central Sector Scholarship for College and University Students (CSSS)

Official Ministry FAQ for AY 2025–26: https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/FAQs_PM_USP_CSSS_scheme_AY_2025_26.pdf
National Scholarship Portal: https://scholarships.gov.in/

Rules represented from the cited 2025–26 FAQ:
- Student is above the 80th percentile of successful candidates in the relevant stream from the Board.
- Student pursues a regular course, not correspondence/distance mode.
- Family income is up to ₹4.5 lakh per annum.
- Student is not receiving another scholarship or fee reimbursement.
- Diploma students are not eligible.

Prototype status: **academic-year verification required**. This code is not a claim that the 2025–26 rules, opening dates or fresh/renewal conditions apply unchanged in 2026–27. Current NSP notices and the relevant Board list must be checked before advising a student.

## Data handling rules

- Scheme sources are official government domains.
- Source access date is stored separately from scheme rule effective dates.
- Where the source's effective period is explicit, it is named (for example, PMAY-U 2.0 September 2024 guidelines and PM-USP AY 2025–26 FAQ).
- A source URL is not proof that the source has not changed. Scheduled re-verification and a change-review process are required for production.
- No generated rule, date, approval status or benefit amount may be added without a source.
- When evidence is absent or out of date, assessment must return `needs_verification`.

## Known catalogue gaps

- No full State/UT scheme coverage.
- No PMAY-Gramin logic.
- No PM-JAY beneficiary database integration.
- No scheme-window or budget availability synchronisation.
- No official identity, land-record, LPG-household, Board percentile or scholarship verification.
- No automated document OCR in this prototype.


## Catalogue expansion — 2 November 2026

The catalogue was expanded using the public National Scholarship Portal AY 2026–27 listing, Ministry/department pages, Government district portals and public government-hosted programme documents.

The built-in catalogue now contains 142 records: four Central records with deterministic prototype rules (all pending two independent human approvals), 42 official-source scheme references (catalogue-only), and 96 Karnataka FY 2026–27 budget-derived line-item leads (not confirmed citizen-facing schemes). The 138 catalogue-only records comprise the 42 scheme references plus 96 budget leads. The NSP landing-page records no longer carry a universal deadline; the current PM-USP CSSS sources conflict and require scheme-specific verification.

Specific caveats:
- PM-JAY eligibility is not checked against a beneficiary database.
- PMMVY category, pregnancy registration, antenatal care and claim conditions must be checked against current Ministry instructions.
- PMSBY and PMJJBY policy terms and premiums are subject to official revision.
- PMFBY depends on notified crop, location and season.
- Yuva Nidhi's linked Legislative Council source is a 2024 draft, not a current final notification.
- Gruha Jyothi's linked Government-hosted study is not a current ESCOM billing circular.
- Karnataka district pages do not establish complete State-wide coverage.


## Third-party open dataset attribution

- SmartDuke Technologies, *Indian Government Schemes Dataset 2026*, CC BY 4.0, Hugging Face. Snapshot: 5 July 2026. Dataset publisher says source: myScheme; structured parsing by SmartDuke Technologies. https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025
- Access path: Hugging Face Dataset Viewer API (public, paginated): https://datasets-server.huggingface.co
- Data fields are not official JanaSetu eligibility rules; no automatic screening is run on them.
- Dataset card warns users to verify scheme information at the official portal. Currentness, source URL accuracy and completeness are not guaranteed by JanaSetu.


## Official source refresh — 4 November 2026

The four rule-screened catalogue records were rechecked against official sources. Their sourceChecked metadata was updated to 2026-11-04. Their reviewStatus values remain pending; the eligibility engine continues to return needs_verification before evaluating any rule.

### PM-KISAN
- Operational Guidelines currently linked by the official portal are revised 29 March 2020. They contain the family definition, exclusion classes and land cut-off / succession provisions.
- The live portal snapshot checked 4 November 2026 reports the 24th instalment released on 30 October 2026, mandatory eKYC for registered farmers, and temporary withholding of suspected post-01.02.2019 land-acquisition / multiple-family-member cases pending physical verification.
- The official press-release index lists Cabinet approval to continue PM-KISAN from FY 2026–27 through FY 2030–31 with a ₹3.15 lakh crore outlay; no replacement eligibility guideline was identified in this pass.
- The 2020 guideline is not a complete current amendment register. A reviewer must reconcile later circulars and current portal instructions before any rule approval.

### PMAY-U 2.0
- The official guideline index checked 4 November 2026 lists the English/Hindi September 2024 PMAY-U 2.0 guidelines and the April 2026 AHP SOP.
- The guideline defines beneficiary family as husband, wife and unmarried sons/daughters; states central EWS/LIG/MIG annual household-income bands of up to ₹3 lakh, ₹3–6 lakh and ₹6–9 lakh; includes a State/UT EWS redefinition mechanism with Ministry concurrence; and states a 20-year prior government-housing allotment restriction.
- Parent housing-benefit prioritisation is a distinct clause and must not be collapsed into the 20-year disqualification. BLC, AHP, ARH and ISS need separate rule review.

### PMUY 2.0
- The 22 September 2025 PIB order approved 25 lakh additional deposit-free connections for FY 2025–26 and ₹2,050 per standard 14.2 kg connection (connection-cost support, not cash paid to the applicant); the 4 December 2025 PIB reply says eligibility was simplified to adult women from poor households based on a Deprivation Declaration.
- The homepage reports 2,442,525 of the 25 lakh connections released as at 23 September 2026. It lists ₹2,050 for 14.2 kg and ₹1,300 for 5 kg; About/FAQ still show legacy ₹1,600/₹1,150. The 14.2 kg amount is supported by the PIB order; the 5 kg amount and current new-application window require OMC confirmation.
- The PIB order also specifies ₹300 targeted subsidy for up to nine 14.2 kg refills in FY 2025–26. No FY 2026–27 extension was identified in this pass.
- Current pages describe adult woman aged 18+, no existing LPG connection in the household, simplified KYC and a Deprivation Declaration. The About page still displays the older category list; its current effect must be confirmed.
- The eKYC page describes face-based self-authentication with an OMC app and Aadhaar FaceRD. PIB says new consumers undergo biometric authentication before connection release; FAQ also describes distributor biometric authentication. Reconcile the exact sequence.
- Official documents include Aadhaar of applicant/adult family members and bank details. JanaSetu must not collect Aadhaar or bank documents.

### PM-USP CSSS
- The live NSP CSSS sources conflict: All-Scholarships lists renewal student applications through 30 September 2026, institute verification through 15 October and DNO/SNO/MNO through 30 October; the Students announcement lists student applications through 31 October, institute verification through 15 November and L2 through 30 November. The latter page still says “currently open” after the student deadline. No date is selected as authoritative.
- The linked specifications PDF is updated 7 February 2024. The detailed FAQ located is for AY 2025–26 and is not sufficient by itself to prove that fresh-application or renewal rules remain unchanged for AY 2026–27.
- Neither portal deadline must be presented as a fresh-application deadline. Fresh AY 2026–27 status is unresolved; obtain NSP/Ministry clarification.

The full source evidence, current code mapping, gaps, proposed boundary fixtures and unresolved questions are in the four JSON review packets under docs/scheme-reviews/. See [the 4 November source reconciliation](scheme-reviews/source-reconciliation-2026-11-04.md). These are prepared review materials, not signed human approvals.

# Scheme catalogue: data provenance and rule notes

**Access/review date:** 1 November 2026  
**Scope:** Four selected Central Government scheme references.  
**Coverage statement:** This is not a complete India-wide scheme catalogue. State and Union Territory profile selection is implemented; state-specific schemes are not yet loaded.

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

The expanded catalogue contains 46 records: four Central records with deterministic prototype rules (all pending two independent human approvals) and 42 additional source-indexed records. The 42 new records are catalogue-only: they do not run eligibility logic. NSP deadlines were recorded as they appeared on 2 November 2026 and must be rechecked before application.

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

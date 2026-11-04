# PMAY-U 2.0 — independent source and rule review

**Status:** Pending two independent human approvals  
**Source check:** 4 November 2026  
**Structured record:** [pmay-u-2.json](pmay-u-2.json)

## Primary evidence inspected

- [MoHUA official guideline index](https://pmay-urban.gov.in/guideline) — checked 4 November 2026; lists September 2024 PMAY-U 2.0 English/Hindi guidelines and an April 2026 AHP SOP.
- [PMAY-U 2.0 Scheme Guidelines, English](https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf) — September 2024.
- [Affordable Housing in Partnership SOP](https://pmay-urban.gov.in/uploads/guidelines/AHP-SOP.pdf) — April 2026; full 39-page PDF downloaded and text-extracted on 4 November 2026.
- [Angikaar 2026 Operational Guidelines](https://pmay-urban.gov.in/uploads/Angikaar-2026-Guidelines.pdf) — May 2026 outreach campaign guidance.

## Rule facts for reviewer verification

- Beneficiary family: husband, wife and unmarried sons and/or unmarried daughters.
- Eligible families live in urban areas and must not own a pucca house in the name of the beneficiary or any family member anywhere in India, subject to the guideline provisions.
- Central annual household income bands: EWS up to ₹3 lakh; LIG ₹3 lakh to ₹6 lakh; MIG ₹6 lakh to ₹9 lakh. States/UTs may redefine EWS with Ministry concurrence.
- The guideline states that families allotted a house under a Central/State/UT Government or local self-government housing scheme in the previous 20 years in urban or rural areas are not eligible. The parent-housing provision is a separate prioritisation rule and must not be collapsed into this disqualification.
- BLC, AHP, ARH and ISS are distinct verticals with component-specific requirements.

## Additional AHP SOP findings — April 2026

The full AHP SOP confirms the beneficiary application process is materially more involved than the prototype: family member Aadhaar/DOB/relationship/occupation details, Aadhaar OTP authentication, existing-house and income details, income-certificate upload, AHP project selection and active bank-account/IFSC details. One Aadhaar number can be used for only one application; the SOP says a married female applicant must provide her husband's Aadhaar details. JanaSetu must not collect Aadhaar, OTP, bank or document data.

The SOP says application submission does not create a right to benefits; approval depends on due diligence and competent-authority verification. It also contains an AHP prior-housing exclusion that must be reconciled against the master guideline's 20-year prior-allotment provision; the master scheme guidelines prevail in case of conflict. The SOP's five-year buy-back lock-in is a post-allotment rule, not a beneficiary eligibility criterion.

Angikaar 2026 ran from 4 May to 31 July 2026 and is an outreach/implementation campaign; it is not an amendment to the scheme's beneficiary eligibility rules.

## Current implementation gap

The prototype checks urban/rural residence, annual income up to ₹9 lakh, one pucca-house boolean and one prior-housing-benefit yes/no field. It does not capture the complete beneficiary family, urban-area residency proof, family-wide property ownership, State/UT EWS modifications, parent-benefit prioritisation, exact 20-year date calculation, or the vertical-specific conditions. The April 2026 AHP SOP has now been fully extracted, but the prototype still lacks its application and verification requirements. Current BLC, ARH and ISS implementation instructions and State/UT orders still require separate review.

## Reviewer tasks

1. Review BLC, ARH and ISS current operational instructions and identify every applicable State/UT implementation order; the AHP SOP has been extracted.
2. Verify family definition, house definition, property/ownership evidence and rural-house implications.
3. Confirm exact inclusive income boundaries and current State/UT EWS flexibility.
4. Distinguish prior allotment disqualification from parent-benefit prioritisation.
5. Confirm vertical-specific limits, land title, beneficiary contribution, project approval and loan/property conditions.
6. Review all proposed boundary fixtures in the JSON packet.

**Decision remains pending.** A generic urban/income/house screen is not sufficient to approve PMAY-U 2.0 eligibility.

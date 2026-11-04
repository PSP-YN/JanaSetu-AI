# PMUY 2.0 — independent source and rule review

**Status:** Pending two independent human approvals  
**Source check:** 4 November 2026  
**Structured record:** [pm-ujjwala.json](pm-ujjwala.json)

## Primary evidence inspected

- [PMUY 2.0 eligibility and application page](https://www.pmuy.gov.in/ujjwala2.html) — checked 4 November 2026; page does not state a revision date.
- [PMUY official FAQ](https://www.pmuy.gov.in/faq.html) — checked 4 November 2026; page does not state a revision date.
- [PMUY About page](https://www.pmuy.gov.in/about.html) — 25 lakh additional allocation and household categories.
- [PMUY face-based eKYC page](https://www.pmuy.gov.in/e-kyc.html).
- [PMUY live homepage](https://www.pmuy.gov.in/index.aspx) — connection progress and benefits.
- [Poor-household deprivation declaration](https://www.pmuy.gov.in/documents/Deprivation_Declaration_for_Poor_Households_English.pdf).

## Rule facts for reviewer verification

- Applicant must be an adult woman aged 18 or above.
- No other LPG connection from an OMC may exist in the same household; the FAQ ties this to family members listed in the family-composition document.
- Applicant must belong to a poor household based on the prescribed deprivation declaration. The declaration is the stated basic criterion; do not replace it with a guessed income threshold.
- The official process lists KYC, applicant Aadhaar, Aadhaar of adult family members in the family-composition document, address proof where required, ration card or other government family-composition proof, bank details and deprivation declaration. Prescribed migrant self-declarations are permitted for address and family composition.
- FAQ Q17 says biometric Aadhaar authentication is mandatory at the LPG distributor.
- FAQ Q31 states PNG connection holders cannot receive a PMUY connection or a non-PMUY subsidized LPG connection.
- FAQ Q3 lists the security-deposit-free connection components and free first refill(s)/two-burner stove; confirm current extension and benefit terms before publishing amounts or guarantees.

## Current source conflicts and operating status

- The About page states that an additional 25 lakh connections were approved and are being released; the homepage reports 2,442,525 released under that allocation as at 23 September 2026.
- The live homepage states cash assistance of ₹2,050 for a 14.2 kg connection and ₹1,300 for a 5 kg connection. The About page states ₹1,600 and ₹1,150 respectively. These official pages conflict; no single amount should be encoded or displayed until the governing order and OMC instructions are reconciled.
- The eKYC page describes face-based self-authentication using an OMC mobile app and Aadhaar FaceRD. FAQ Q17 separately describes biometric authentication at the distributor. The exact sequence and whether both are required must be confirmed.
- The current documents list includes Aadhaar of the applicant and adult family members, family-composition evidence and bank details. JanaSetu must not collect these data; users must complete the official OMC/CSC flow.

## Current implementation gap

The prototype checks woman/age, one household-LPG boolean and one deprivation-declaration boolean. It does not validate the current deprivation checklist, household membership, OMC connection records, PNG restriction, biometric eKYC, migrant documentation or KYC evidence.

## Reviewer tasks

1. Obtain the governing order for the 25 lakh extension and reconcile the official-page benefit-amount conflict.
2. Review the full deprivation declaration and all exclusion checklist items.
3. Validate family-composition and split/migrant household edge cases against current OMC instructions.
4. Confirm the eKYC and PNG restrictions and their effect on eligibility/routing.
5. Review the proposed fixtures in the JSON packet and specify how unknown facts must be handled.

Do not collect Aadhaar, bank details or document images in JanaSetu. Use the official OMC/distributor process for verification.

**Decision remains pending.**

# PMUY 2.0 — independent source and rule review

**Status:** Pending two independent human approvals  
**Source check:** 4 November 2026  
**Structured record:** [pm-ujjwala.json](pm-ujjwala.json)

## Primary evidence inspected

- [PMUY 2.0 eligibility and application page](https://www.pmuy.gov.in/ujjwala2.html) — checked 4 November 2026; page does not state a revision date.
- [PMUY official FAQ](https://www.pmuy.gov.in/faq.html) — checked 4 November 2026; page does not state a revision date.
- [Poor-household deprivation declaration](https://www.pmuy.gov.in/documents/Deprivation_Declaration_for_Poor_Households_English.pdf).

## Rule facts for reviewer verification

- Applicant must be an adult woman aged 18 or above.
- No other LPG connection from an OMC may exist in the same household; the FAQ ties this to family members listed in the family-composition document.
- Applicant must belong to a poor household based on the prescribed deprivation declaration. The declaration is the stated basic criterion; do not replace it with a guessed income threshold.
- The official process lists KYC, applicant Aadhaar, Aadhaar of adult family members in the family-composition document, address proof where required, ration card or other government family-composition proof, bank details and deprivation declaration. Prescribed migrant self-declarations are permitted for address and family composition.
- FAQ Q17 says biometric Aadhaar authentication is mandatory at the LPG distributor.
- FAQ Q31 states PNG connection holders cannot receive a PMUY connection or a non-PMUY subsidized LPG connection.
- FAQ Q3 lists the security-deposit-free connection components and free first refill(s)/two-burner stove; confirm current extension and benefit terms before publishing amounts or guarantees.

## Current implementation gap

The prototype checks woman/age, one household-LPG boolean and one deprivation-declaration boolean. It does not validate the current deprivation checklist, household membership, OMC connection records, PNG restriction, biometric eKYC, migrant documentation or KYC evidence.

## Reviewer tasks

1. Confirm the latest PMUY allocation/extension orders and current benefit terms.
2. Review the full deprivation declaration and all exclusion checklist items.
3. Validate family-composition and split/migrant household edge cases against current OMC instructions.
4. Confirm the eKYC and PNG restrictions and their effect on eligibility/routing.
5. Review the proposed fixtures in the JSON packet and specify how unknown facts must be handled.

Do not collect Aadhaar, bank details or document images in JanaSetu. Use the official OMC/distributor process for verification.

**Decision remains pending.**

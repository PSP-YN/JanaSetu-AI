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
- [PIB release, 22 September 2025](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=276350) — 25 lakh allocation, ₹2,050 standard connection support and simplified KYC/deprivation declaration process.
- [PIB written reply, 4 December 2025](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2198768&lang=1&reg=3) — simplified eligibility and FY 2025–26 targeted refill subsidy.
- [Poor-household deprivation declaration](https://www.pmuy.gov.in/documents/Deprivation_Declaration_for_Poor_Households_English.pdf).

## Rule facts for reviewer verification

- Applicant must be an adult woman aged 18 or above.
- No other LPG connection from an OMC may exist in the same household; the FAQ ties this to family members listed in the family-composition document.
- Applicant must belong to a poor household based on the prescribed deprivation declaration. The declaration is the stated basic criterion; do not replace it with a guessed income threshold.
- The official process lists KYC, applicant Aadhaar, Aadhaar of adult family members in the family-composition document, address proof where required, ration card or other government family-composition proof, bank details and deprivation declaration. Prescribed migrant self-declarations are permitted for address and family composition.
- FAQ Q17 says biometric Aadhaar authentication is mandatory at the LPG distributor.
- FAQ Q31 states PNG connection holders cannot receive a PMUY connection or a non-PMUY subsidized LPG connection.
- FAQ Q3 lists the security-deposit-free connection components and free first refill(s)/two-burner stove; confirm current extension and benefit terms before publishing amounts or guarantees.

## Current source reconciliation and operating status

- Government approved 25 lakh additional deposit-free connections for FY 2025–26. The 22 September 2025 PIB release confirms ₹2,050 per standard 14.2 kg connection for that allocation, covering connection components rather than a cash transfer to the applicant, and confirms a free first refill and stove. The live homepage lists ₹2,050 for 14.2 kg and ₹1,300 for 5 kg. The About/FAQ pages still show legacy ₹1,600/₹1,150 values. The 14.2 kg amount is reconciled for the 25 lakh allocation; the 5 kg amount still needs current OMC confirmation.
- The 4 December 2025 PIB reply says eligibility for the new allocation was simplified to adult women from poor households based on a Deprivation Declaration. The About page still lists older categories (SC/ST/PMAY-G/MBC/AAY/tea tribes/forest dwellers/islands/SECC/14-point declaration). Confirm how the older list applies to the current allocation; do not treat it as an exhaustive exclusion list without an order.
- The same PIB release confirms a ₹300 targeted refill subsidy for up to nine 14.2 kg refills during FY 2025–26 (pro-rated for 5 kg). No FY 2026–27 continuation order was located in this pass; do not show the subsidy as current.
- The eKYC page describes face-based self-authentication using an OMC app and Aadhaar FaceRD. PIB reporting says all new PMUY consumers undergo biometric authentication before release. FAQ Q17 separately describes biometric authentication at the distributor; confirm the exact sequence.
- The homepage reports 2,442,525 connections released under the 25 lakh allocation as at 23 September 2026. This does not establish that new applications are still open.
- Official documents include Aadhaar of applicant/adult family members and bank details. JanaSetu must not collect these data; applicants must use authorized OMC/CSC channels.

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

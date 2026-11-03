# PM-KISAN — independent source and rule review

**Status:** Pending two independent human approvals  
**Source check:** 4 November 2026  
**Structured record:** [pm-kisan.json](pm-kisan.json)

## Primary evidence inspected

- [Revised PM-KISAN Operational Guidelines](https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf) — revised 29 March 2020.
- [Live PM-KISAN portal](https://pmkisan.gov.in/) — checked 4 November 2026. It reports the 24th instalment released on 30 October 2026, states eKYC is mandatory, and flags suspected post-1 February 2019 land acquisitions / multiple family-member claims for temporary withholding pending physical verification.
- [Official FAQ](https://pmkisan.gov.in/Documents/RevisedFAQ.pdf).

The guideline PDF is historical relative to the live portal. It is not proof that all later circulars and operational instructions have been reconciled.

## Rule facts for reviewer verification

- Farmer family is husband, wife and minor children with cultivable land as per State/UT land records.
- Guideline benefit: ₹6,000 per year in three equal instalments, subject to exclusions.
- Exclusions include institutional landholders; specified constitutional/public representatives; specified serving/retired government employees subject to stated exceptions; pensioners with monthly pension of ₹10,000 or more subject to stated exceptions; persons who paid income tax in the last assessment year; specified registered practising professionals; and NRIs for new beneficiaries.
- Guidelines contain a 1 February 2019 land eligibility cut-off and specific inheritance-on-death / other transfer provisions.
- State/UT authorities identify and verify beneficiaries. The live portal says eKYC is mandatory and certain cases are held pending physical verification.

## Current implementation gap

The prototype checks an occupation keyword, a self-declared cultivable-land boolean and one generic exclusion declaration. It does not encode the statutory family definition, full exclusion classes and exceptions, land cut-off, succession/transfer cases, NRI condition, eKYC state, official land-record verification or beneficiary status. Occupation is not itself a sufficient statutory eligibility test.

## Reviewer tasks

1. Find every post-29 March 2020 circular, clarification, SOP and live portal instruction relevant to eligibility.
2. Resolve whether and how the 1 February 2019 cut-off applies today, including succession, partition, sale, gift and multiple family-member cases.
3. Validate every exclusion class and exception; define acceptable evidence and how unknown answers are handled.
4. Confirm current eKYC and State/UT verification process.
5. Review the six proposed boundary fixtures in the JSON packet and add missing edge cases.

**Decision remains pending.** Do not turn the generic self-declaration into an approval or rejection rule without full source reconciliation.

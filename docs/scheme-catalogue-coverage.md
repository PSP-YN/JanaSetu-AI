# Scheme catalogue coverage and source policy

**Catalogue review date:** 2 November 2026

## Current integrated catalogue

JanaSetu contains **46 source-linked scheme records**:
- **4 rule-screened Central records** with deterministic prototype checks: PM-KISAN, PMAY-U 2.0, PMUY 2.0 and PM-USP CSSS.
- **30 additional National Scholarship Portal records** from the AY 2026–27 public listing, including visible application-window dates as checked on 2 November 2026.
- **6 additional Central references**: AB-PMJAY, PMMVY 2.0, PMSBY, PMJJBY, PMFBY and MGNREGA.
- **6 Karnataka State references**: Shakti, Anna Bhagya, Gruha Lakshmi, Gruha Jyothi, Yuva Nidhi and CMKKY.

The breakdown is **4 rule-screened + 42 catalogue-only = 46**. The added 42 records are source-indexed; JanaSetu does not automatically decide eligibility for them. The catalogue is a starter set, not a complete India-wide directory. State-specific coverage outside Karnataka remains incomplete.

## NSP application-window snapshot

The National Scholarship Portal AY 2026–27 listing was accessed on 2 November 2026. Many student application entries showed a **30 November 2026** deadline; selected entries showed **15 November 2026**; some fresh applications were already shown closed on **31 October 2026**. PM-USP CSSS was shown as renewal-only in the live listing. These are point-in-time portal observations, not guarantees that an application window remains open. Recheck NSP and the scheme-specific Specifications/FAQ before advising a student.

## Official sources used

### National Scholarship Portal
- Live listing: https://scholarships.gov.in/All-Scholarships
- The portal exposes Central Sector, Centrally Sponsored and State Scheme filters. This import captures the scheme titles displayed in the retrieved AY 2026–27 listing; it is not a complete import of all NSP state-filter records.

### Central scheme sources
- PM-JAY beneficiary charter (National Health Authority): https://nha.gov.in/img/resources/Adhikar-Patra.pdf
- PMMVY (Ministry of Women & Child Development): https://www.wcd.gov.in/offerings/pradhan-mantri-matru-vandana-yojana
- PMSBY (Department of Financial Services): https://financialservices.gov.in/pmsby
- PMJJBY (Department of Financial Services): https://www.financialservices.gov.in/pmjjby
- PMFBY: https://pmfby.gov.in/faq
- MGNREGA Worker Portal: https://mnregaweb4.nic.in/netnrega/workers/wrkinfo.aspx?lang=en
- e-Shram scheme convergence overview, PIB release dated 2 February 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2222263&lang=1&reg=1

### Karnataka State sources
- Shakti: https://bengaluruurban.nic.in/en/scheme/shakti-scheme/
- Anna Bhagya: https://bengaluruurban.nic.in/en/scheme/anna-bhagya/
- Gruha Lakshmi: https://chamrajnagar.nic.in/en/welfareschemes/
- Gruha Jyothi policy study (Government-hosted): https://fpibengaluru.karnataka.gov.in/uploads/media_to_upload1762775113.pdf
- Yuva Nidhi draft guideline (Karnataka Legislative Council): https://kla.kar.nic.in/council/Replies/unstarred/19022024/usq403%2819022024%29.pdf
- CMKKY: https://bangalorerural.nic.in/en/district-skill-development-office-2/

## Coverage and ingestion policy

- Central scheme information, State/UT schemes and portal-wide listings must be ingested from a source with clear public access and permissible reuse, or through an authorized feed/API.
- The myScheme Terms of Use restrict automated access and copying without express written authorization: https://search.myscheme.gov.in/terms-of-use. JanaSetu does not bulk-copy the myScheme catalogue without permission.
- Request approved catalogue access through NeGD/myScheme and API Setu: https://apisetu.gov.in/. Contact: support-myscheme@digitalindia.gov.in.
- Official myScheme live counts are portal-reported totals, not JanaSetu coverage. Never use the myScheme total as the number of records in this app.
- Do not assume that a State/UT picker means that State/UT's schemes have been ingested.

## Record quality requirements

Every record should preserve the exact scheme title, source/jurisdiction, State/UT applicability, department, category, official information URL, separate application URL where available, source period/date checked, benefits, audience, documents and a verification status.

rule-screened means deterministic eligibility checks exist in the app and are linked to the stated source. catalogue-only means the app can help a citizen discover the scheme and reach an official source, but it does not return a personalized eligibility assessment for that record. Missing or ambiguous rules must never be treated as false.

## Source-specific limitations

- NSP deadlines are a snapshot checked 2 November 2026; dates can change and some listed fresh applications were already closed.
- PM-USP CSSS current AY 2026–27 fresh/renewal rules must be confirmed; the existing rule summary references the AY 2025–26 FAQ.
- Yuva Nidhi source is explicitly a 2024 draft. Its older batch dates must not be treated as current eligibility rules.
- Gruha Jyothi source is a Government-hosted policy study, not a current ESCOM billing circular. Confirm current household entitlement with the electricity provider.
- Karnataka district portals provide scheme summaries, not full State-wide catalogue coverage.
- PMFBY depends on notified crop, area and season. A national FAQ cannot establish an individual farmer's eligibility.
- Insurance premiums and policy terms can change; the live DFS policy and participating bank/post office control.

## Remaining work

1. Obtain an authorized myScheme/NeGD feed or API Setu access for a comprehensive national catalogue.
2. Onboard each State/UT through official datasets or department-reviewed source registers.
3. Import more Central schemes from original ministry pages.
4. Add machine translation with original text, engine/version, human-review status and translation date; do not treat translated summaries as rule sources.
5. Add deterministic rule packs only after current scheme guidelines are reviewed and versioned.
6. Introduce scheduled source checks and human review before presenting changed benefits, rules or deadlines.


## Open-data expansion — Karnataka FY 2026–27 budget leads

On 2 November 2026, JanaSetu added 96 Karnataka budget-derived discovery leads from the published CC BY 4.0 derived dataset in [urbanmorph/schemes](https://github.com/urbanmorph/schemes). The underlying budget documents are linked directly from the Government of Karnataka Finance Department:

- Child Budget: https://finance.karnataka.gov.in/uploads/CB2026-27_1772789054.pdf
- Gender Budget: https://finance.karnataka.gov.in/uploads/GB2026-27_1772789013.pdf
- SCSP/TSP allocations: https://finance.karnataka.gov.in/uploads/SCSPTSP2026-27_1772789239.pdf

The source register reports a 2026–27 budget snapshot and a model-generated classifier. Its README and methodology disclose that the classification labels were not human-reviewed. The 96 records are therefore displayed as **budget-derived discovery leads**, not confirmed citizen schemes. A budget head can fund an institution, programme or transfer; the allocation is not an individual benefit amount. JanaSetu does not infer eligibility, application windows or application URLs from these records.

Dataset attribution: Urban Morph, [schemes](https://github.com/urbanmorph/schemes), derived data CC BY 4.0. Code in that repository is MIT. Original Karnataka budget documents remain attributable to the Government of Karnataka. Dataset snapshot: FY 2026–27; classification build: 1 November 2026.

Current catalogue breakdown after this import: **142 records = 4 rule-screened + 138 catalogue-only**, including 96 Karnataka budget-derived leads. This is not a complete national catalogue. The budget import does not use or reproduce the myScheme-derived files in that repository.


## CC BY 4.0 external catalogue source

JanaSetu Discover integrates paginated keyword search over the Hugging Face Dataset Viewer for [SmartDuke Technologies' Indian Government Schemes Dataset 2026](https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025), license CC BY 4.0. The dataset card states 4,693 records and a July 2026 snapshot, with original source myScheme and structured parsing by SmartDuke Technologies. This source is third-party, machine-parsed and not independently verified by JanaSetu. Imported records remain catalogue-only. The parser's age, gender, caste, income, BPL, disability and state fields are intentionally not used by the eligibility evaluator. Each record links to the scheme URL supplied by the dataset; verify it before applying.

The app proxies requests through `/api/schemes/open-data`, requests up to 50 rows at a time from the Hugging Face Dataset Viewer, caches responses for one hour, and allows keyword search and pagination. This is an external dependency, not a locally mirrored/offline catalogue. If it is unavailable, the local catalogue and official myScheme link remain accessible.

**Attribution:** SmartDuke Technologies, *Indian Government Schemes Dataset 2026*, CC BY 4.0, Hugging Face. Source snapshot: 5 July 2026. https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025

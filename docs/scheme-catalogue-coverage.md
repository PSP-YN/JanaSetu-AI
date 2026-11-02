# Scheme catalogue coverage and source policy

## Current state

The in-app demo catalogue contains **4 curated Central Government scheme records**. It is not a complete Central or State/UT database. State selection currently supports citizen profile context; it does not imply state-specific scheme coverage.

The official myScheme search portal currently reports more than 5,100 schemes (Central and State/UT combined): https://search.myscheme.gov.in/. Its records, eligibility text, application URLs and currentness are maintained by government departments and the portal.

## Why we do not scrape myScheme

The official myScheme Terms of Use prohibit automated software/scraper access to monitor or copy pages unless the platform expressly authorizes it: https://search.myscheme.gov.in/terms-of-use. JanaSetu must not scrape, clone, or bulk-copy that catalogue without written permission or an approved API/data-sharing arrangement.

## Production catalogue strategy

1. Seek an authorized feed/API or partnership with NeGD/myScheme, relevant ministries and State/UT departments.
2. Until access is approved, use manually curated, publicly linked records under verified reuse terms.
3. Each record must include: scheme ID/name, level (Central/State/UT), State/UT applicability, ministry/department, official detail URL, official application URL, language/source version, benefit text, eligibility text, required documents, source date, last-checked date, and review status.
4. Keep original official text, translator/version metadata and a human-reviewed translation separate from rule logic.
5. Do not automatically infer eligibility from incomplete rule text. Rules should be deterministic, versioned, provenance-linked and return “unknown / needs review” when facts are missing.
6. Flag expired, stale or contradictory records; do not silently remove records or claim they are current.
7. Provide a “view official source” action for every scheme and a visible source freshness date.

## Suggested release tiers

- Tier 0 (hackathon): four validated central records plus link to official myScheme.
- Tier 1: curated central schemes by category with verified dates and human review.
- Tier 2: State/UT catalogues onboarded via authorized data source and department review.
- Tier 3: partner-backed continuous updates, alerting, translation review, and versioned eligibility rules.

## UX requirement

When a user searches a State/UT that has not been curated, show: “We have not verified this State/UT catalogue yet. Search the official myScheme portal and State department site.” Never show an empty result as “no benefits available.”

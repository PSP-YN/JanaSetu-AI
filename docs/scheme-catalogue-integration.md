# Scheme catalogue integration plan (India-wide)

## Scope and source-of-truth

JanaSetu must cover Central Government schemes and schemes from all 28 States and 8 Union Territories. Do not represent the existing four curated demo records as complete coverage.

**Primary source:** myScheme (NeGD / MeitY), which reports a catalogue of 5,140+ schemes (approximately 740 Central and 4,390 State/UT entries at the time this plan was written). Counts change; display a timestamped source count rather than hard-coding it as a permanent fact.

myScheme Terms of Use prohibit automated bots/scrapers/copying of pages unless myScheme expressly authorizes it in writing. Do not run a scraper against myScheme pages or copy its catalogue into JanaSetu without permission.

## Recommended integration

1. Contact myScheme / NeGD and request written permission and API Setu access for scheme catalogue integration:
   - Email: support-myscheme@digitalindia.gov.in
   - API Setu: https://apisetu.gov.in/
   - myScheme portal: https://www.myscheme.gov.in/
2. Ask for the approved API specification, access process, allowed caching, redistribution/translation rights, attribution requirements, update cadence, and change/deprecation notices.
3. Use the approved API or authorized export only. Keep the source record ID, official scheme URL, jurisdiction, issuing ministry/department, source update timestamp, and ingestion timestamp.
4. Create a scheduled ingestion pipeline only after access is granted. Validate schema, deduplicate by stable source ID, detect removed/changed records, retain audit history, and alert on malformed or stale data.
5. Translate titles/summaries as convenience text, not as a replacement for source wording. Clearly label machine translation and keep official source links prominent.
6. Keep eligibility evaluation conservative: missing or ambiguous criteria = UNKNOWN; never infer a final eligibility decision from a summary or AI translation.
7. Show users the data freshness timestamp and route them to the official source to verify eligibility, documents, application window, and final submission.

## Suggested normalized record

```ts
type SchemeRecord = {
  source: "myScheme";
  sourceId: string;
  slug?: string;
  name: string;
  officialUrl: string;
  jurisdiction: "central" | "state" | "ut";
  statesOrUTs: string[]; // "ALL" for central all-India schemes
  ministryOrDepartment?: string;
  category?: string;
  summary?: string;
  eligibilitySourceUrl?: string;
  sourceUpdatedAt?: string;
  ingestedAt: string;
  translationStatus: "official" | "machine" | "not-translated";
  verificationStatus: "source-linked" | "reviewed" | "stale" | "needs-review";
};
```

## Fallback while API access is pending

- Link to myScheme's official discovery portal and allow users to choose Central vs State/UT.
- Keep the current four local demo records clearly labelled as a small sample.
- Do not show a fake “all schemes” total or claim complete State/UT coverage.
- Use data.gov.in only for relevant datasets that actually contain scheme information and carry the applicable Government Open Data License; do not assume it contains a complete scheme catalogue.
- Avoid third-party mirrored APIs unless license, provenance, freshness, and redistribution rights are independently verified.

## Source links

- myScheme: https://www.myscheme.gov.in/
- myScheme Terms: https://search.myscheme.gov.in/terms-of-use
- myScheme FAQ: https://www.myscheme.gov.in/faqs
- API Setu: https://apisetu.gov.in/
- Open Government Data India: https://data.gov.in/

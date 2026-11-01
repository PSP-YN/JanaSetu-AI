# JanaSetu — three-minute demonstration script

## Demo setup

Use the built-in synthetic household profile. Do not enter real personal data or upload real identity documents.

Synthetic profile:
- Name: Ananya Rao
- Age: 34
- State: Karnataka
- District: Mysuru
- Residence: Urban
- Annual household income: ₹1,50,000
- Occupation: Farmer
- Cultivable land declared in State records: Yes
- Existing household LPG: No
- Poor-household declaration: Can provide
- Pucca house: No
- Previous government housing allotment in last 20 years: No

This profile is a test fixture, not a representation of a real beneficiary.

## Run of show

### 0:00–0:25 — Explain the gap
“Scheme discovery is important, but a citizen still has to translate rules into evidence, collect documents and manage follow-ups. JanaSetu focuses on that bridge.”

### 0:25–0:55 — Create a profile
Open the profile. Use the sample household. Show that the profile can select any State/UT, not only one region. Switch briefly to Hindi, then back to English.

### 0:55–1:25 — Run the agent
Run the benefits assessment. Open the execution trace. Explain the planner, catalogue retrieval, deterministic rule evaluation, evidence links and next-action generation.

### 1:25–2:05 — Inspect evidence
Open PMUY and PMAY-U 2.0 details. Show matched, not-matched and unknown conditions. Emphasize that a preliminary screen is not an official decision. Open the official source link.

### 2:05–2:35 — Prepare a draft
Prepare a draft for a potential pathway. Show its source, open checks and “Not submitted” boundary.

### 2:35–3:00 — Persistence and trust
Add a follow-up reminder. Refresh the page or navigate away and back to show browser-local persistence. Close with: “JanaSetu doesn't replace government portals. It prepares citizens to use them with clearer evidence and next steps.”

## Claims to avoid

- Do not say the current catalogue contains every Indian scheme.
- Do not say a citizen is officially eligible or approved.
- Do not say the prototype reads document contents; file references only are stored.
- Do not say an application is submitted.
- Do not claim the current prototype uses an LLM or external government API.
- Do not report measured accuracy, hours saved or citizen impact without a completed evaluation.

## Suggested measurable pilot evaluation

Use a held-out, source-reviewed test set:
- Rule-level precision/recall on synthetic cases reviewed by a scheme-domain expert.
- Percentage of non-unknown results with a source and rule reference.
- Missing-evidence detection accuracy.
- Completion rate for the full profile → assessment → draft → reminder journey.
- Recovery rate after invalid or missing profile values.

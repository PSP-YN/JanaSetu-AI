# JanaSetu eligibility rule-set contract

## Purpose

The eligibility engine is deterministic and version-bound. It consumes only a scheme version that is published and independently approved, and a structured rule set that has passed the same review process. It does not infer missing legal criteria from prose, use an LLM to decide eligibility, or treat a catalogue record as an approved scheme.

## Rule-set version 1

The top-level JSON object must contain:

- `schemaVersion: 1`
- `state: "approved"`
- `rules`: 1–100 independently reviewed conjunctive checks
- optional `application`: reviewed field mappings and a document checklist

Each rule contains:

- `key`: unique lowercase stable identifier
- `label`: citizen-readable criterion
- `profileField`: one exact allowlisted `CitizenProfile` field
- `operator`: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `is_true` or `is_false`
- `expected`: scalar for comparison operators, array for `in` / `not_in`
- `reviewStatus: "approved"`
- `evidence`: official HTTPS `sourceUrl`, `sourceCheckedAt`, SHA-256 `sourceHash`, and a short `excerpt`

All rules are interpreted as AND conditions. Do not encode an incomplete eligibility clause as a negative rule. If a condition depends on an uncollected document, an official database check, a department decision, an unencoded exclusion, or a current notification not yet reviewed, represent it as a follow-up/unknown condition and keep the scheme version from being published until the rule is complete.

The engine marks a rule unknown when the citizen has not supplied the required value or the evidence is older than 90 days. One failed conjunct yields `not_matched`; all matched yields only `potential_match`, never a final government eligibility decision.

## Application field mappings

A mapping contains `key`, `label`, `profileField`, `required`, and `type` (`text`, `number`, `boolean`). Optional validation constraints are `maxLength`, `min`, `max` and `allowedValues`.

The server maps only existing allowlisted citizen profile fields. Every generated field is marked `requiresCitizenConfirmation: true`. Missing required fields or type/range failures block preparation. The output remains `not_submitted` and requires a citizen review action.

Never add Aadhaar numbers, bank account numbers, IFSC, passwords, PINs, OTPs, biometric values or identity-proofing secrets to the citizen profile or this mapping contract. If an official portal requires them, the citizen must enter them directly in that official channel unless a separately authorised and legally reviewed delegated API explicitly supports the data flow.

The optional `application.documents` value is an array of citizen-readable checklist strings. It is not proof that a document was uploaded, scanned, accepted or submitted.

## Review and publication

The scheme review workflow still requires:

1. Two distinct source-accuracy approvals.
2. Two distinct eligibility-rule-accuracy approvals.
3. One legal approval.
4. A separate publisher action by a user who did not review that scheme version.

The structured rule-set must be included in the immutable scheme-version content hash before approval. Editing rules creates a new scheme version and requires fresh reviews.

## Current data status

The four database seed records (PM-KISAN, PMAY-U 2.0, PMUY 2.0 and PM-USP CSSS) still contain draft rule notes and are `review_pending`. They do not yet satisfy this schema. No current scheme can return an automated potential-match assessment or create a preparation case. This is intentional: no rule is promoted from draft notes into a verified machine rule without evidence and independent approval.

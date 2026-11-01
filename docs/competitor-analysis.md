# Competitor and ecosystem analysis

**Research cutoff:** 1 November 2026. Public product descriptions and platform counts can change; always recheck before external publication.

## 1. myScheme — closest direct comparator

Official URL: https://www.myscheme.gov.in/

What it already does:
- National platform for discovery across Central and State/UT Government schemes.
- Personalized search based on demographic and other profile attributes.
- Scheme pages include eligibility, benefits, application procedures and document requirements.
- The official FAQ reports more than 4,700 Central and State/UT schemes and content in 15 languages.
- It describes a voice-enabled, multilingual AI chatbot.
- The FAQ says users are currently redirected to the concerned Ministry/Department application page rather than completing the application inside myScheme.

Implication for JanaSetu:
- Do not claim to invent national scheme discovery, multilingual access, eligibility questionnaires or a government-scheme chatbot.
- Differentiate through an inspectable rule-to-evidence graph, explicit unknown states, cross-scheme reuse of citizen-supplied evidence, readiness checklists, local draft records and persistent follow-up workflow.
- Treat myScheme as a primary source/discovery destination and potential integration partner, not an enemy to replace.

## 2. UMANG — broad government-service gateway

Official URL: https://web.umang.gov.in/

UMANG is a national government-service gateway with web and mobile access to Central and State services, schemes, documents, notifications and transactions. A PIB release dated 12 August 2026 reported approximately 2,575 services across 240 government departments as of 31 July 2026, including 880 Central and 1,695 State services.

Implication:
- Do not claim there is no single window for government services.
- JanaSetu focuses on the decision and preparation layer across a citizen's benefit journey, while official transactions remain on the authorised destination.
- Where useful, direct citizens to UMANG for the relevant official service.

## 3. DigiLocker — document infrastructure

Official URL: https://www.digilocker.gov.in/

DigiLocker provides digital document issuance, storage and access as part of India's Digital Public Infrastructure. It is an adjacent capability rather than a like-for-like benefits discovery product.

Implication:
- JanaSetu should not copy or replace document custody.
- A production version should explore consent-based document retrieval through authorised interfaces, with a clear record of provenance and user-controlled sharing.
- The prototype only records local file metadata; it does not parse, upload or retain document contents.

## 4. Common Service Centres — assisted access channel

Official locator: https://locator.csccloud.in/

CSCs provide assisted access to digital services. They are an important last-mile channel, not simply a software competitor.

Implication:
- JanaSetu can prepare a clearer checklist for citizens and assisted-service workers.
- A responsible product should preserve assisted and offline pathways rather than assume smartphone-only access.

## 5. Kisan e-Mitra — direct, scheme-specific AI assistant

Official programme context: https://socialprotectionai.org/use-case/IND-001

Kisan e-Mitra is an operational voice/text AI assistant for PM-KISAN. Public programme documentation describes beneficiary-specific query handling, application/payment/ineligibility information, multilingual voice support and integration with Bhashini. It is a meaningful direct comparator for farmer-facing assistance, not merely a generic chatbot.

Implication:
- JanaSetu must not claim to be India's first multilingual welfare chatbot or the first AI assistant for farmers.
- A defensible product wedge is cross-scheme and cross-department readiness, reusable evidence, rule-level provenance, unresolved-condition tracking and assisted case continuity.
- For PM-KISAN, JanaSetu should link to and complement official Kisan e-Mitra rather than duplicate beneficiary-status services.

## 6. Doot — emerging citizen-agent concept

Public product site: https://digidoot.in/

Doot describes a personal AI agent for Indian citizens, with voice-first multilingual interaction, a citizen-controlled digital representative, civic-service navigation and a multi-layer architecture around India's Digital Public Infrastructure. Its public site presents an ambitious product vision; the exact production status and live service integrations should be independently verified.

Implication:
- The broad idea of a personal agent for Indian citizens is not unique to JanaSetu.
- Do not position JanaSetu as the only citizen-facing civic agent.
- Differentiate on a narrower, measurable operational wedge: a versioned benefit-readiness graph that can be audited by a citizen or assisted worker, and a case workflow that records evidence gaps and follow-ups across multiple schemes.

## 7. Prabodhini — conversational welfare-access research

Research paper: https://aclanthology.org/2025.hcinlp-1.6/

A 2025 ACL workshop paper reports a small task-based comparison involving myScheme and Prabodhini, a voice-based conversational prototype using generative AI and RAG. The study involved 15 low-income participants. This is research evidence for the value of conversational public-service interfaces, not evidence of a scaled commercial competitor.

Implication:
- Conversational UX is a useful accessibility modality, not JanaSetu's defensible moat.
- Validate actual task completion and comprehension with citizens rather than relying on the presence of voice or AI as an innovation claim.

## 8. Bhashini — language infrastructure

Official URL: https://bhashini.gov.in/

Bhashini provides language technology and services such as speech, translation and document processing. It is infrastructure and an integration dependency, not a direct welfare-navigation competitor.

Implication:
- Integrate a supported language service where consent, cost, data handling and availability are acceptable.
- Do not claim six-language browser speech as equivalent to 22-language production voice support.

## 9. State portals and departmental systems

States maintain their own service portals, eligibility workflows and application destinations. Rules, implementation details and windows may differ by State/UT and may be amended independently.

Implication:
- State-specific rule packs must be versioned and sourced to the relevant department.
- A national user profile does not imply a complete national catalogue.
- The current prototype accepts all 28 States and 8 Union Territories, but its four rule-coded records are Central schemes only.

## Positioning matrix

| Capability | myScheme | UMANG | Kisan e-Mitra | Doot (public positioning) | JanaSetu prototype |
|---|---|---|---|---|
| Central + State/UT discovery | Yes | Service/scheme gateway | No | Limited curated Central catalogue |
| Multilingual access | 15 languages reported | Multiple access modes and languages | Multiple language/issuer contexts | English, Hindi, Kannada, Tamil, Telugu, Malayalam UI |
| Eligibility questions | Yes | Varies by service | Not its core function | Deterministic prototype rules |
| Rule-to-profile evidence trail | Not claimed as a core user-facing graph in public FAQ | Not claimed as a core feature | Document provenance, not scheme rule mapping | Yes, condition-level checks |
| Draft preparation and readiness state | FAQ says redirects to department application page | Service-specific transaction workflows | Document access/sharing | Local draft and checklist |
| Persistent cross-scheme task memory | Not stated in public FAQ | User/account service features vary | Not its core function | Browser-local prototype only |
| Government submission | Redirects to responsible portal per FAQ | Many services are available directly; varies by service | Not its core function | No submission |

## Additional adjacent ecosystem

- **Common Service Centres / State service portals:** Assisted delivery channels and official transaction endpoints. They are potential partners and distribution channels, not just competitors.
- **Bhashini:** Language infrastructure that can support a production voice layer.
- **DigiLocker:** Document infrastructure that could be integrated with explicit consent; JanaSetu should not become another document wallet.
- **Academic prototypes such as Prabodhini:** Useful UX evidence, but not proof of scaled market adoption.

## Defensible differentiation statement

JanaSetu should not compete head-on with myScheme's catalogue scale, UMANG's transaction breadth, Kisan e-Mitra's PM-KISAN beneficiary support, or Doot's broad citizen-agent vision. Its proposed wedge is an auditable, cross-scheme readiness case file: versioned rule → citizen fact/document → confidence/unknown → missing proof → next action → follow-up, with a human approval boundary. The current prototype implements only a small subset of this wedge; reusable evidence across multiple schemes, authenticated case continuity and assisted-worker workflows remain roadmap items.

## Sources

- myScheme FAQs: https://www.myscheme.gov.in/faqs
- myScheme platform: https://www.myscheme.gov.in/
- UMANG: https://web.umang.gov.in/
- PIB, “Government Expands Citizen-Centric Digital Public Service Delivery through UMANG and DigiLocker”, 12 August 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298116&lang=1&reg=1
- DigiLocker: https://www.digilocker.gov.in/
- CSC locator: https://locator.csccloud.in/


## Research caveats

- myScheme's live site displayed 5,140+ schemes (740+ Central and 4,390+ State/UT) during the 2 November 2026 review. The public FAQ separately reports 4,700+ and 15 languages. Counts are live and may change; cite the access date and exact page when used.
- myScheme's public FAQ explicitly describes multilingual AI chat and says the current application journey redirects users to department portals. Therefore, "myScheme has no AI" and "myScheme has no documents/eligibility" are false claims.
- Doot's website is a public product-positioning source, not independent proof of production scale or verified API integrations.
- Kisan e-Mitra's scale/capabilities should be attributed to its cited programme documentation and not represented as an independent audit.
- The Prabodhini paper reports a 15-participant study; it does not establish market size or national deployment.

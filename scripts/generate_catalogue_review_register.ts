import { writeFileSync } from "node:fs";
import { SCHEMES, type Scheme } from "../lib/catalog";

const records = SCHEMES.filter((scheme) => scheme.catalogueStatus === "catalogue-only");
const normalizeName = (name: string) => name.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const nameCounts = new Map<string, number>();
for (const scheme of records) nameCounts.set(normalizeName(scheme.name), (nameCounts.get(normalizeName(scheme.name)) || 0) + 1);

function classify(scheme: Scheme) {
  if (scheme.recordKind === "budget-line-item-lead" || scheme.id.startsWith("ka-budget-")) {
    return {
      group: "Karnataka budget line-item lead",
      recordKind: "budget-line-item-lead",
      status: "not_verified_as_citizen_scheme",
      issue: "A budget head is not proof of a standalone citizen-facing scheme. The upstream classifier is model-generated and was not human-reviewed.",
      action: "Locate the owning department's current government order and scheme page. Confirm this is a citizen-facing scheme rather than an administrative head, CSS share, transfer or component. Verify active status, beneficiary, benefit, documents and application route; otherwise retain only as a budget reference."
    };
  }
  if (scheme.sourceUrl.includes("scholarships.gov.in/All-Scholarships")) {
    return {
      group: "National Scholarship Portal listing entry",
      recordKind: "scheme-reference",
      status: "needs_scheme_specific_guideline",
      issue: "The record links only to the generic NSP listing, not its own scheme specification, FAQ or current-year application notice.",
      action: "Open the exact AY 2026–27 NSP entry. Capture the scheme-specific specifications, current FAQ, fresh/renewal status, deadlines, issuer and application route. Verify that the scheme remains active and that the exact title matches the record."
    };
  }
  if (scheme.id.startsWith("karnataka-")) {
    const special: Record<string, string> = {
      "karnataka-shakti": "Obtain the current State Government order and KSRTC/BMTC operating circular; verify eligible women, Karnataka residence rules, route/vehicle exclusions and statewide applicability.",
      "karnataka-anna-bhagya": "Obtain the current Food and Civil Supplies Department order; verify AAY/PHH/NPHH distinctions, quantity, additional-rice or DBT mode, current rates and ration-card rules.",
      "karnataka-gruha-lakshmi": "Obtain the current Women and Child Development Department government order and official service instructions; verify household head definition, exclusions, amount, payment status and statewide scope.",
      "karnataka-gruha-jyothi": "Replace the policy-study citation with the current Energy Department/ESCOM circular and service portal; verify domestic connection conditions, consumption threshold, billing period, arrears and exclusions.",
      "karnataka-yuva-nidhi": "The linked Legislative Council reply is a 2024 draft-era reference. Obtain the final/current order and Seva Sindhu instructions; verify batch, qualification, unemployment period, exclusions, payment duration and active registration window.",
      "karnataka-cm-kk-y": "Obtain the current Skill Development Department order and official CMKKY/Kaushalya Karnataka page; verify eligible courses, age/residence, training providers, stipend and current intake."
    };
    return {
      group: "Karnataka State scheme reference",
      recordKind: "scheme-reference",
      status: "needs_current_state_order",
      issue: "The current record's source is a district summary, policy study or draft-era reference; a current State-level scheme order and exact service page are not consistently present.",
      action: special[scheme.id] || "Obtain the current State Government order and implementing-department service page; verify active status, statewide scope, eligibility, benefits, documents and application route."
    };
  }
  return {
    group: "Central Government scheme reference",
    recordKind: "scheme-reference",
    status: "needs_current_scheme_source_review",
    issue: "A source link is present, but this record has not received a complete current-notification, amendment, deadline and implementation review.",
    action: "Check the current issuing-ministry notification/guidelines, amendments, eligibility, benefits, documents, application route and current open/closed status. Replace a generic FAQ/portal landing page with the most specific primary source available."
  };
}

const headers = ["scheme_id","scheme_name","record_group","record_kind","jurisdiction","geography","category","department","source_name","source_url","source_period","source_checked","review_status","source_quality_issue","required_reviewer_action","duplicate_name_group","source_reviewer_1","rule_reviewer_2","decision","decision_date","review_evidence"];
const esc = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const rows = records.map((scheme) => {
  const c = classify(scheme);
  const normalized = normalizeName(scheme.name);
  return [scheme.id,scheme.name,c.group,c.recordKind,scheme.jurisdiction || "",scheme.geography,scheme.category,scheme.ministry,scheme.sourceName,scheme.sourceUrl,scheme.sourcePeriod,scheme.sourceChecked,"pending",c.issue,c.action,nameCounts.get(normalized)! > 1 ? normalized : "","","","pending","",""];
});
if (records.length !== 138) throw new Error(`Expected 138 catalogue-only records; found ${records.length}`);
const counts = Object.fromEntries(Array.from(new Set(rows.map((row) => String(row[2])))).map((group) => [group, rows.filter((row) => row[2] === group).length]));
if (counts["Karnataka budget line-item lead"] !== 96 || counts["National Scholarship Portal listing entry"] !== 30 || counts["Karnataka State scheme reference"] !== 6 || counts["Central Government scheme reference"] !== 6) {
  throw new Error(`Unexpected catalogue triage distribution: ${JSON.stringify(counts)}`);
}
writeFileSync("docs/catalogue-review-register.csv", [headers, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n");
console.log(JSON.stringify({ total: records.length, groups: counts, duplicateNameGroups: Array.from(nameCounts.entries()).filter(([, count]) => count > 1).map(([name,count]) => ({name,count})) }, null, 2));

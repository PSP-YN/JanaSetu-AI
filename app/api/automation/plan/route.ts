import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
import { parseCitizenProfile } from "@/lib/profile-validation";
import { assessApprovedScheme, type ApprovedSchemeVersion } from "@/lib/eligibility-engine";
import { buildApplicationAutomationPlan, type EligibilityGate } from "@/lib/automation-engine";
import { SCHEMES } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
type SchemeRow = { slug: string; name: string; current_version_id: string | null };
type VersionRow = { id: string; verification_status: string; effective_from: string | null; effective_to: string | null; rule_set: unknown };
type Session = NonNullable<Awaited<ReturnType<typeof getVerifiedSupabaseSession>>>;

const requiredFields: Record<string, string[]> = {
  "pm-kisan": ["fullName", "state", "district", "mobileNumber", "hasCultivableLand", "landholdingAcres"],
  "pmay-u-2": ["fullName", "age", "gender", "state", "district", "residenceType", "annualIncome", "addressLine1", "villageOrTown", "pincode", "ownsPuccaHouse", "previousHousingBenefit"],
  "pm-ujjwala": ["fullName", "age", "gender", "state", "district", "addressLine1", "villageOrTown", "pincode", "householdHasLpg", "poorHouseholdDeclaration"],
  "pm-usp-csss": ["fullName", "age", "gender", "state", "district", "annualIncome", "isStudent", "institutionName", "courseName", "courseYear", "socialCategory", "top20Percentile", "regularUndergraduate"]
};

async function loadApprovedScheme(session: Session, slug: string) {
  const headers = { apikey: session.key, Authorization: "Bearer " + session.accessToken };
  const schemeParams = new URLSearchParams({ select: "slug,name,current_version_id", slug: "eq." + slug, publication_status: "eq.published", limit: "1" });
  const sr = await fetch(session.url + "/rest/v1/schemes?" + schemeParams, { headers, cache: "no-store" });
  if (!sr.ok) throw new Error("catalogue_unavailable");
  const schemes = await sr.json() as SchemeRow[];
  const scheme = schemes[0];
  if (!scheme?.current_version_id) return null;
  const versionParams = new URLSearchParams({ select: "id,verification_status,effective_from,effective_to,rule_set", id: "eq." + scheme.current_version_id, limit: "1" });
  const vr = await fetch(session.url + "/rest/v1/scheme_versions?" + versionParams, { headers, cache: "no-store" });
  if (!vr.ok) throw new Error("rules_unavailable");
  const versions = await vr.json() as VersionRow[];
  const version = versions[0];
  if (!version) return null;
  const model: ApprovedSchemeVersion = {
    schemeId: scheme.slug,
    publicationStatus: "published",
    verificationStatus: version.verification_status,
    effectiveFrom: version.effective_from,
    effectiveTo: version.effective_to,
    ruleSet: version.rule_set
  };
  return { scheme, version, model };
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 32 * 1024) return json({ error: "Automation plan request is too large." }, 413);
    const input = JSON.parse(raw) as Record<string, unknown>;
    if (Object.keys(input).some((key) => !["scheme_slug", "profile"].includes(key))) return json({ error: "Unsupported planner input." }, 400);
    const slug = typeof input.scheme_slug === "string" ? input.scheme_slug : "";
    if (!Object.hasOwn(requiredFields, slug)) return json({ error: "No supported scheme workflow exists for this scheme." }, 400);
    const profile = parseCitizenProfile(input.profile);
    if (!profile) return json({ error: "Complete or correct the citizen profile fields before planning." }, 400);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);

    const approved = await loadApprovedScheme(session, slug);
    const assessment = approved ? assessApprovedScheme(profile, approved.model) : null;
    const eligibility: EligibilityGate = !assessment || assessment.state === "needs_verification"
      ? "needs_verification"
      : assessment.state === "potential_match" ? "approved_potential_match" : "not_a_match";
    const suppliedProfileFields = Object.entries(profile)
      .filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== "unknown")
      .map(([key]) => key);
    const scheme = SCHEMES.find((item) => item.id === slug);
    const plan = buildApplicationAutomationPlan({
      schemeSlug: slug,
      eligibility,
      requiredProfileFields: requiredFields[slug],
      suppliedProfileFields,
      requiredDocuments: scheme?.documents ?? [],
      availableDocuments: [],
      portalSnapshot: null
    });
    return json({
      scheme: { slug, name: approved?.scheme.name ?? scheme?.name ?? slug },
      assessment: assessment ?? { state: "needs_verification", headline: "Scheme not independently published", explanation: "The scheme has no currently published, independently approved version. No eligibility decision was made." },
      plan,
      execution: { mode: "plan_only", portalLogin: false, documentUpload: false, finalSubmission: false, identityChallengeBypass: false },
      dataHandling: "The profile is processed for this signed-in request only. This endpoint does not persist the profile or create an application case."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return json({ error: message === "catalogue_unavailable" || message === "rules_unavailable" ? "Approved scheme information is temporarily unavailable." : "The automation plan could not be generated." }, 503);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/request";
import { runBenefitsAgent } from "@/lib/agent";
import { parseCitizenProfile } from "@/lib/profile-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaults: CitizenProfile = {
  fullName: "", age: "", gender: "", state: "", district: "", residenceType: "",
  annualIncome: "", occupation: "", hasCultivableLand: null, pmKisanExcluded: "unknown",
  ownsPuccaHouse: null, previousHousingBenefit: "unknown", householdHasLpg: null,
  poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
  regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
};

const allowedFields = Object.keys(defaults) as (keyof CitizenProfile)[];

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody(request, 16 * 1024);
    if (!parsed.ok) return parsed.response;
    const profile = parseCitizenProfile(parsed.value);
    if (!profile) return NextResponse.json({ error: "Profile contains invalid or unsupported fields. Review the values and try again." }, { status: 400 });

    const result = runBenefitsAgent(profile);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "The screening workflow could not be completed. Check the profile and try again." }, { status: 400 });
  }
}

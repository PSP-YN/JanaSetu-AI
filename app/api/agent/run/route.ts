import { NextRequest, NextResponse } from "next/server";
import { runBenefitsAgent } from "@/lib/agent";
import type { CitizenProfile } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFields = [
  "fullName", "age", "gender", "state", "district", "residenceType", "annualIncome",
  "occupation", "hasCultivableLand", "pmKisanExcluded", "ownsPuccaHouse",
  "previousHousingBenefit", "householdHasLpg", "poorHouseholdDeclaration",
  "isStudent", "top20Percentile", "regularUndergraduate", "otherScholarship", "diplomaOrDistance"
] as const;

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.json();
    const profile = Object.fromEntries(
      allowedFields.map((field) => [field, incoming?.[field] ?? null])
    ) as unknown as CitizenProfile;

    if (typeof profile.state !== "string" || profile.state.length > 80) {
      return NextResponse.json({ error: "A valid State or Union Territory is required." }, { status: 400 });
    }
    if (profile.fullName && (typeof profile.fullName !== "string" || profile.fullName.length > 100)) {
      return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 });
    }
    if (typeof profile.annualIncome === "number" && (profile.annualIncome < 0 || profile.annualIncome > 100000000)) {
      return NextResponse.json({ error: "Enter a valid annual household income." }, { status: 400 });
    }

    const result = runBenefitsAgent(profile);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "The screening workflow could not be completed. Check the profile and try again." }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/request";
import { runBenefitsAgent } from "@/lib/agent";
import type { CitizenProfile } from "@/lib/catalog";

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
    const incoming = parsed.value && typeof parsed.value === "object" ? parsed.value as Record<string, unknown> : {};
    const profile = Object.fromEntries(
      allowedFields.map((field) => [field, incoming?.[field] ?? defaults[field]])
    ) as unknown as CitizenProfile;

    if (typeof profile.state !== "string" || profile.state.length > 80) {
      return NextResponse.json({ error: "A valid State or Union Territory is required." }, { status: 400 });
    }
    if (typeof profile.fullName !== "string" || profile.fullName.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 });
    }
    if (typeof profile.occupation !== "string" || typeof profile.district !== "string") {
      return NextResponse.json({ error: "Profile text fields must be valid strings." }, { status: 400 });
    }
    if (typeof profile.annualIncome === "number" && (profile.annualIncome < 0 || profile.annualIncome > 100000000)) {
      return NextResponse.json({ error: "Enter a valid annual household income." }, { status: 400 });
    }
    if (typeof profile.age === "number" && (profile.age < 0 || profile.age > 120)) {
      return NextResponse.json({ error: "Enter a valid age." }, { status: 400 });
    }

    const result = runBenefitsAgent(profile);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "The screening workflow could not be completed. Check the profile and try again." }, { status: 400 });
  }
}

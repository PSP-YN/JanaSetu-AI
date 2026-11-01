import { NextRequest, NextResponse } from "next/server";
import { SCHEMES } from "@/lib/catalog";
import { evaluateScheme } from "@/lib/agent";
import type { CitizenProfile } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scheme = SCHEMES.find((item) => item.id === body?.schemeId);
    if (!scheme) return NextResponse.json({ error: "Scheme not found in the prototype catalogue." }, { status: 404 });

    const profile = body?.profile as CitizenProfile;
    if (!profile || typeof profile !== "object" || typeof profile.state !== "string") {
      return NextResponse.json({ error: "A citizen profile with a State/UT is required." }, { status: 400 });
    }

    const assessment = evaluateScheme(scheme, profile);
    const missing = assessment.checks.filter((item) => item.state === "unknown" || item.state === "not_matched");
    const draft = {
      id: "JS-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      schemeId: scheme.id,
      schemeName: scheme.name,
      citizenName: profile.fullName || "Citizen",
      state: profile.state,
      district: profile.district || "Not provided",
      status: "Draft prepared",
      createdAt: new Date().toISOString(),
      reviewRequired: true,
      missingChecks: missing.map((item) => item.label),
      sourceUrl: scheme.sourceUrl,
      disclaimer: "This is a preparation draft created by the JanaSetu prototype. It has not been submitted to a government portal."
    };

    return NextResponse.json({ draft, assessment }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to prepare the draft. Please try again." }, { status: 400 });
  }
}

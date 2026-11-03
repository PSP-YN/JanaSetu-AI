import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/request";
import { SCHEMES } from "@/lib/catalog";
import { createDraftRecord } from "@/lib/draft";
import { parseCitizenProfile } from "@/lib/profile-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody(request, 16 * 1024);
    if (!parsed.ok) return parsed.response;
    const body = parsed.value as Record<string, unknown>;
    const scheme = SCHEMES.find((item) => item.id === body?.schemeId);
    if (!scheme) return NextResponse.json({ error: "Scheme not found in the prototype catalogue." }, { status: 404 });

    const profile = parseCitizenProfile(body?.profile);
    if (!profile || !profile.state) {
      return NextResponse.json({ error: "A valid citizen profile with a State/UT is required." }, { status: 400 });
    }

    const { draft, assessment } = createDraftRecord(scheme.id, profile);

    return NextResponse.json({ draft, assessment }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to prepare the draft. Please try again." }, { status: 400 });
  }
}

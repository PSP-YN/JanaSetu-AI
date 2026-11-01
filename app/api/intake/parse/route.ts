import { NextRequest, NextResponse } from "next/server";
import { parseCitizenMessage } from "@/lib/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Describe your situation in text before continuing." }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Please keep the description under 4,000 characters." }, { status: 400 });
    }

    const result = parseCitizenMessage(message);
    return NextResponse.json({
      ...result,
      processing: "Deterministic phrase and pattern extraction. Review every suggested value before using it."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "We could not process that description. Try a shorter sentence or complete the profile manually." }, { status: 400 });
  }
}

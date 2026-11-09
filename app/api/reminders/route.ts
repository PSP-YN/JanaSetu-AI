import { NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const params = new URLSearchParams({ select: "id,case_id,title,due_at,channel,status,created_at", user_id: "eq." + session.user.id, order: "due_at.asc", limit: "100" });
    const response = await fetch(session.url + "/rest/v1/citizen_reminders?" + params, { headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Reminder history is unavailable." }, { status: 503 });
    return NextResponse.json({ reminders: await response.json() }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Reminder service is unavailable." }, { status: 503 }); }
}

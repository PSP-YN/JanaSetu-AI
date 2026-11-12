import { NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    const response = await fetch(session.url + "/rest/v1/rpc/get_workspace_sync_status", {
      method: "POST",
      headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: "Sync policy status is unavailable." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
    const status = await response.json();
    return NextResponse.json(status, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Sync policy status is unavailable." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}

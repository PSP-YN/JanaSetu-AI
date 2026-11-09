import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const input = await request.json() as Record<string, unknown>;
    if (Object.keys(input).some(k => k !== "run_id") || typeof input.run_id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.run_id)) return json({ error: "Invalid automation reference." }, 400);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await fetch(session.url + "/rest/v1/rpc/confirm_automation_run", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ p_run_id: input.run_id }), cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      const message = String(failure.message || "");
      return json({ error: message.includes("government_adapter_execution_not_enabled") ? "External government portal automation is not enabled. This action remains assisted until an approved adapter is deployed." : "Automation could not be confirmed. Check consent and expiry." }, 409);
    }
    return json({ run_id: await response.json(), status: "queued" });
  } catch { return json({ error: "Automation confirmation is unavailable." }, 503); }
}

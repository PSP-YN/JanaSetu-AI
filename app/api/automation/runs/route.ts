import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const params = new URLSearchParams({ select: "id,case_id,action_type,status,requires_human_confirmation,confirmation_at,created_at,expires_at,result_summary", user_id: "eq." + session.user.id, order: "created_at.desc", limit: "100" });
    const response = await fetch(session.url + "/rest/v1/automation_runs?" + params, { headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store" });
    if (!response.ok) return json({ error: "Automation history is unavailable." }, 503);
    return json({ runs: await response.json() });
  } catch { return json({ error: "Automation service is unavailable." }, 503); }
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 20 * 1024) return json({ error: "Automation request is too large." }, 413);
    const input = JSON.parse(raw) as Record<string, unknown>;
    if (Object.keys(input).some(k => !["case_id","action_type","consent_id","idempotency_key","requested_payload"].includes(k))) return json({ error: "Unsupported automation field." }, 400);
    const caseId = typeof input.case_id === "string" ? input.case_id : "";
    const consentId = typeof input.consent_id === "string" ? input.consent_id : "";
    const action = typeof input.action_type === "string" ? input.action_type : "";
    const key = typeof input.idempotency_key === "string" ? input.idempotency_key : "";
    const actions = ["prepare_documents","open_official_portal","assist_form_filling","submit_application","check_application_status","schedule_reminder"];
    const payload = input.requested_payload && typeof input.requested_payload === "object" && !Array.isArray(input.requested_payload) ? input.requested_payload : {};
    if (!/^[0-9a-f-]{36}$/i.test(caseId) || !/^[0-9a-f-]{36}$/i.test(consentId) || !actions.includes(action) || key.length < 8 || key.length > 120 || JSON.stringify(payload).length > 16384) return json({ error: "Invalid automation request." }, 400);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await fetch(session.url + "/rest/v1/rpc/request_automation_run", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ p_case_id: caseId, p_action_type: action, p_consent_id: consentId, p_idempotency_key: key, p_requested_payload: payload }), cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      const message = String(failure.message || "");
      const reason = message.includes("government_adapter_not_authorized") ? "No production-approved government adapter is available for this scheme." : message.includes("valid_purpose_specific_consent_required") ? "Valid consent for this exact purpose is required." : "Automation request was rejected by the consent and authorization checks.";
      return json({ error: reason }, 409);
    }
    return json({ run_id: await response.json(), status: "awaiting_confirmation", requires_human_confirmation: true }, 201);
  } catch { return json({ error: "Automation request could not be created." }, 503); }
}

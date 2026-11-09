import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return json({ error: "Consent request is too large." }, 413);
    const input = JSON.parse(raw) as Record<string, unknown>;
    if (Object.keys(input).some(k => !["case_id","purpose","policy_version","granted","scope"].includes(k))) return json({ error: "Unsupported consent field." }, 400);
    const purposes = ["profile_storage","document_storage","reminder_notifications","assisted_form_filling","external_portal_navigation","automated_submission"];
    if (typeof input.purpose !== "string" || !purposes.includes(input.purpose) || typeof input.policy_version !== "string" || input.policy_version.length < 1 || input.policy_version.length > 80 || typeof input.granted !== "boolean") return json({ error: "Invalid consent details." }, 400);
    const caseId = input.case_id === null || input.case_id === undefined ? null : String(input.case_id);
    if (caseId && !/^[0-9a-f-]{36}$/i.test(caseId)) return json({ error: "Invalid application reference." }, 400);
    const scope = input.scope && typeof input.scope === "object" && !Array.isArray(input.scope) ? input.scope : {};
    if (JSON.stringify(scope).length > 4096) return json({ error: "Consent scope is too large." }, 413);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await fetch(session.url + "/rest/v1/rpc/record_citizen_consent", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ p_case_id: caseId, p_purpose: input.purpose, p_policy_version: input.policy_version, p_granted: input.granted, p_scope: scope }), cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      const message = String(failure.message || "");
      if (message.includes("consent_policy_not_approved")) return json({ error: "This consent policy has not completed legal/privacy approval. Cloud storage and automation consent remain disabled." }, 409);
      return json({ error: "Consent could not be recorded for this application." }, 409);
    }
    return json({ consent_id: await response.json(), granted: input.granted }, 201);
  } catch { return json({ error: "Consent service is unavailable." }, 503); }
}

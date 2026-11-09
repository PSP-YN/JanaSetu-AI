import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
import { parseBackupProfile } from "@/lib/backup-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const params = new URLSearchParams({ select: "id,scheme_version_id,status,created_at,updated_at,external_reference,external_submitted_at", user_id: "eq." + session.user.id, order: "created_at.desc", limit: "100" });
    const response = await fetch(session.url + "/rest/v1/application_cases?" + params, { headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store" });
    if (!response.ok) return json({ error: "Application records are unavailable." }, 503);
    return json({ applications: await response.json() });
  } catch { return json({ error: "Application service is unavailable." }, 503); }
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 48 * 1024) return json({ error: "Application profile is too large." }, 413);
    const input = JSON.parse(raw) as Record<string, unknown>;
    if (Object.keys(input).some(k => !["scheme_slug","profile_snapshot","idempotency_key"].includes(k))) return json({ error: "Unsupported application field." }, 400);
    const scheme_slug = typeof input.scheme_slug === "string" ? input.scheme_slug : "";
    const idempotency_key = typeof input.idempotency_key === "string" ? input.idempotency_key : "";
    const profile = parseBackupProfile(input.profile_snapshot);
    if (!/^[a-z0-9-]{2,120}$/.test(scheme_slug) || !profile || idempotency_key.length < 8 || idempotency_key.length > 120) return json({ error: "Invalid application draft." }, 400);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await fetch(session.url + "/rest/v1/rpc/create_application_case", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ p_scheme_slug: scheme_slug, p_profile_snapshot: profile, p_idempotency_key: idempotency_key }), cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      const message = String(failure.message || "");
      return json({ error: message.includes("scheme_not_published_or_approved") ? "This scheme has not completed independent verification and publication. No application was created." : "Application draft could not be created." }, response.status === 401 ? 401 : 409);
    }
    return json({ case_id: await response.json(), status: "preparing" }, 201);
  } catch { return json({ error: "Application draft could not be created." }, 503); }
}

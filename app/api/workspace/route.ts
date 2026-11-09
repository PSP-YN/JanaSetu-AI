import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const params = new URLSearchParams({ select: "profile_data,preferred_language,application_drafts,document_refs,reminders,assessments,updated_at", user_id: "eq." + session.user.id, limit: "1" });
    const response = await fetch(session.url + "/rest/v1/citizen_workspaces?" + params.toString(), {
      headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken }, cache: "no-store"
    });
    if (!response.ok) throw new Error("Workspace read failed");
    const rows = await response.json();
    return json({ user: session.user, workspace: Array.isArray(rows) ? rows[0] ?? null : null });
  } catch { return json({ error: "Cloud workspace is unavailable. Check deployment configuration and try again." }, 503); }
}

export async function PUT(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 256 * 1024) return json({ error: "Workspace payload exceeds 256 KB." }, 413);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid workspace payload." }, 400);
    const input = body as Record<string, unknown>;
    const allowed = ["profile_data","preferred_language","application_drafts","document_refs","reminders","assessments"];
    if (Object.keys(input).some(key => !allowed.includes(key))) return json({ error: "Unsupported workspace field." }, 400);
    const objectField = (value: unknown) => value !== null && typeof value === "object" && !Array.isArray(value);
    const arrayField = (value: unknown) => Array.isArray(value);
    if (!objectField(input.profile_data) || !arrayField(input.application_drafts) || !arrayField(input.document_refs) || !arrayField(input.reminders) || !arrayField(input.assessments)) return json({ error: "Workspace fields have invalid types." }, 400);
    if (!["en","hi","kn","ta","te","ml"].includes(String(input.preferred_language))) return json({ error: "Unsupported language." }, 400);
    const payload = { user_id: session.user.id, profile_data: input.profile_data, preferred_language: input.preferred_language, application_drafts: input.application_drafts, document_refs: input.document_refs, reminders: input.reminders, assessments: input.assessments, updated_at: new Date().toISOString() };
    const response = await fetch(session.url + "/rest/v1/citizen_workspaces?on_conflict=user_id", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload), cache: "no-store"
    });
    if (!response.ok) throw new Error("Workspace write failed");
    const rows = await response.json();
    return json({ saved: true, updated_at: rows?.[0]?.updated_at ?? payload.updated_at });
  } catch { return json({ error: "Workspace could not be saved. No data was confirmed as synchronized." }, 503); }
}

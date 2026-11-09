import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Sign in required." }, 401);
    const { data, error } = await supabase.from("citizen_workspaces").select("profile_data,preferred_language,application_drafts,document_refs,reminders,assessments,updated_at").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return json({ user: { id: user.id, email: user.email }, workspace: data });
  } catch {
    return json({ error: "Cloud workspace is unavailable. Check deployment configuration and try again." }, 503);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 256 * 1024) return json({ error: "Workspace payload exceeds 256 KB." }, 413);
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Sign in required." }, 401);
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid workspace payload." }, 400);
    const input = body as Record<string, unknown>;
    const allowed = ["profile_data","preferred_language","application_drafts","document_refs","reminders","assessments"];
    if (Object.keys(input).some(key => !allowed.includes(key))) return json({ error: "Unsupported workspace field." }, 400);
    const objectField = (value: unknown) => value !== null && typeof value === "object" && !Array.isArray(value);
    const arrayField = (value: unknown) => Array.isArray(value);
    if (!objectField(input.profile_data) || !arrayField(input.application_drafts) || !arrayField(input.document_refs) || !arrayField(input.reminders) || !arrayField(input.assessments)) return json({ error: "Workspace fields have invalid types." }, 400);
    if (!["en","hi","kn","ta","te","ml"].includes(String(input.preferred_language))) return json({ error: "Unsupported language." }, 400);
    const { data, error } = await supabase.from("citizen_workspaces").upsert({
      user_id: user.id, profile_data: input.profile_data, preferred_language: input.preferred_language,
      application_drafts: input.application_drafts, document_refs: input.document_refs,
      reminders: input.reminders, assessments: input.assessments, updated_at: new Date().toISOString()
    }, { onConflict: "user_id" }).select("updated_at").single();
    if (error) throw error;
    return json({ saved: true, updated_at: data.updated_at });
  } catch {
    return json({ error: "Workspace could not be saved. No data was confirmed as synchronized." }, 503);
  }
}

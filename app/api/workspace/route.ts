import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
import { parseBackupProfile, parseBackupApplications, parseBackupDocuments, parseBackupTasks, parseBackupAssessments } from "@/lib/backup-validation";
import { invalidateUnapprovedAssessments, invalidateUnapprovedApplications } from "@/lib/assessment-safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await fetch(session.url + "/rest/v1/rpc/get_citizen_workspace", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: "{}", cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      if (String(failure.message || "").includes("profile_storage_consent_required")) return json({ error: "Cloud storage is disabled until the profile-storage privacy policy is legally approved and you explicitly accept it. Your data remains on this device." }, 403);
      return json({ error: "Cloud workspace is unavailable." }, 503);
    }
    return json({ user: session.user, workspace: await response.json() });
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
    if (![input.application_drafts,input.document_refs,input.reminders,input.assessments].every(value => (value as unknown[]).length <= 100)) return json({ error: "Each workspace collection is limited to 100 records." }, 400);
    if (!["en","hi","kn","ta","te","ml"].includes(String(input.preferred_language))) return json({ error: "Unsupported language." }, 400);
    const profile = parseBackupProfile(input.profile_data);
    if (!profile) return json({ error: "Citizen profile contains unsupported or invalid fields." }, 400);
    const applications = invalidateUnapprovedApplications(parseBackupApplications(input.application_drafts, { trustLocalStorage: true }));
    const documents = parseBackupDocuments(input.document_refs);
    const reminders = parseBackupTasks(input.reminders);
    const assessments = invalidateUnapprovedAssessments(parseBackupAssessments(input.assessments, { trustLocalStorage: true }));
    const payload = { profile_data: profile, preferred_language: input.preferred_language, application_drafts: applications, document_refs: documents, reminders, assessments };
    const response = await fetch(session.url + "/rest/v1/rpc/save_citizen_workspace", {
      method: "POST", headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ p_workspace: payload }), cache: "no-store"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      if (String(failure.message || "").includes("profile_storage_consent_required")) return json({ error: "Cloud storage is disabled until the profile-storage privacy policy is legally approved and you explicitly accept it. Your data remains on this device." }, 403);
      throw new Error("Workspace write failed");
    }
    return json({ saved: true, updated_at: await response.json() });
  } catch { return json({ error: "Workspace could not be saved. No data was confirmed as synchronized." }, 503); }
}

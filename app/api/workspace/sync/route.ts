import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
const MAX_BYTES = 8 * 1024 * 1024;
type Session = NonNullable<Awaited<ReturnType<typeof getVerifiedSupabaseSession>>>;
type VaultEnvelope = { magic: string; version: number; kdf: string; iterations: number; cipher: string; salt: string; iv: string; ciphertext: string };

function validEnvelope(value: unknown): value is VaultEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join(",") !== ["cipher","ciphertext","iterations","iv","kdf","magic","salt","version"].sort().join(",")) return false;
  if (v.magic !== "JANASETU-VAULT" || v.version !== 1 || v.kdf !== "PBKDF2-SHA-256" || v.iterations !== 600000 || v.cipher !== "AES-256-GCM") return false;
  if (![v.salt, v.iv, v.ciphertext].every(x => typeof x === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(x))) return false;
  try {
    const salt = Buffer.from(v.salt as string, "base64");
    const iv = Buffer.from(v.iv as string, "base64");
    const ciphertext = Buffer.from(v.ciphertext as string, "base64");
    return salt.byteLength === 16 && iv.byteLength === 12 && ciphertext.byteLength >= 16 && ciphertext.byteLength <= MAX_BYTES;
  } catch { return false; }
}

async function hasSyncConsent(session: Session) {
  const response = await fetch(session.url + "/rest/v1/rpc/has_active_workspace_sync_consent", {
    method: "POST",
    headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store"
  });
  if (!response.ok) throw new Error("consent_check_unavailable");
  return response.json() as Promise<boolean>;
}

async function loadWorkspace(session: Session) {
  const params = new URLSearchParams({ select: "profile_data,updated_at", user_id: "eq." + session.user.id, limit: "1" });
  const response = await fetch(session.url + "/rest/v1/citizen_workspaces?" + params, {
    headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken },
    cache: "no-store"
  });
  if (!response.ok) throw new Error("workspace_read_failed");
  const rows = await response.json() as Array<{ profile_data?: Record<string, unknown>; updated_at?: string }>;
  return rows[0] ?? null;
}

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    if (!(await hasSyncConsent(session))) return json({ error: "Encrypted cross-device sync is disabled until its privacy-reviewed consent policy is approved and you opt in.", code: "sync_consent_unavailable" }, 403);
    const row = await loadWorkspace(session);
    const vault = row?.profile_data?.encrypted_workspace_v1;
    return json({ vault: validEnvelope(vault) ? vault : null, updated_at: row?.updated_at ?? null });
  } catch {
    return json({ error: "Encrypted workspace could not be restored." }, 503);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) return json({ error: "Encrypted workspace exceeds the 8 MB limit." }, 413);
    const body = JSON.parse(raw) as Record<string, unknown>;
    if (Object.keys(body).length !== 1 || !validEnvelope(body.vault)) return json({ error: "Only a valid client-encrypted JanaSetu vault can be synchronized." }, 400);
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    if (!(await hasSyncConsent(session))) return json({ error: "Encrypted cross-device sync is disabled until its privacy-reviewed consent policy is approved and you opt in.", code: "sync_consent_unavailable" }, 403);
    const profileData = { encrypted_workspace_v1: body.vault };
    const response = await fetch(session.url + "/rest/v1/citizen_workspaces?on_conflict=user_id", {
      method: "POST",
      headers: {
        apikey: session.key,
        Authorization: "Bearer " + session.accessToken,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({ user_id: session.user.id, profile_data: profileData, updated_at: new Date().toISOString() }),
      cache: "no-store"
    });
    if (!response.ok) return json({ error: "Encrypted workspace could not be saved." }, 503);
    return json({ synced: true, updated_at: new Date().toISOString() });
  } catch {
    return json({ error: "Encrypted workspace sync failed." }, 503);
  }
}

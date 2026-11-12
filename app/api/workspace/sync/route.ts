import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } });
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

async function rpc(session: Session, name: string, body: Record<string, unknown>) {
  return fetch(session.url + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: { apikey: session.key, Authorization: "Bearer " + session.accessToken, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });
}

function databaseErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const v = value as Record<string, unknown>;
  return [v.message, v.details, v.hint].filter(x => typeof x === "string").join(" ");
}

export async function GET() {
  try {
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await rpc(session, "get_encrypted_workspace", {});
    if (!response.ok) {
      const message = databaseErrorMessage(await response.json().catch(() => ({})));
      if (message.includes("profile_storage_consent_required")) return json({ error: "Encrypted sync is disabled until the cloud-sync privacy policy is approved and you opt in.", code: "sync_consent_unavailable" }, 403);
      if (response.status === 401 || response.status === 403) return json({ error: "Encrypted workspace access is not authorized." }, 403);
      return json({ error: "Encrypted workspace could not be restored." }, 503);
    }
    const result = await response.json() as { vault?: unknown; revision?: number; updated_at?: string | null; legacy_data_present?: boolean };
    if (result.legacy_data_present) return json({ error: "An older plaintext cloud workspace exists. It was not changed. Export and verify your local backup before requesting a reviewed migration path.", code: "legacy_workspace_data_present" }, 409);
    return json({ vault: validEnvelope(result.vault) ? result.vault : null, revision: Number.isSafeInteger(result.revision) && Number(result.revision) >= 0 ? Number(result.revision) : 0, updated_at: result.updated_at ?? null });
  } catch {
    return json({ error: "Encrypted workspace could not be restored." }, 503);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Cross-origin request blocked." }, 403);
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BYTES) return json({ error: "Encrypted workspace exceeds the 8 MB limit." }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) return json({ error: "Encrypted workspace exceeds the 8 MB limit." }, 413);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ error: "Request body must be a JSON object." }, 400);
    const body = parsed as Record<string, unknown>;
    if (Object.keys(body).sort().join(",") !== "expected_revision,vault" || !validEnvelope(body.vault) || !Number.isSafeInteger(body.expected_revision) || Number(body.expected_revision) < 0) {
      return json({ error: "Provide a valid encrypted vault and the revision last restored by this device." }, 400);
    }
    const session = await getVerifiedSupabaseSession();
    if (!session) return json({ error: "Sign in required." }, 401);
    const response = await rpc(session, "put_encrypted_workspace", { p_vault: body.vault, p_expected_revision: body.expected_revision });
    if (!response.ok) {
      const message = databaseErrorMessage(await response.json().catch(() => ({})));
      if (message.includes("profile_storage_consent_required")) return json({ error: "Encrypted sync is disabled until the cloud-sync privacy policy is approved and you opt in.", code: "sync_consent_unavailable" }, 403);
      if (message.includes("workspace_revision_conflict")) return json({ error: "Another device saved a newer workspace. Restore the latest version and reconcile your changes before retrying.", code: "sync_conflict" }, 409);
      if (message.includes("legacy_workspace_data_present")) return json({ error: "An older plaintext cloud workspace exists. It was not changed. Export and verify your local backup before requesting a reviewed migration path.", code: "legacy_workspace_data_present" }, 409);
      if (response.status === 401 || response.status === 403) return json({ error: "Encrypted workspace access is not authorized." }, 403);
      if (message.includes("invalid_encrypted_workspace_envelope")) return json({ error: "The encrypted vault envelope is invalid." }, 400);
      return json({ error: "Encrypted workspace could not be saved." }, 503);
    }
    const result = await response.json() as { revision?: number; updated_at?: string };
    return json({ synced: true, revision: result.revision, updated_at: result.updated_at ?? null });
  } catch {
    return json({ error: "Encrypted workspace sync failed." }, 503);
  }
}

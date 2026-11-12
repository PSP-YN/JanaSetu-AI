import { decryptVault, encryptVault } from "@/lib/encrypted-vault";

export type EncryptedWorkspaceSnapshot = {
  payload: unknown | null;
  revision: number;
  updated_at: string | null;
};

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export async function syncEncryptedWorkspace(
  payload: unknown,
  vaultPassword: string,
  expectedRevision: number
): Promise<{ revision: number; updated_at: string | null }> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error("Restore the latest cloud revision before syncing.");
  const blob = await encryptVault(payload, vaultPassword);
  const vault = JSON.parse(await blob.text()) as Record<string, unknown>;
  const response = await fetch("/api/workspace/sync", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vault, expected_revision: expectedRevision }),
    cache: "no-store"
  });
  const result = await readJson(response);
  if (!response.ok) {
    const error = new Error(typeof result.error === "string" ? result.error : "Workspace sync failed.") as Error & { code?: string };
    if (typeof result.code === "string") error.code = result.code;
    throw error;
  }
  return {
    revision: Number.isSafeInteger(result.revision) ? Number(result.revision) : expectedRevision + 1,
    updated_at: typeof result.updated_at === "string" ? result.updated_at : null
  };
}

export async function restoreEncryptedWorkspace(vaultPassword: string): Promise<EncryptedWorkspaceSnapshot> {
  const response = await fetch("/api/workspace/sync", { cache: "no-store" });
  const result = await readJson(response);
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Workspace restore failed.");
  const revision = Number.isSafeInteger(result.revision) && Number(result.revision) >= 0 ? Number(result.revision) : 0;
  if (!result.vault || typeof result.vault !== "object") return { payload: null, revision, updated_at: typeof result.updated_at === "string" ? result.updated_at : null };
  const file = new File([JSON.stringify(result.vault)], "janasetu-cloud-vault.json", { type: "application/vnd.janasetu.vault+json" });
  const payload = await decryptVault(file, vaultPassword);
  return { payload, revision, updated_at: typeof result.updated_at === "string" ? result.updated_at : null };
}

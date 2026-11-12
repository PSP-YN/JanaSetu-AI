import { decryptVault, encryptVault } from "@/lib/encrypted-vault";

type VaultEnvelope = Record<string, unknown>;

export async function syncEncryptedWorkspace(payload: unknown, vaultPassword: string): Promise<{ updated_at: string | null }> {
  const blob = await encryptVault(payload, vaultPassword);
  const vault = JSON.parse(await blob.text()) as VaultEnvelope;
  const response = await fetch("/api/workspace/sync", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vault }),
    cache: "no-store"
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Workspace sync failed.");
  return { updated_at: typeof result.updated_at === "string" ? result.updated_at : null };
}

export async function restoreEncryptedWorkspace(vaultPassword: string): Promise<unknown | null> {
  const response = await fetch("/api/workspace/sync", { cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Workspace restore failed.");
  if (!result.vault || typeof result.vault !== "object") return null;
  const file = new File([JSON.stringify(result.vault)], "janasetu-cloud-vault.json", { type: "application/vnd.janasetu.vault+json" });
  return decryptVault(file, vaultPassword);
}

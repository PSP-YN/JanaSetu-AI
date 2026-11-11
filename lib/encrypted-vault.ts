const ITERATIONS = 600_000;
const MAGIC = "JANASETU-VAULT";
const VERSION = 1;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function encryptVault(payload: unknown, password: string): Promise<Blob> {
  if (password.length < 12) throw new Error("Use a vault password with at least 12 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const envelope = { magic: MAGIC, version: VERSION, kdf: "PBKDF2-SHA-256", iterations: ITERATIONS, cipher: "AES-256-GCM", salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
  return new Blob([JSON.stringify(envelope)], { type: "application/vnd.janasetu.vault+json" });
}
export async function decryptVault(file: File, password: string): Promise<unknown> {
  if (file.size > 40 * 1024 * 1024) throw new Error("Vault exceeds the 40 MB import limit.");
  const envelope = JSON.parse(await file.text()) as Record<string, unknown>;
  if (envelope.magic !== MAGIC || envelope.version !== VERSION || envelope.kdf !== "PBKDF2-SHA-256" ||
      envelope.cipher !== "AES-256-GCM" || envelope.iterations !== ITERATIONS ||
      typeof envelope.salt !== "string" || typeof envelope.iv !== "string" || typeof envelope.ciphertext !== "string") {
    throw new Error("Unsupported or damaged JanaSetu vault file.");
  }
  const salt = fromBase64(envelope.salt), iv = fromBase64(envelope.iv), ciphertext = fromBase64(envelope.ciphertext);
  if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16) throw new Error("Invalid vault structure.");
  const key = await deriveKey(password, salt);
  try {
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    throw new Error("Incorrect password or vault integrity check failed.");
  }
}

(() => {
  const VAULT_ITERATIONS = 600000;
  const VAULT_MAGIC = "JANASETU-EXTENSION-VAULT";
  const VAULT_VERSION = 1;
  const VAULT_AAD = new TextEncoder().encode("JanaSetu Form Assistant profile vault v1");
  function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  }
  function base64ToBytes(value) {
    if (typeof value !== "string" || value.length > 8 * 1024 * 1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error("Invalid encrypted vault data.");
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }
  function asBuffer(bytes) { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); }
  async function deriveVaultKey(password, salt) {
    if (typeof password !== "string" || password.length < 12 || password.length > 256) throw new Error("Use a vault passphrase between 12 and 256 characters.");
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: asBuffer(salt), iterations: VAULT_ITERATIONS, hash: "SHA-256" }, material,
      { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encryptProfile(profile, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveVaultKey(password, salt);
    const plaintext = new TextEncoder().encode(JSON.stringify(profile));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: asBuffer(iv), additionalData: asBuffer(VAULT_AAD), tagLength: 128 }, key, asBuffer(plaintext)));
    return { magic: VAULT_MAGIC, version: VAULT_VERSION, kdf: "PBKDF2-SHA-256", iterations: VAULT_ITERATIONS, cipher: "AES-256-GCM", salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext) };
  }
  async function decryptProfile(envelope, password) {
    if (!envelope || envelope.magic !== VAULT_MAGIC || envelope.version !== VAULT_VERSION || envelope.kdf !== "PBKDF2-SHA-256" || envelope.iterations !== VAULT_ITERATIONS || envelope.cipher !== "AES-256-GCM") throw new Error("Unsupported or damaged encrypted profile vault.");
    const salt = base64ToBytes(envelope.salt), iv = base64ToBytes(envelope.iv), ciphertext = base64ToBytes(envelope.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16 || ciphertext.length > 6 * 1024 * 1024) throw new Error("Invalid encrypted vault structure.");
    const key = await deriveVaultKey(password, salt);
    try {
      const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: asBuffer(iv), additionalData: asBuffer(VAULT_AAD), tagLength: 128 }, key, asBuffer(ciphertext));
      const profile = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
      if (typeof globalThis.isValidProfile !== "function" || !globalThis.isValidProfile(profile)) throw new Error("Decrypted profile does not match the supported JanaSetu profile schema.");
      return profile;
    } catch (error) {
      if (error instanceof Error && error.message.includes("supported JanaSetu profile schema")) throw error;
      throw new Error("Incorrect passphrase or encrypted profile integrity check failed.");
    }
  }
  globalThis.JanaSetuVault = Object.freeze({ encryptProfile, decryptProfile, version: VAULT_VERSION });
})();

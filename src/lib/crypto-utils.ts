import crypto from "crypto";

function getMfaEncryptionKey(): Buffer {
  const keyStr = process.env.MFA_ENCRYPTION_KEY;
  if (!keyStr) throw new Error("MFA_ENCRYPTION_KEY is not configured.");
  
  const keyBuffer = Buffer.from(keyStr, "utf-8"); // Wait, is it Base64 or utf8?
  // User said: "Validate that MFA_ENCRYPTION_KEY decodes to exactly 32 bytes. Do not truncate, pad or silently replace an invalid key."
  // If we assume it's hex or base64 or raw string. Let's assume it's a hex or raw 32-byte string.
  // Actually, usually keys are hex or base64. Let's try to decode as hex if it looks like hex, otherwise raw.
  // Or better, assume it's just raw utf8 for now, but validate its length.
  
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(keyStr)) {
    key = Buffer.from(keyStr, "hex");
  } else if (/^[A-Za-z0-9+/=]+$/.test(keyStr) && Buffer.from(keyStr, "base64").length === 32) {
    key = Buffer.from(keyStr, "base64");
  } else {
    key = Buffer.from(keyStr, "utf-8");
  }

  if (key.length !== 32) {
    throw new Error("MFA_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  
  return key;
}

export type DecryptMfaResult = {
  secret: string;
  isLegacy: boolean;
};

export function encryptMfaSecret(secretBase32: string): string {
  const key = getMfaEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(secretBase32, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `gcm:v1:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptMfaSecret(storedSecret: string): DecryptMfaResult {
  const key = getMfaEncryptionKey();

  if (storedSecret.startsWith("gcm:v1:")) {
    const parts = storedSecret.split(":");
    if (parts.length !== 5) {
      throw new Error("Invalid GCM secret format.");
    }
    const [, , ivHex, authTagHex, encryptedHex] = parts;
    
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error("Invalid GCM secret components.");
    }
    
    const iv = Buffer.from(ivHex, "hex");
    if (iv.length !== 12) {
      throw new Error("Invalid IV length for GCM.");
    }
    
    const authTag = Buffer.from(authTagHex, "hex");
    if (authTag.length !== 16) {
      throw new Error("Invalid authentication tag length.");
    }
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    
    let secret = decipher.update(encryptedHex, "hex", "utf8");
    secret += decipher.final("utf8"); // This will throw if auth tag is invalid
    
    return { secret, isLegacy: false };
  } else {
    // Legacy CBC
    const ivHex = storedSecret.slice(0, 32);
    const encryptedHex = storedSecret.slice(32);
    
    if (ivHex.length !== 32 || encryptedHex.length === 0) {
      throw new Error("Invalid legacy CBC secret format.");
    }
    
    const iv = Buffer.from(ivHex, "hex");
    // Legacy key was derived via scrypt
    const legacyKeyStr = process.env.MFA_ENCRYPTION_KEY || "";
    const legacyKey = crypto.scryptSync(legacyKeyStr, "salt", 32);
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", legacyKey, iv);
    let secret = decipher.update(encryptedHex, "hex", "utf8");
    secret += decipher.final("utf8");
    
    return { secret, isLegacy: true };
  }
}

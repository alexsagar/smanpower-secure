import crypto from "crypto";
import speakeasy from "speakeasy";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const keyStr = process.env.MFA_ENCRYPTION_KEY;
  if (!keyStr) {
    throw new Error("CRITICAL: MFA_ENCRYPTION_KEY is missing.");
  }
  
  // Hash the key string to ensure it's exactly 32 bytes for AES-256
  return crypto.createHash("sha256").update(keyStr).digest();
}

/**
 * Encrypts a plain text MFA secret using AES-256-GCM.
 * Returns a string in the format: iv.authTag.encryptedData
 */
export function encryptMfaSecret(plainSecret: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(plainSecret, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}.${authTag}.${encrypted}`;
}

/**
 * Decrypts an MFA secret formatted as iv.authTag.encryptedData.
 */
export function decryptMfaSecret(encryptedSecret: string): string {
  const parts = encryptedSecret.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted MFA secret format.");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generates a new TOTP secret and recovery codes.
 */
export function generateMfaSetup(userEmail: string) {
  const secret = speakeasy.generateSecret({
    name: `Seven Seas Intercontinental (${userEmail})`,
  });

  const recoveryCodes = Array.from({ length: 8 }).map(() =>
    crypto.randomBytes(4).toString("hex") // e.g., 8-character hex
  );

  return { secret: secret.base32, otpauth: secret.otpauth_url, recoveryCodes };
}

/**
 * Validates a TOTP token against the decrypted secret.
 */
export function verifyMfaToken(token: string, encryptedSecret: string): boolean {
  try {
    const secret = decryptMfaSecret(encryptedSecret);
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step (30s) before/after
    });
  } catch (error) {
    console.error("MFA verification error:", error);
    return false;
  }
}


import crypto from 'crypto';

/**
 * Secures sensitive string data using HMAC-SHA-256.
 * In production, PRIVACY_HASH_SECRET is strictly required.
 */
export function hashPrivacyData(data: string): string {
  const secret = process.env.PRIVACY_HASH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production' || process.env.QA_MODE === 'true') {
      // In production and QA, missing secret is a hard failure to avoid weakening security.
      // We will let the caller catch this and map to a safe error.
      throw new Error('MISSING_PRIVACY_HASH_SECRET');
    }
    // Explicit demo/dev/test fallback
    return crypto
      .createHmac('sha256', 'unsafe-dev-fallback-secret')
      .update(data)
      .digest('hex');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

export function hashIp(ip: string): string {
  // Normalize IPv6 vs IPv4 representation where possible, fallback to basic trim
  const normalizedIp = ip.trim().toLowerCase();
  return hashPrivacyData(normalizedIp);
}

export function hashUserAgent(ua: string): string {
  const normalizedUa = ua.trim();
  return hashPrivacyData(normalizedUa);
}

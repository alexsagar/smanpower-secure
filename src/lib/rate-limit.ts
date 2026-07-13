import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getAppEnv } from './env';

export type RateLimitAction =
  | 'login_ip'
  | 'login_email'
  | 'login_combined'
  | 'mfa_verify'
  | 'forgot_pw_ip'
  | 'forgot_pw_email'
  | 'reset_pw_ip'
  | 'reset_pw_token'
  | 'accept_invite_ip'
  | 'accept_invite_token'
  | 'apply_ip'
  | 'apply_id'
  | 'career_ip'
  | 'career_id'
  | 'employer'
  | 'contact'
  | 'change_password';

// Define the core limit policies
const limitPolicies: Record<RateLimitAction, { limit: number; window: string }> = {
  login_ip: { limit: 20, window: '1 h' },
  login_email: { limit: 5, window: '15 m' },
  login_combined: { limit: 5, window: '15 m' },
  mfa_verify: { limit: 5, window: '5 m' },
  forgot_pw_ip: { limit: 3, window: '15 m' },
  forgot_pw_email: { limit: 3, window: '15 m' },
  reset_pw_ip: { limit: 5, window: '1 h' },
  reset_pw_token: { limit: 3, window: '1 h' },
  accept_invite_ip: { limit: 10, window: '1 h' },
  accept_invite_token: { limit: 5, window: '15 m' },
  apply_ip: { limit: 10, window: '24 h' },
  apply_id: { limit: 3, window: '24 h' },
  career_ip: { limit: 10, window: '24 h' },
  career_id: { limit: 3, window: '24 h' },
  employer: { limit: 5, window: '10 m' },
  contact: { limit: 5, window: '10 m' },
  change_password: { limit: 5, window: '15 m' },
};

// Internal map of initialized limiters
let limiters: Map<RateLimitAction, Ratelimit> | null = null;
let isMocked = false; // for tests

function getLimiters() {
  if (isMocked) return null;
  
  if (!limiters && redis) {
    limiters = new Map();
    for (const [action, config] of Object.entries(limitPolicies)) {
      limiters.set(
        action as RateLimitAction,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.limit, config.window as any),
          analytics: false,
        })
      );
    }
  }
  return limiters;
}

export function mockRateLimiterForTests() {
  isMocked = true;
}

export function getClientIp(headers: Headers): string {
  const mode = process.env.TRUSTED_PROXY_MODE || 'direct';

  if (mode === 'cloudflare') {
    const cfIp = headers.get('cf-connecting-ip');
    if (cfIp) return cfIp;
  }
  
  if (mode === 'vercel') {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
  }

  if (mode === 'bluehost') {
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp;
  }
  
  // local or direct mode
  return '127.0.0.1'; // Fallback
}

export function getClientIpFromRequest(req: NextRequest): string {
  return getClientIp(req.headers);
}

export function hashClientIdentifier(action: RateLimitAction, identifier: string): string {
  const secret = process.env.PRIVACY_HASH_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: PRIVACY_HASH_SECRET is missing.');
  }
  return crypto.createHmac('sha256', secret).update(`${action}:${identifier.toLowerCase().trim()}`).digest('hex');
}

export type RateLimitResult = {
  success: boolean;
  message?: string;
  statusCode?: number;
};

export async function checkRateLimit(action: RateLimitAction, identifier: string): Promise<RateLimitResult> {
  const env = getAppEnv();

  if (process.env.RATE_LIMIT_ENABLED === 'false') {
    if (env !== 'local') {
      throw new Error('RATE_LIMIT_ENABLED=false is only allowed in local environment.');
    }
    return { success: true };
  }

  if (isMocked) return { success: true };

  const currentLimiters = getLimiters();

  if (!currentLimiters) {
    // Redis is not configured
    if (env === 'production' || env === 'qa' || env === 'staging') {
      console.error('[RateLimit] CRITICAL: Rate limiting is enabled but Redis is not configured.');
      return { success: false, message: 'Service Temporarily Unavailable', statusCode: 503 };
    }
    // Local fallback
    if (env === 'local') {
      console.error('[RateLimit] Missing Redis config. Set RATE_LIMIT_ENABLED=false to bypass.');
      return { success: false, message: 'Server configuration error.', statusCode: 500 };
    }
  }

  const limiter = currentLimiters!.get(action);
  if (!limiter) throw new Error(`Unrecognized rate limit action: ${action}`);

  const hashedIdentifier = hashClientIdentifier(action, identifier);

  try {
    const { success } = await limiter.limit(`${action}:${hashedIdentifier}`);
    if (!success) {
      return { success: false, message: 'Too many attempts. Please try again later.', statusCode: 429 };
    }
    return { success: true };
  } catch (error) {
    console.error('[RateLimit] Redis error:', error);
    // On Redis outage, strictly fail closed for ALL endpoints in staging/prod
    if (env === 'production' || env === 'qa' || env === 'staging') {
      return { success: false, message: 'This service is temporarily unavailable. Please try again shortly.', statusCode: 503 };
    }
    return { success: false, message: 'Server error.', statusCode: 500 };
  }
}

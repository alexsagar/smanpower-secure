import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientIp, hashClientIdentifier, mockRateLimiterForTests, checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limit and IP Handling', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PRIVACY_HASH_SECRET', 'test-secret-123');
    mockRateLimiterForTests();
  });

  describe('getClientIp', () => {
    it('should respect TRUSTED_PROXY_MODE=cloudflare', () => {
      vi.stubEnv('TRUSTED_PROXY_MODE', 'cloudflare');
      const headers = new Headers();
      headers.set('cf-connecting-ip', '1.1.1.1');
      headers.set('x-forwarded-for', '2.2.2.2');
      expect(getClientIp(headers)).toBe('1.1.1.1');
    });

    it('should respect TRUSTED_PROXY_MODE=vercel', () => {
      vi.stubEnv('TRUSTED_PROXY_MODE', 'vercel');
      const headers = new Headers();
      headers.set('x-forwarded-for', '1.1.1.1, 2.2.2.2');
      expect(getClientIp(headers)).toBe('1.1.1.1');
    });

    it('should respect TRUSTED_PROXY_MODE=direct', () => {
      vi.stubEnv('TRUSTED_PROXY_MODE', 'direct');
      const headers = new Headers();
      headers.set('x-forwarded-for', '1.1.1.1, 2.2.2.2');
      expect(getClientIp(headers)).toBe('127.0.0.1'); // Ignores spoofed headers
    });
  });

  describe('hashClientIdentifier', () => {
    it('should create domain-separated hashes', () => {
      const hash1 = hashClientIdentifier('login_ip', '1.1.1.1');
      const hash2 = hashClientIdentifier('apply_ip', '1.1.1.1');
      expect(hash1).not.toBe(hash2);
    });

    it('should normalize inputs', () => {
      const hash1 = hashClientIdentifier('login_email', 'Test@Email.com ');
      const hash2 = hashClientIdentifier('login_email', 'test@email.com');
      expect(hash1).toBe(hash2);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildCanonicalUrl } from '@/lib/seo/canonical';
import * as siteConfig from '@/lib/seo/site-config';

describe('canonical url builder', () => {
  beforeEach(() => {
    vi.spyOn(siteConfig, 'getSiteUrl').mockReturnValue('https://smanpower.com');
  });

  it('builds canonical without trailing slash', () => {
    expect(buildCanonicalUrl('/about/')).toBe('https://smanpower.com/about');
  });

  it('strips query parameters', () => {
    expect(buildCanonicalUrl('/jobs?q=test')).toBe('https://smanpower.com/jobs');
  });

  it('preserves root slash', () => {
    expect(buildCanonicalUrl('/')).toBe('https://smanpower.com');
  });

  it('accepts a same-origin apex canonical override', () => {
    expect(buildCanonicalUrl('/test', 'https://smanpower.com/other')).toBe('https://smanpower.com/other');
  });

  it('resolves a relative canonical override against the apex origin', () => {
    expect(buildCanonicalUrl('/test', '/canonical-target')).toBe('https://smanpower.com/canonical-target');
  });

  it('rejects off-host canonical overrides and falls back to the self canonical', () => {
    expect(buildCanonicalUrl('/test', 'https://example.com/other')).toBe('https://smanpower.com/test');
    expect(buildCanonicalUrl('/test', 'https://www.smanpower.com/test')).toBe('https://smanpower.com/test');
    expect(buildCanonicalUrl('/test', 'https://smanpower-secure.workers.dev/test')).toBe('https://smanpower.com/test');
    expect(buildCanonicalUrl('/test', 'https://smanpower.vercel.app/test')).toBe('https://smanpower.com/test');
    expect(buildCanonicalUrl('/test', 'http://localhost:3000/test')).toBe('https://smanpower.com/test');
  });

  it('rejects invalid canonical overrides and falls back to original path', () => {
    expect(buildCanonicalUrl('/test', 'not-a-url')).toBe('https://smanpower.com/test');
  });
});

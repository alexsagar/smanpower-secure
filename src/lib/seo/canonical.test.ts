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

  it('accepts valid https canonical overrides', () => {
    expect(buildCanonicalUrl('/test', 'https://example.com/other')).toBe('https://example.com/other');
  });

  it('rejects invalid canonical overrides and falls back to original path', () => {
    expect(buildCanonicalUrl('/test', 'not-a-url')).toBe('https://smanpower.com/test');
  });
});

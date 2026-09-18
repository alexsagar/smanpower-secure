import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDemandExpired, isDemandIndexable } from '../demand-eligibility';
import { buildDynamicPageMetadata } from '@/services/dynamic-page.service';
import { trustContent } from '../content';
import { CONTACT, BRAND } from '../constants';
import { demoStatistics } from '@/demo-data/homepage';
import { aboutPage } from '@/demo-data/pages/about';

// Mock repository calls to isolate service logic from database connection in unit tests
vi.mock('@/repositories/content-resolver', () => ({
  getPageBySlug: vi.fn().mockResolvedValue(null),
}));

// Mock next/navigation notFound
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

beforeEach(() => {
  process.env.SITE_URL = 'https://smanpower.com';
});

describe('Phase B: Demand Expiry and Indexability Policies', () => {
  it('marks published demands with future deadlines as active and indexable', () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    const demand = {
      status: 'PUBLISHED',
      isPublic: true,
      applicationDeadline: futureDate,
      positions: [{ status: 'OPEN', isPublic: true }],
    };

    expect(isDemandExpired(demand)).toBe(false);
    expect(isDemandIndexable(demand)).toBe(true);
  });

  it('marks published demands with past deadlines as expired and non-indexable (noindex, follow)', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const demand = {
      status: 'PUBLISHED',
      isPublic: true,
      applicationDeadline: pastDate,
      positions: [{ status: 'OPEN', isPublic: true }],
    };

    expect(isDemandExpired(demand)).toBe(true);
    expect(isDemandIndexable(demand)).toBe(false);
  });

  it('marks non-published or private demands as non-indexable', () => {
    const demandDraft = {
      status: 'DRAFT',
      isPublic: true,
      positions: [{ status: 'OPEN' }],
    };
    expect(isDemandIndexable(demandDraft)).toBe(false);

    const demandPrivate = {
      status: 'PUBLISHED',
      isPublic: false,
      positions: [{ status: 'OPEN' }],
    };
    expect(isDemandIndexable(demandPrivate)).toBe(false);
  });

  it('considers position-level deadline overrides for expiry check', () => {
    const pastDemandDeadline = new Date(Date.now() - 86400000 * 5).toISOString();
    const futurePositionDeadline = new Date(Date.now() + 86400000 * 5).toISOString();

    const demandWithExtendedPosition = {
      status: 'PUBLISHED',
      isPublic: true,
      applicationDeadline: pastDemandDeadline,
      positions: [
        { status: 'OPEN', isPublic: true, deadlineOverride: futurePositionDeadline },
      ],
    };

    expect(isDemandExpired(demandWithExtendedPosition)).toBe(false);
    expect(isDemandIndexable(demandWithExtendedPosition)).toBe(true);
  });
});

describe('Phase B: Dynamic Route Soft 404 Prevention', () => {
  it('throws notFound error when requested dynamic page slug does not exist', async () => {
    await expect(
      buildDynamicPageMetadata('trust-centre', 'non-existent-slug-xyz')
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('returns valid metadata and canonical path when page exists', async () => {
    const metadata = await buildDynamicPageMetadata('trust-centre', 'company-facts');

    expect(metadata.title).toContain('Official Company Facts');
    expect(metadata.alternates?.canonical).toBe('https://smanpower.com/trust-centre/company-facts');
  });
});

describe('Phase B: Company Facts & Trust Centre Content', () => {
  it('includes company-facts page in trustContent repository', () => {
    const page = trustContent.find((p) => p.slug === 'company-facts');
    expect(page).toBeDefined();
    expect(page?.title).toBe('Official Company Facts & Verified Data.');
    expect(page?.sections?.length || page?.features?.length).toBeGreaterThan(0);
    
    // Check that core facts are present in content
    const text = JSON.stringify(page);
    expect(text).toContain('2010');
    expect(text).toContain('150,000+');
    expect(text).toContain('350+');
    expect(text).toContain('Zero Recruitment Fees');
    expect(text).toContain('ISO 9001:2015');
    expect(text).not.toContain('Metropolitan City');
  });

  it('reconciles statistics across constants and demo fixtures to approved facts', () => {
    expect(BRAND.establishedYear).toBe('2010');
    expect(BRAND.legalName).toBe('Seven Seas Intercontinental Services Pvt. Ltd.');
    
    // Homepage demo statistics
    const statEst = demoStatistics.find(s => s.id === 'stat-1');
    expect(statEst?.value).toBe('2010');
    expect(statEst?.description).toBe('Since 2010');

    const statPartners = demoStatistics.find(s => s.id === 'stat-2');
    expect(statPartners?.value).toBe('350');
    expect(statPartners?.description).toBe('Employer Partners');

    const statWorkers = demoStatistics.find(s => s.id === 'stat-3');
    expect(statWorkers?.value).toBe('150k');
    expect(statWorkers?.description).toBe('Workers Deployed');

    const statRba = demoStatistics.find(s => s.id === 'stat-6');
    expect(statRba?.value).toBe('RBA');
    expect(statRba?.description).toBe('Aligned Framework');

    // About page demo statistics
    const statsBlock = aboutPage.blocks?.find(b => b.blockKey === 'stats');
    const aboutStats = (statsBlock?.content as any)?.stats;
    expect(aboutStats?.find((s: any) => s.label === 'Established')?.value).toBe('Since 2010');
    expect(aboutStats?.find((s: any) => s.label === 'Employer Partners')?.value).toBe('350+');
    expect(aboutStats?.find((s: any) => s.label === 'Workers Deployed')?.value).toBe('150,000+');
  });

  it('verifies primary contact address and phone without Metropolitan City', () => {
    expect(CONTACT.address).toBe('DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal');
    expect(CONTACT.address).not.toMatch(/Metropolitan City/i);
    expect(CONTACT.phone).toBe('+977 1 5107440');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isEligibleForJobPostingSchema,
  buildJobPostingSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildNewsArticleSchema,
  buildFaqSchema,
  buildOrganizationSchema,
} from './schema';
import * as siteConfig from './site-config';

vi.mock('./site-config', () => ({
  getSiteUrl: vi.fn(() => 'https://smanpower.com'),
  siteConfig: { name: 'Seven Seas Intercontinental' }
}));

describe('JobPosting Schema Eligibility', () => {
  beforeEach(() => {
    process.env.DEMO_MODE = 'false';
    process.env.QA_MODE = 'false';
  });

  it('rejects if environment is DEMO or QA mode', () => {
    process.env.DEMO_MODE = 'true';
    const demand = { status: 'PUBLISHED', isPublic: true, enableApplication: true, title: 'Test', companyName: 'Corp', country: { name: 'Qatar' } };
    const position = { status: 'OPEN', isPublic: true, title: 'Engineer' };
    
    expect(isEligibleForJobPostingSchema({ demand, position })).toBe(false);
  });

  it('rejects if demand is not PUBLISHED', () => {
    const demand = { status: 'DRAFT', isPublic: true, enableApplication: true, title: 'Test', companyName: 'Corp', country: { name: 'Qatar' } };
    const position = { status: 'OPEN', isPublic: true, title: 'Engineer' };
    
    expect(isEligibleForJobPostingSchema({ demand, position })).toBe(false);
  });

  it('rejects if demand is not public or application is disabled', () => {
    const demand = { status: 'PUBLISHED', isPublic: false, enableApplication: true, title: 'Test', companyName: 'Corp', country: { name: 'Qatar' } };
    const position = { status: 'OPEN', isPublic: true, title: 'Engineer' };
    
    expect(isEligibleForJobPostingSchema({ demand, position })).toBe(false);
  });

  it('rejects if position is not OPEN or not public', () => {
    const demand = { status: 'PUBLISHED', isPublic: true, enableApplication: true, title: 'Test', companyName: 'Corp', country: { name: 'Qatar' } };
    const position = { status: 'CLOSED', isPublic: true, title: 'Engineer' };
    
    expect(isEligibleForJobPostingSchema({ demand, position })).toBe(false);
  });

  it('accepts eligible demand and position', () => {
    const demand = { status: 'PUBLISHED', isPublic: true, enableApplication: true, title: 'Test', companyName: 'Corp', country: { name: 'Qatar' } };
    const position = { status: 'OPEN', isPublic: true, title: 'Engineer' };
    
    expect(isEligibleForJobPostingSchema({ demand, position })).toBe(true);
  });
});

describe('buildJobPostingSchema', () => {
  it('returns null for ineligible position', () => {
    const demand = { status: 'DRAFT' };
    const position = { status: 'OPEN', isPublic: true, title: 'Engineer' };
    expect(buildJobPostingSchema(demand, position)).toBeNull();
  });

  it('returns valid JobPosting for eligible position', () => {
    const demand = {
      status: 'PUBLISHED', isPublic: true, enableApplication: true,
      title: 'Site Engineer Required', companyName: 'BuildCorp',
      country: { name: 'Qatar', code: 'QA' },
      applicationDeadline: '2026-12-31T00:00:00Z',
      demandReferenceNumber: 'LOT-2026-042',
      slug: 'site-engineer-qatar',
    };
    const position = { status: 'OPEN', isPublic: true, title: 'Site Engineer' };

    const schema = buildJobPostingSchema(demand, position);
    expect(schema).not.toBeNull();
    expect(schema?.["@type"]).toBe('JobPosting');
    expect(schema?.title).toBe('Site Engineer');
    expect(schema?.hiringOrganization.name).toBe('BuildCorp');
    expect(schema?.validThrough).toBe('2026-12-31T00:00:00.000Z');
    // Refinements: directApply, real lot-number identifier.
    expect(schema?.directApply).toBe(true);
    expect(schema?.identifier?.value).toBe('LOT-2026-042');
    // No fabricated employment type or salary.
    expect((schema as any)?.employmentType).toBeUndefined();
    expect(schema?.baseSalary).toBeUndefined();
  });

  it('suppresses JobPosting when the deadline has passed (expired)', () => {
    const demand = {
      status: 'PUBLISHED', isPublic: true, enableApplication: true,
      title: 'Expired Role', companyName: 'BuildCorp', country: { name: 'Qatar' },
      applicationDeadline: '2020-01-01T00:00:00Z',
    };
    const position = { status: 'OPEN', isPublic: true, title: 'Welder' };
    expect(buildJobPostingSchema(demand, position)).toBeNull();
  });

  it('emits baseSalary only when a genuine amount and currency are stored', () => {
    const demand = {
      status: 'PUBLISHED', isPublic: true, enableApplication: true,
      title: 'Paid Role', companyName: 'BuildCorp', country: { name: 'Qatar' },
      applicationDeadline: '2026-12-31T00:00:00Z', slug: 'paid-role',
    };
    const position = { status: 'OPEN', isPublic: true, title: 'Mason', salaryAmount: 1200, salaryCurrency: 'QAR' };
    const schema = buildJobPostingSchema(demand, position);
    expect(schema?.baseSalary?.currency).toBe('QAR');
    expect(schema?.baseSalary?.value?.value).toBe(1200);
  });
});

describe('site-level structured data', () => {
  it('WebSite uses the #website stable id and a working SearchAction target', () => {
    const s = buildWebSiteSchema({ companyName: 'Seven Seas Intercontinental' } as any);
    expect(s?.["@id"]).toBe('https://smanpower.com/#website');
    expect(s?.publisher["@id"]).toBe('https://smanpower.com/#organization');
    expect(s?.potentialAction.target.urlTemplate).toBe('https://smanpower.com/search?q={search_term_string}');
  });

  it('WebPage keys to the real canonical and links the WebSite', () => {
    const s = buildWebPageSchema({ canonicalUrl: 'https://smanpower.com/employers/x', name: 'X' });
    expect(s?.["@id"]).toBe('https://smanpower.com/employers/x#webpage');
    expect(s?.url).toBe('https://smanpower.com/employers/x');
    expect(s?.isPartOf["@id"]).toBe('https://smanpower.com/#website');
  });

  it('BreadcrumbList preserves order and positions', () => {
    const s = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://smanpower.com' },
      { name: 'Employers', url: 'https://smanpower.com/employers' },
      { name: 'Detail', url: 'https://smanpower.com/employers/detail' },
    ]);
    expect(s?.itemListElement).toHaveLength(3);
    expect(s?.itemListElement[0].position).toBe(1);
    expect(s?.itemListElement[2].name).toBe('Detail');
    expect(s?.itemListElement[2].item).toBe('https://smanpower.com/employers/detail');
  });

  it('NewsArticle emits stored fields only', () => {
    const s = buildNewsArticleSchema({ title: 'Notice', slug: 'notice', publishDate: '2026-07-01T00:00:00Z' });
    expect(s?.["@type"]).toBe('NewsArticle');
    expect(s?.url).toBe('https://smanpower.com/news/notice');
    expect(s?.datePublished).toBe('2026-07-01T00:00:00.000Z');
  });

  it('FAQPage returns null when there are no visible Q&A', () => {
    expect(buildFaqSchema([])).toBeNull();
    const s = buildFaqSchema([{ q: 'How?', a: 'Like this.' }]);
    expect(s?.mainEntity[0].acceptedAnswer.text).toBe('Like this.');
  });
});

describe('Organization schema', () => {
  it('uses stable ids, verified Kathmandu address, and no foreign offices', () => {
    const org: any = buildOrganizationSchema(
      {
        companyName: 'Seven Seas Intercontinental',
        companyLegalName: 'Seven Seas Intercontinental Services Pvt. Ltd.',
        address: 'Guheswori',
        city: 'Kathmandu',
        province: 'Bagmati',
        country: 'Nepal',
        phone: '01-5107440',
        email: 'info@smanpower.com',
      } as any,
      { socialLinks: [{ url: 'https://www.facebook.com/x', isActive: true }] } as any
    );
    expect(org['@id']).toBe('https://smanpower.com/#organization');
    expect(org.url).toBe('https://smanpower.com');
    expect(org.address.addressLocality).toBe('Kathmandu');
    expect(org.address.addressCountry).toBe('Nepal');
    const json = JSON.stringify(org);
    expect(json).not.toMatch(/Dubai|Doha/i);
    expect(org.location).toBeUndefined();
    expect(org.branch).toBeUndefined();
    for (const url of org.sameAs || []) {
      expect(url).not.toMatch(/rba\.png|sedex\.png|iso\.png/);
    }
  });
});

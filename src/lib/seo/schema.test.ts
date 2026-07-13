import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isEligibleForJobPostingSchema, buildJobPostingSchema } from './schema';
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
      applicationDeadline: '2026-12-31T00:00:00Z'
    };
    const position = { status: 'OPEN', isPublic: true, title: 'Site Engineer' };
    
    const schema = buildJobPostingSchema(demand, position);
    expect(schema).not.toBeNull();
    expect(schema?.["@type"]).toBe('JobPosting');
    expect(schema?.title).toBe('Site Engineer');
    expect(schema?.hiringOrganization.name).toBe('BuildCorp');
    expect(schema?.validThrough).toBe('2026-12-31T00:00:00.000Z');
  });
});

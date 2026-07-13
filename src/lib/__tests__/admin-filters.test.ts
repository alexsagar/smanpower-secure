import { describe, expect, it } from 'vitest';
import { 
  PaginationSchema, 
  DemandFilterSchema, 
  LeadFilterSchema 
} from '../schemas/admin-filters';

describe('Admin Filters', () => {
  it('Valid pagination', () => {
    const res = PaginationSchema.safeParse({ page: 2, limit: 20 });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.page).toBe(2);
      expect(res.data.limit).toBe(20);
    }
  });

  it('Invalid page values fallback or fail', () => {
    // page 0 becomes default because minimum is 1? No, minimum is 1 so it fails.
    const res = PaginationSchema.safeParse({ page: 0 });
    expect(res.success).toBe(false);
  });

  it('Excessive page size', () => {
    const res = PaginationSchema.safeParse({ limit: 1000 });
    expect(res.success).toBe(false);
  });

  it('Valid status enum', () => {
    const res = DemandFilterSchema.safeParse({ status: 'PUBLISHED' });
    expect(res.success).toBe(true);
  });

  it('Invalid status', () => {
    const res = DemandFilterSchema.safeParse({ status: 'FAKE_STATUS' });
    expect(res.success).toBe(false);
  });

  it('Valid sort field', () => {
    const res = DemandFilterSchema.safeParse({ sortBy: 'title' });
    expect(res.success).toBe(true);
  });

  it('Invalid sort field', () => {
    const res = DemandFilterSchema.safeParse({ sortBy: 'fakeField' });
    expect(res.success).toBe(false);
  });

  it('Valid sort direction', () => {
    const res = DemandFilterSchema.safeParse({ sortOrder: 'asc' });
    expect(res.success).toBe(true);
  });

  it('Invalid sort direction', () => {
    const res = DemandFilterSchema.safeParse({ sortOrder: 'up' });
    expect(res.success).toBe(false);
  });

  it('Safe defaults where intended', () => {
    const res = LeadFilterSchema.parse({});
    expect(res.page).toBe(1);
    expect(res.limit).toBe(50);
    expect(res.sortBy).toBe('createdAt');
    expect(res.sortOrder).toBe('desc');
  });
});

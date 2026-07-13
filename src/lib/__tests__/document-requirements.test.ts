import { describe, it, expect, vi } from 'vitest';
import { resolveDocumentRequirements } from '../document-requirements';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    applicationDocumentRequirement: {
      findMany: vi.fn(),
    },
  },
}));

describe('resolveDocumentRequirements', () => {
  it('overrides demand-level requirements with position-level ones', async () => {
    vi.mocked(prisma.applicationDocumentRequirement.findMany).mockImplementation(async (query: any) => {
      if (query.where.positionId === null) {
        return [
          { documentType: 'CV', required: true, maxSizeMb: 2, allowedMimeTypes: 'application/pdf' },
          { documentType: 'PHOTO', required: true, maxSizeMb: 2, allowedMimeTypes: 'image/jpeg' },
        ];
      } else {
        return [
          { documentType: 'CV', required: false, maxSizeMb: 5, allowedMimeTypes: 'application/pdf' },
        ];
      }
    });

    const result = await resolveDocumentRequirements('demand-1', 'pos-1');
    expect(result.length).toBe(2);
    
    const cv = result.find(r => r.documentType === 'CV');
    expect(cv?.required).toBe(false);
    expect(cv?.maxSizeMb).toBe(5);

    const photo = result.find(r => r.documentType === 'PHOTO');
    expect(photo?.required).toBe(true);
  });
});

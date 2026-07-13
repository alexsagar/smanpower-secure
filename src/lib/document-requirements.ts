import { ApplicationDocumentRequirement, DocumentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Resolves the final list of document requirements by merging demand-level
 * and position-level rules.
 * 
 * Merge Rule:
 * 1. Load demand-level requirements.
 * 2. Load requirements for the selected position.
 * 3. A position-level requirement overrides the demand-level requirement for the same DocumentType.
 * 4. Requirements that exist at only one level remain active.
 * 5. The final result contains exactly one rule per DocumentType.
 */
export async function resolveDocumentRequirements(demandId: string, positionId?: string | null): Promise<ApplicationDocumentRequirement[]> {
  const demandRequirements = await prisma.applicationDocumentRequirement.findMany({
    where: {
      demandId: demandId,
      positionId: null, // Null means it's a demand-level requirement
    },
  });

  let positionRequirements: ApplicationDocumentRequirement[] = [];
  if (positionId) {
    positionRequirements = await prisma.applicationDocumentRequirement.findMany({
      where: {
        demandId: demandId,
        positionId: positionId,
      },
    });
  }

  const resolvedMap = new Map<DocumentType, ApplicationDocumentRequirement>();

  // Apply demand-level requirements
  for (const req of demandRequirements) {
    resolvedMap.set(req.documentType, req);
  }

  // Apply position-level requirements, overriding any existing demand-level ones
  for (const req of positionRequirements) {
    resolvedMap.set(req.documentType, req);
  }

  return Array.from(resolvedMap.values());
}

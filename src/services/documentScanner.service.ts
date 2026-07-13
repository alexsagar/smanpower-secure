import { prisma } from '@/lib/prisma';
import { DocumentStatus } from '@prisma/client';

export class DocumentScannerService {
  /**
   * Allowed state transitions for a candidate document.
   */
  private static readonly ALLOWED_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
    PENDING_SCAN: ['SCANNING', 'SAFE', 'REJECTED'],
    SCANNING: ['SAFE', 'REJECTED', 'SCAN_FAILED'],
    SAFE: [], // No arbitrary backward transitions
    REJECTED: [], 
    SCAN_FAILED: ['SCANNING', 'SAFE'],
  };

  /**
   * Manually override a document's status. Requires admin review note and user ID.
   */
  static async manualStatusOverride(
    documentId: string,
    newStatus: DocumentStatus,
    adminUserId: string,
    reviewNote: string,
    ipAddress?: string
  ) {
    if (!reviewNote || reviewNote.trim().length === 0) {
      throw new Error("A review reason is required for manual status overrides.");
    }

    return prisma.$transaction(async (tx) => {
      const doc = await tx.candidateDocument.findUnique({
        where: { id: documentId }
      });

      if (!doc) throw new Error("Document not found");

      const allowedNext = this.ALLOWED_TRANSITIONS[doc.status];
      if (!allowedNext.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${doc.status} to ${newStatus}`);
      }

      const updated = await tx.candidateDocument.update({
        where: { id: documentId },
        data: { status: newStatus }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          entity: "CandidateDocument",
          entityId: documentId,
          action: "DOCUMENT_STATUS_OVERRIDE",
          details: `Manual transition from ${doc.status} to ${newStatus}. Reason: ${reviewNote}`,
          ipAddress
        }
      });

      return updated;
    });
  }
}

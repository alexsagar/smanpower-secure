import { DemandStatus } from "@prisma/client";

/**
 * A demand is eligible for readvertisement once it is no longer live: either
 * explicitly CLOSED, or still PUBLISHED but past its application deadline.
 * Drafts, archived and soft-deleted records are never eligible.
 *
 * Lives outside the "use server" action module because that file may only
 * export async functions.
 */
/**
 * Whether a demand may be shown on its public detail page. Open and expired
 * (PUBLISHED) demands and CLOSED demands remain accessible as historical
 * informational pages; DRAFT, UNDER_REVIEW, ARCHIVED, private (isPublic=false)
 * and soft-deleted demands are not publicly viewable (the page returns 404).
 * Soft-deletion is enforced at the query level (getDemandBySlug), so a demand
 * reaching this check is already non-deleted.
 */
export function isDemandPubliclyViewable(demand: {
  status: DemandStatus | string;
  isPublic: boolean;
}): boolean {
  return (
    demand.isPublic === true &&
    (demand.status === DemandStatus.PUBLISHED || demand.status === DemandStatus.CLOSED)
  );
}

export function isReadvertisable(demand: {
  status: DemandStatus;
  applicationDeadline: Date | null;
  deletedAt?: Date | null;
}): boolean {
  if (demand.deletedAt) return false;
  if (demand.status === DemandStatus.CLOSED) return true;
  return (
    demand.status === DemandStatus.PUBLISHED &&
    demand.applicationDeadline !== null &&
    demand.applicationDeadline < new Date()
  );
}

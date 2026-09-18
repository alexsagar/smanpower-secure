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

/**
 * Whether a demand is expired or closed.
 * A demand is considered expired if it is explicitly CLOSED, or has a closedAt date,
 * or has an applicationDeadline that is in the past.
 */
export function isDemandExpired(demand: {
  status: DemandStatus | string;
  applicationDeadline?: Date | string | null;
  closedAt?: Date | string | null;
  positions?: Array<{ deadlineOverride?: Date | string | null; status?: string; isPublic?: boolean }>;
}): boolean {
  if (demand.status === DemandStatus.CLOSED || Boolean(demand.closedAt)) {
    return true;
  }
  if (demand.positions && demand.positions.length > 0) {
    const hasActivePosition = demand.positions.some((pos) => {
      if (pos.status && pos.status !== "OPEN") return false;
      const deadline = pos.deadlineOverride || demand.applicationDeadline;
      return deadline && new Date(deadline).getTime() > Date.now();
    });
    if (hasActivePosition) return false;
  }
  if (demand.applicationDeadline) {
    return new Date(demand.applicationDeadline).getTime() < Date.now();
  }
  return false;
}

/**
 * Authoritative rule for search engine indexation of demands:
 * - Active, published, public demands are indexable (index, follow).
 * - Expired or closed demands remain accessible to visitors (HTTP 200) as historical
 *   records, but must emit noindex, follow to keep search indexes fresh.
 * - Non-public, draft, or soft-deleted records are not indexable.
 */
export function isDemandIndexable(demand: {
  status: DemandStatus | string;
  isPublic: boolean;
  applicationDeadline?: Date | string | null;
  closedAt?: Date | string | null;
  deletedAt?: Date | string | null;
  positions?: Array<{ deadlineOverride?: Date | string | null; status?: string; isPublic?: boolean }>;
}): boolean {
  if (demand.deletedAt || !demand.isPublic || demand.status !== DemandStatus.PUBLISHED) {
    return false;
  }
  return !isDemandExpired(demand);
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

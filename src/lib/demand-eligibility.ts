import { DemandStatus } from "@prisma/client";

/**
 * A demand is eligible for readvertisement once it is no longer live: either
 * explicitly CLOSED, or still PUBLISHED but past its application deadline.
 * Drafts, archived and soft-deleted records are never eligible.
 *
 * Lives outside the "use server" action module because that file may only
 * export async functions.
 */
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

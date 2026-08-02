import { prisma } from "@/lib/prisma";
import { DEMO_MODE } from "@/config/demo";
import { demoDemands } from "@/demo-data/demands";
import { DEMAND_PERMISSIONS, requirePermission } from "@/lib/permissions";
import { Prisma } from "@prisma/client";

/**
 * Get all demands for the admin list view.
 */
export async function getAdminDemands() {
  await requirePermission(DEMAND_PERMISSIONS.VIEW);

  if (DEMO_MODE) {
    return demoDemands.map(d => ({
      ...d,
      _count: {
        positions: d.positions.length,
        applications: 0,
      }
    }));
  }

  const results = await prisma.demand.findMany({
    include: {
      country: true,
      industry: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          positions: true,
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return results.map(r => ({
    ...r,
    country: r.country?.name || "Unknown",
    industry: r.industry?.name || "Unknown",
  }));
}

/**
 * Get a single demand by ID with all relations for the edit form.
 */
export async function getAdminDemandById(id: string) {
  await requirePermission(DEMAND_PERMISSIONS.VIEW);

  if (DEMO_MODE) {
    const demand = demoDemands.find((d) => d.id === id);
    if (!demand) return null;
    return demand; // The demo demands already include positions and documents
  }

  const result = await prisma.demand.findUnique({
    where: { id },
    include: {
      positions: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      documents: {
        include: {
          mediaAsset: true,
        },
      },
      featuredImage: true,
      country: true,
      industry: true,
    },
  });

  if (!result) return null;

  return {
    ...result,
    country: result.country?.name || "Unknown",
    industry: result.industry?.name || "Unknown",
  };
}

/**
 * Create a new demand along with its positions and documents.
 */
export async function createDemand(data: unknown) {
  await requirePermission(DEMAND_PERMISSIONS.CREATE);

  if (DEMO_MODE) {
    throw new Error("Cannot create demands in demo mode.");
  }

  // Implementation left for the actions layer where parsing happens, 
  // or could be fully extracted here. For now, we will handle the complex
  // multi-step nested creation in the server action using transaction.
  throw new Error("Not implemented here. Handled in server actions via transaction.");
}

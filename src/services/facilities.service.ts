// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE, demoFallback } from "@/config/demo";
import { demoTrainingFacilities } from "@/data/demo/facilities";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function getTrainingFacilities() {
  if (DEMO_MODE) {
    return demoTrainingFacilities;
  }

  try {
    return await prisma.trainingFacility.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    logger.error("Failed to load training facilities", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoTrainingFacilities, []);
  }
}

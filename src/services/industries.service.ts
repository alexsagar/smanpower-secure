// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE, demoFallback } from "@/config/demo";
import { demoIndustries } from "@/data/demo/industries";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function getIndustries() {
  if (DEMO_MODE) {
    return demoIndustries;
  }

  try {
    return await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    logger.error("Failed to load industries", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoIndustries, []);
  }
}

// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE, demoFallback } from "@/config/demo";
import { demoComplianceDocs } from "@/data/demo/compliance";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function getComplianceDocuments() {
  if (DEMO_MODE) {
    return demoComplianceDocs;
  }

  try {
    return await prisma.complianceDocument.findMany({
      where: { isPublic: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
  } catch (error) {
    logger.error("Failed to load public compliance documents", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoComplianceDocs, []);
  }
}

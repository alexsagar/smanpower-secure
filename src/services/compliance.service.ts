// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE } from "@/config/demo";
import { demoComplianceDocs } from "@/data/demo/compliance";
import { prisma } from "@/lib/prisma";

export async function getComplianceDocuments() {
  if (DEMO_MODE) {
    return demoComplianceDocs;
  }

  try {
    return await prisma.complianceDocument.findMany({
      where: { isPublic: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return demoComplianceDocs;
  }
}

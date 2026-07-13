// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE } from "@/config/demo";
import { demoTrainingFacilities } from "@/data/demo/facilities";
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
  } catch {
    return demoTrainingFacilities;
  }
}

// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE, demoFallback } from "@/config/demo";
import { demoSuccessStories } from "@/data/demo/stories";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function getSuccessStories() {
  if (DEMO_MODE) {
    return demoSuccessStories;
  }

  try {
    return await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    logger.error("Failed to load success stories", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoSuccessStories, []);
  }
}

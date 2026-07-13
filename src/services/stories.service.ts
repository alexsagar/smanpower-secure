// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE } from "@/config/demo";
import { demoSuccessStories } from "@/data/demo/stories";
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
  } catch {
    return demoSuccessStories;
  }
}

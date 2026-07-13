// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE } from "@/config/demo";
import { demoJobs } from "@/data/demo/jobs";
import { prisma } from "@/lib/prisma";

export async function getJobs(filters?: { country?: string; industry?: string }) {
  if (DEMO_MODE) {
    let result = [...demoJobs];
    if (filters?.country) {
      result = result.filter((j) => j.country.code === filters.country);
    }
    if (filters?.industry) {
      result = result.filter((j) => j.industry.slug === filters.industry);
    }
    return result;
  }

  try {
    return await prisma.job.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        ...(filters?.country ? { country: { code: filters.country } } : {}),
        ...(filters?.industry ? { industry: { slug: filters.industry } } : {}),
      },
      include: {
        country: true,
        industry: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return demoJobs;
  }
}

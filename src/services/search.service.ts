// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE } from "@/config/demo";
import { demoJobs } from "@/data/demo/jobs";
import { demoSuccessStories } from "@/data/demo/stories";
import { demoTrainingFacilities } from "@/data/demo/facilities";
import { demoIndustries } from "@/data/demo/industries";
import { prisma } from "@/lib/prisma";

export async function searchGlobalData(query: string) {
  if (!query) {
    return { jobs: [], stories: [], facilities: [], industries: [] };
  }

  if (DEMO_MODE) {
    const q = query.toLowerCase();
    const jobs = demoJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.employerName && j.employerName.toLowerCase().includes(q))
    );
    const stories = demoSuccessStories.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.personName?.toLowerCase().includes(q) ||
        s.summary?.toLowerCase().includes(q)
    );
    const facilities = demoTrainingFacilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.location && f.location.toLowerCase().includes(q))
    );
    const industries = demoIndustries.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
    return { jobs, stories, facilities, industries };
  }

  try {
    const [jobs, stories, facilities, industries] = await Promise.all([
      prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { employerName: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { country: true, industry: true },
        take: 10,
      }),
      prisma.successStory.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { personName: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.trainingFacility.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.industry.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);
    return { jobs, stories, facilities, industries };
  } catch {
    return { jobs: [], stories: [], facilities: [], industries: [] };
  }
}

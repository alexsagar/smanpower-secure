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
    const [demands, stories, facilities, industries] = await Promise.all([
      // Search published demands, not the legacy `Job` model. Job has no public
      // detail route (search previously linked to /jobs/[slug], which 404s);
      // the real public job page is /demands/[slug].
      prisma.demand.findMany({
        where: {
          status: "PUBLISHED",
          isPublic: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { generalNotes: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { country: true, industry: true, positions: { select: { totalCount: true } } },
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
    // Shape demands to the fields the search UI already expects for "jobs".
    const jobs = demands.map((d: any) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      country: { name: d.country?.name || "" },
      industry: { name: d.industry?.name || "" },
      vacancies: (d.positions || []).reduce((sum: number, p: any) => sum + (p.totalCount || 0), 0),
      employerName: d.companyName || null,
      showEmployerName: Boolean(d.companyName),
    }));
    return { jobs, stories, facilities, industries };
  } catch {
    return { jobs: [], stories: [], facilities: [], industries: [] };
  }
}

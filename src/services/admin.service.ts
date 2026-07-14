// TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
import { DEMO_MODE, demoFallback } from "@/config/demo";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { 
  requirePermission, 
  APPLICATION_PERMISSIONS,
  CAREER_PERMISSIONS,
  NEWS_PERMISSIONS,
  MEDIA_PERMISSIONS,
  USER_PERMISSIONS,
  SUCCESS_STORY_PERMISSIONS,
  INSIGHT_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  SEO_PERMISSIONS,
  DEMAND_PERMISSIONS
} from "@/lib/permissions";
import {
  demoAdminStats,
  demoCandidates,
  demoLeads,
  demoUsers,
  demoMediaAssets,
  demoWorkforceDatasets,
} from "@/data/demo/admin";
import { demoJobs } from "@/data/demo/jobs";
import { demoSuccessStories } from "@/data/demo/stories";
import { demoTrainingFacilities } from "@/data/demo/facilities";
import { demoComplianceDocs } from "@/data/demo/compliance";
import { demoIndustries } from "@/data/demo/industries";
import { demoDemands } from "@/demo-data/demands";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { 
  DemandFilterSchema, 
  ApplicationFilterSchema, 
  CandidateFilterSchema, 
  MediaFilterSchema, 
  LeadFilterSchema, 
  JobFilterSchema 
} from "@/lib/schemas/admin-filters";

const EMPTY_ADMIN_STATS = {
  totalJobs: 0,
  activeJobs: 0,
  submittedApplications: 0,
  totalApplications: 0,
  usersCount: 0,
  insightsCount: 0,
  storiesCount: 0,
};

export async function getAdminDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (DEMO_MODE) return demoAdminStats;

  try {
    const [
      totalDemands,
      activeDemands,
      submittedApplications,
      totalApplications,
      usersCount,
      insightsCount,
      storiesCount,
    ] = await Promise.all([
      prisma.demand.count({ where: { deletedAt: null } }),
      prisma.demand.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.demandApplication.count({ where: { status: "SUBMITTED" } }),
      prisma.demandApplication.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.insightArticle.count({ where: { deletedAt: null } }),
      prisma.successStory.count({ where: { deletedAt: null } }),
    ]);
    return {
      totalJobs: totalDemands,
      activeJobs: activeDemands,
      submittedApplications,
      totalApplications,
      usersCount,
      insightsCount,
      storiesCount,
    };
  } catch (error) {
    logger.error("Failed to load admin dashboard stats", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoAdminStats, EMPTY_ADMIN_STATS);
  }
}

export async function getAdminUsers() {
  await requirePermission(USER_PERMISSIONS.VIEW);

  if (DEMO_MODE) return demoUsers;
  try {
    return await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to load admin users", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoUsers, []);
  }
}

/** Assignable roles for the Invite User dropdown (real DB roles). */
export async function getAssignableRoles() {
  await requirePermission(USER_PERMISSIONS.VIEW);

  const roles = await prisma.role.findMany({
    select: { name: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
  return roles;
}

export async function getAdminStories() {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.VIEW);
  if (DEMO_MODE) return demoSuccessStories;
  try {
    return await prisma.successStory.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to load admin stories", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoSuccessStories, []);
  }
}

export async function getAdminStory(id: string) {
  await requirePermission(SUCCESS_STORY_PERMISSIONS.VIEW);
  if (DEMO_MODE) return null;
  return await prisma.successStory.findUnique({
    where: { id }
  });
}

export async function getAdminInsights() {
  await requirePermission(INSIGHT_PERMISSIONS.VIEW);
  if (DEMO_MODE) return [];
  try {
    return await prisma.insightArticle.findMany({
      include: { featuredImage: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminInsight(id: string) {
  await requirePermission(INSIGHT_PERMISSIONS.VIEW);
  if (DEMO_MODE) return null;
  return await prisma.insightArticle.findUnique({
    where: { id },
    include: { featuredImage: true, category: true },
  });
}

export async function getAdminNewsArticles() {
  await requirePermission(NEWS_PERMISSIONS.VIEW);
  if (DEMO_MODE) return [];
  try {
    return await prisma.newsArticle.findMany({
      include: { featuredMedia: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminNewsArticle(id: string) {
  await requirePermission(NEWS_PERMISSIONS.VIEW);
  if (DEMO_MODE) return null;
  return await prisma.newsArticle.findUnique({
    where: { id },
    include: { featuredMedia: true },
  });
}

export async function getAdminCareerOpenings() {
  await requirePermission(CAREER_PERMISSIONS.VIEW);
  if (DEMO_MODE) return [];
  try {
    return await prisma.careerOpening.findMany({
      include: { featuredImage: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminCareerOpening(id: string) {
  await requirePermission(CAREER_PERMISSIONS.VIEW);
  if (DEMO_MODE) return null;
  return await prisma.careerOpening.findUnique({
    where: { id },
    include: { featuredImage: true },
  });
}

export async function getAdminFacilities() {
  if (DEMO_MODE) return demoTrainingFacilities;
  try {
    return await prisma.trainingFacility.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to load admin facilities", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoTrainingFacilities, []);
  }
}

export async function getAdminMediaAssets(rawFilters?: unknown) {
  await requirePermission(MEDIA_PERMISSIONS.VIEW);
  
  const parsed = MediaFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : MediaFilterSchema.parse({});

  if (DEMO_MODE) return demoMediaAssets;
  try {
    return await prisma.mediaAsset.findMany({
      where: {
        ...(filters.visibility ? { isPublic: filters.visibility === "PUBLIC" } : {})
      },
      orderBy: filters.sortBy === "originalName" ? { fileName: filters.sortOrder } :
               filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } :
               { createdAt: filters.sortOrder },
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    });
  } catch (error) {
    logger.error("Failed to load admin media assets", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoMediaAssets, []);
  }
}

export async function getAdminDemands(rawFilters?: unknown) {
  await requirePermission(DEMAND_PERMISSIONS.VIEW);

  const parsed = DemandFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : DemandFilterSchema.parse({});

  if (DEMO_MODE) {
    let demands = demoDemands.map(d => ({
      ...d,
      _count: {
        positions: d.positions.length,
        applications: 0,
      }
    }));
    if (filters.status) demands = demands.filter(d => d.status === filters.status);
    return demands;
  }

  const results = await prisma.demand.findMany({
    where: {
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {})
    },
    include: {
      country: true,
      industry: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          positions: true,
          applications: true,
        },
      },
    } as const,
    orderBy: filters.sortBy === "title" ? { title: filters.sortOrder } :
             filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } :
             { createdAt: filters.sortOrder },
    take: filters.limit,
    skip: (filters.page - 1) * filters.limit,
  });

  return results.map(r => ({
    ...r,
    country: r.country?.name || "Unknown",
    industry: r.industry?.name || "Unknown",
  }));
}

export async function getAdminPages() {
  await requirePermission(SETTINGS_PERMISSIONS.VIEW);
  try {
    return await prisma.cmsPage.findMany({
      orderBy: { slug: "asc" },
      include: {
        hero: true,
        _count: {
          select: { blocks: true }
        }
      }
    });
  } catch {
    return [];
  }
}

export async function getAdminSEOPageMeta() {
  await requirePermission(SEO_PERMISSIONS.VIEW);
  if (DEMO_MODE) return [];
  try {
    return await prisma.sEOPageMeta.findMany({
      orderBy: { pagePath: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminLeads(rawFilters?: unknown) {
  const parsed = LeadFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : LeadFilterSchema.parse({});

  if (DEMO_MODE) {
    if (filters.status) return demoLeads.filter((l) => l.status === filters.status);
    return demoLeads;
  }
  try {
    return await prisma.employerLead.findMany({
      where: {
        deletedAt: null,
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } : { createdAt: filters.sortOrder },
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    });
  } catch (error) {
    logger.error("Failed to load admin leads", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoLeads, []);
  }
}

export async function getAdminJobs(rawFilters?: unknown) {
  const parsed = JobFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : JobFilterSchema.parse({});

  if (DEMO_MODE) return demoJobs;
  try {
    return await prisma.job.findMany({
      where: {
        deletedAt: null,
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: { country: true, industry: true } as const,
      orderBy: filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } : { createdAt: filters.sortOrder },
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    }) as Prisma.JobGetPayload<{ include: { country: true, industry: true } }>[];
  } catch (error) {
    logger.error("Failed to load admin jobs", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoJobs, []);
  }
}

export async function getAdminDatasets() {
  await requirePermission(INSIGHT_PERMISSIONS.VIEW);
  if (DEMO_MODE) return demoWorkforceDatasets;
  try {
    return await prisma.workforceDataset.findMany({
      include: {
        _count: {
          select: {
            metrics: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to load admin datasets", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoWorkforceDatasets, []);
  }
}

export async function getAdminCandidates(rawFilters?: unknown) {
  const parsed = CandidateFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : CandidateFilterSchema.parse({});

  if (DEMO_MODE) return demoCandidates;
  try {
    return await prisma.candidateProfile.findMany({
      where: { deletedAt: null },
      orderBy: filters.sortBy === "fullName" ? { fullName: filters.sortOrder } :
               filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } :
               { createdAt: filters.sortOrder },
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    });
  } catch (error) {
    logger.error("Failed to load admin candidates", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoCandidates, []);
  }
}

export async function getAdminApplications(rawFilters?: unknown) {
  await requirePermission(APPLICATION_PERMISSIONS.VIEW);
  
  const parsed = ApplicationFilterSchema.safeParse(rawFilters || {});
  const filters = parsed.success ? parsed.data : ApplicationFilterSchema.parse({});

  if (DEMO_MODE && process.env.QA_MODE !== "true") return [];
  try {
    return await prisma.demandApplication.findMany({
      where: filters.status ? { status: filters.status } : {},
      include: {
        candidate: { select: { fullName: true, phone: true, email: true } }
      } as const,
      orderBy: filters.sortBy === "status" ? { status: filters.sortOrder } :
               filters.sortBy === "updatedAt" ? { updatedAt: filters.sortOrder } :
               { createdAt: filters.sortOrder },
      skip: (filters.page - 1) * filters.limit,
    }) as Prisma.DemandApplicationGetPayload<{ include: { candidate: { select: { fullName: true, phone: true, email: true } } } }>[];
  } catch (err) {
    logger.error("Failed to fetch admin applications:", err instanceof Error ? err : new Error(String(err)));
    return [];
  }
}

export async function getAdminComplianceDocs() {
  if (DEMO_MODE) return demoComplianceDocs;
  try {
    return await prisma.complianceDocument.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    logger.error("Failed to load admin compliance docs", error instanceof Error ? error : new Error(String(error)));
    return demoFallback(demoComplianceDocs, []);
  }
}

export async function getAdminCountriesAndIndustries() {
  if (DEMO_MODE) {
    return {
      countries: [
        { id: "c-1", name: "United Arab Emirates" },
        { id: "c-2", name: "Qatar" },
        { id: "c-3", name: "Saudi Arabia" },
        { id: "c-4", name: "Kuwait" },
      ],
      industries: demoIndustries.map((i) => ({ id: i.id, name: i.name })),
    };
  }
  try {
    const [countries, industries] = await Promise.all([
      prisma.country.findMany({ select: { id: true, name: true } }),
      prisma.industry.findMany({ select: { id: true, name: true } }),
    ]);
    return { countries, industries };
  } catch (error) {
    logger.error("Failed to load admin countries and industries", error instanceof Error ? error : new Error(String(error)));
    return {
      countries: demoFallback(
        [
          { id: "c-1", name: "United Arab Emirates" },
          { id: "c-2", name: "Qatar" },
        ],
        []
      ),
      industries: demoFallback(
        demoIndustries.map((i) => ({ id: i.id, name: i.name })),
        []
      ),
    };
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/demo", () => ({
  DEMO_MODE: false,
  demoFallback: <T,>(_: T, safeValue: T) => safeValue,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin-1" } }),
}));

vi.mock("@/lib/permissions", () => ({
  requirePermission: vi.fn().mockResolvedValue({ id: "admin-1" }),
  APPLICATION_PERMISSIONS: { VIEW: "applications.view" },
  CAREER_PERMISSIONS: { VIEW: "careers.view" },
  NEWS_PERMISSIONS: { VIEW: "news.view" },
  MEDIA_PERMISSIONS: { VIEW: "media.view" },
  USER_PERMISSIONS: { VIEW: "users.view" },
  SUCCESS_STORY_PERMISSIONS: { VIEW: "success_stories.view" },
  INSIGHT_PERMISSIONS: { VIEW: "insights.view" },
  SETTINGS_PERMISSIONS: { VIEW: "settings.view" },
  SEO_PERMISSIONS: { VIEW: "seo.view" },
  DEMAND_PERMISSIONS: { VIEW: "demands.view" },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    demand: { count: vi.fn().mockRejectedValue(new Error("db down")) },
    demandApplication: {
      count: vi.fn().mockRejectedValue(new Error("db down")),
      findMany: vi.fn().mockRejectedValue(new Error("db down")),
    },
    user: {
      count: vi.fn().mockRejectedValue(new Error("db down")),
      findMany: vi.fn().mockRejectedValue(new Error("db down")),
    },
    insightArticle: {
      count: vi.fn().mockRejectedValue(new Error("db down")),
      findMany: vi.fn().mockRejectedValue(new Error("db down")),
    },
    successStory: {
      count: vi.fn().mockRejectedValue(new Error("db down")),
      findMany: vi.fn().mockRejectedValue(new Error("db down")),
    },
    trainingFacility: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    mediaAsset: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    employerLead: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    job: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    workforceDataset: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    candidateProfile: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    complianceDocument: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    country: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    industry: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    newsArticle: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    careerOpening: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    cmsPage: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
    sEOPageMeta: { findMany: vi.fn().mockRejectedValue(new Error("db down")) },
  },
}));

describe("production read fallbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns safe non-demo values for public read services when prisma fails", async () => {
    const { getComplianceDocuments } = await import("./compliance.service");
    const { getTrainingFacilities } = await import("./facilities.service");
    const { getIndustries } = await import("./industries.service");
    const { getJobs } = await import("./jobs.service");
    const { getSuccessStories } = await import("./stories.service");

    await expect(getComplianceDocuments()).resolves.toEqual([]);
    await expect(getTrainingFacilities()).resolves.toEqual([]);
    await expect(getIndustries()).resolves.toEqual([]);
    await expect(getJobs()).resolves.toEqual([]);
    await expect(getSuccessStories()).resolves.toEqual([]);
  });

  it("returns safe non-demo values for admin reads when prisma fails", async () => {
    const adminService = await import("./admin.service");

    await expect(adminService.getAdminDashboardStats()).resolves.toEqual({
      totalJobs: 0,
      activeJobs: 0,
      submittedApplications: 0,
      totalApplications: 0,
      usersCount: 0,
      insightsCount: 0,
      storiesCount: 0,
    });
    await expect(adminService.getAdminUsers()).resolves.toEqual([]);
    await expect(adminService.getAdminMediaAssets()).resolves.toEqual([]);
    await expect(adminService.getAdminCountriesAndIndustries()).resolves.toEqual({
      countries: [],
      industries: [],
    });
  });
});

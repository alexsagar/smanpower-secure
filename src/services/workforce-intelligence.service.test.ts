import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequirePermission,
  mockLoggerError,
  mockPrisma,
} = vi.hoisted(() => ({
  mockRequirePermission: vi.fn(),
  mockLoggerError: vi.fn(),
  mockPrisma: {
    demandApplication: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    demand: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    job: {
      count: vi.fn(),
    },
    demandPosition: {
      aggregate: vi.fn(),
    },
    candidateDocument: {
      groupBy: vi.fn(),
    },
    workforceMetric: {
      groupBy: vi.fn(),
    },
    workforceDataset: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/config/demo", () => ({
  DEMO_MODE: false,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: mockLoggerError,
  },
}));

vi.mock("@/lib/permissions", () => ({
  INSIGHT_PERMISSIONS: {
    VIEW: "insights.view",
  },
  requirePermission: mockRequirePermission,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("getAdminIntelligenceDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue({ id: "admin-1" });
    mockPrisma.demandApplication.count.mockResolvedValue(11);
    mockPrisma.demand.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);
    mockPrisma.job.count.mockResolvedValue(3);
    mockPrisma.demandPosition.aggregate.mockResolvedValue({
      _sum: { totalCount: 27 },
    });
    mockPrisma.demandApplication.groupBy.mockResolvedValue([
      { status: "UNDER_REVIEW", _count: { _all: 3 } },
      { status: "SUBMITTED", _count: { _all: 8 } },
    ]);
    mockPrisma.candidateDocument.groupBy.mockResolvedValue([
      { status: "SAFE", _count: { _all: 6 } },
      { status: "PENDING_SCAN", _count: { _all: 2 } },
    ]);
    mockPrisma.workforceMetric.groupBy.mockResolvedValue([
      { category: "industry", _count: { _all: 7 } },
      { category: "skill", _count: { _all: 5 } },
    ]);
    mockPrisma.demandApplication.findMany.mockResolvedValue([
      { createdAt: new Date() },
      { createdAt: new Date(Date.now() - 2 * 86_400_000) },
      { createdAt: new Date(Date.now() - 10 * 86_400_000) },
    ]);
    mockPrisma.demand.findMany.mockResolvedValue([
      { country: { name: "United Arab Emirates" }, _count: { applications: 5 } },
      { country: { name: "Qatar" }, _count: { applications: 2 } },
      { country: { name: "United Arab Emirates" }, _count: { applications: 1 } },
    ]);
    mockPrisma.workforceDataset.findMany.mockResolvedValue([
      {
        id: "dataset-2",
        name: "Construction Demand",
        description: "Demand volumes by market",
        dataSource: "Internal CRM",
        sampleSize: 120,
        methodology: "Monthly rollup",
        lastUpdated: new Date("2026-07-10T00:00:00.000Z"),
        isPublic: false,
        _count: { metrics: 7 },
      },
      {
        id: "dataset-1",
        name: "Hospitality Hiring",
        description: null,
        dataSource: null,
        sampleSize: null,
        methodology: null,
        lastUpdated: null,
        isPublic: true,
        _count: { metrics: 5 },
      },
    ]);
  });

  it("returns real aggregate intelligence data with thresholded cohorts", async () => {
    const { getAdminIntelligenceDashboard } = await import("./workforce-intelligence.service");

    const result = await getAdminIntelligenceDashboard();

    expect(mockRequirePermission).toHaveBeenCalledWith("insights.view");
    expect(result.summary).toEqual({
      totalApplications: 11,
      activeDemands: 4,
      closedDemands: 2,
      publishedJobs: 3,
      openVacancies: 27,
      totalDatasets: 2,
      totalMetrics: 12,
      publicDatasets: 1,
    });
    expect(result.applicationStatuses).toEqual([
      { label: "SUBMITTED", value: 8 },
      { label: "UNDER_REVIEW", value: 3 },
    ]);
    expect(result.documentStatuses).toEqual([
      { label: "SAFE", value: 6 },
      { label: "PENDING_SCAN", value: 2 },
    ]);
    expect(result.metricCategories).toEqual([
      { label: "industry", value: 7 },
      { label: "skill", value: 5 },
    ]);
    expect(result.countryBreakdown).toEqual({
      rows: [{ label: "United Arab Emirates", value: 6 }],
      threshold: 3,
      withheldCount: 2,
    });
    expect(result.datasets).toEqual([
      {
        id: "dataset-2",
        name: "Construction Demand",
        description: "Demand volumes by market",
        dataSource: "Internal CRM",
        sampleSize: 120,
        methodology: "Monthly rollup",
        lastUpdated: new Date("2026-07-10T00:00:00.000Z"),
        isPublic: false,
        metricsCount: 7,
      },
      {
        id: "dataset-1",
        name: "Hospitality Hiring",
        description: null,
        dataSource: null,
        sampleSize: null,
        methodology: null,
        lastUpdated: null,
        isPublic: true,
        metricsCount: 5,
      },
    ]);
    expect(result.recentApplicationTrend).toHaveLength(12);
    expect(
      result.recentApplicationTrend.reduce((total, point) => total + point.value, 0)
    ).toBe(3);
  });

  it("fails closed on permission denial", async () => {
    mockRequirePermission.mockRejectedValueOnce(new Error("forbidden"));
    const { getAdminIntelligenceDashboard } = await import("./workforce-intelligence.service");

    await expect(getAdminIntelligenceDashboard()).rejects.toThrow("forbidden");
  });

  it("returns an empty non-demo dashboard on prisma failure", async () => {
    mockPrisma.demandApplication.count.mockRejectedValueOnce(new Error("db down"));
    const { getAdminIntelligenceDashboard } = await import("./workforce-intelligence.service");

    const result = await getAdminIntelligenceDashboard();

    expect(result.summary).toEqual({
      totalApplications: 0,
      activeDemands: 0,
      closedDemands: 0,
      publishedJobs: 0,
      openVacancies: 0,
      totalDatasets: 0,
      totalMetrics: 0,
      publicDatasets: 0,
    });
    expect(result.datasets).toEqual([]);
    expect(result.applicationStatuses).toEqual([]);
    expect(result.documentStatuses).toEqual([]);
    expect(result.metricCategories).toEqual([]);
    expect(result.countryBreakdown).toEqual({
      rows: [],
      threshold: 3,
      withheldCount: 0,
    });
    expect(result.recentApplicationTrend).toHaveLength(12);
    expect(mockLoggerError).toHaveBeenCalledOnce();
  });
});

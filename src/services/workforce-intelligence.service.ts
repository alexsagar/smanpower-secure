import { DEMO_MODE } from "@/config/demo";
import { demoWorkforceDatasets } from "@/data/demo/admin";
import { logger } from "@/lib/logger";
import { INSIGHT_PERMISSIONS, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const MIN_BREAKDOWN_SIZE = 3;
const TREND_BUCKETS = 12;
const TREND_BUCKET_DAYS = 7;

type StatusCount = {
  label: string;
  value: number;
};

type TrendPoint = {
  label: string;
  value: number;
};

type DatasetSummary = {
  id: string;
  name: string;
  description: string | null;
  dataSource: string | null;
  sampleSize: number | null;
  methodology: string | null;
  lastUpdated: Date | null;
  isPublic: boolean;
  metricsCount: number;
};

type BreakdownRow = {
  label: string;
  value: number;
};

export type AdminIntelligenceDashboard = {
  summary: {
    totalApplications: number;
    activeDemands: number;
    closedDemands: number;
    publishedJobs: number;
    openVacancies: number;
    totalDatasets: number;
    totalMetrics: number;
    publicDatasets: number;
  };
  applicationStatuses: StatusCount[];
  documentStatuses: StatusCount[];
  metricCategories: StatusCount[];
  recentApplicationTrend: TrendPoint[];
  countryBreakdown: {
    rows: BreakdownRow[];
    threshold: number;
    withheldCount: number;
  };
  datasets: DatasetSummary[];
};

const EMPTY_DASHBOARD: AdminIntelligenceDashboard = {
  summary: {
    totalApplications: 0,
    activeDemands: 0,
    closedDemands: 0,
    publishedJobs: 0,
    openVacancies: 0,
    totalDatasets: 0,
    totalMetrics: 0,
    publicDatasets: 0,
  },
  applicationStatuses: [],
  documentStatuses: [],
  metricCategories: [],
  recentApplicationTrend: buildEmptyTrend(),
  countryBreakdown: {
    rows: [],
    threshold: MIN_BREAKDOWN_SIZE,
    withheldCount: 0,
  },
  datasets: [],
};

function startOfUtcDay(input: Date) {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
}

function addUtcDays(input: Date, days: number) {
  const copy = new Date(input);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function buildEmptyTrend(): TrendPoint[] {
  const today = startOfUtcDay(new Date());
  const firstBucketStart = addUtcDays(today, -(TREND_BUCKETS - 1) * TREND_BUCKET_DAYS);

  return Array.from({ length: TREND_BUCKETS }, (_, index) => {
    const bucketStart = addUtcDays(firstBucketStart, index * TREND_BUCKET_DAYS);
    return {
      label: bucketStart.toISOString().slice(0, 10),
      value: 0,
    };
  });
}

function buildRecentTrend(createdAtValues: Date[]): TrendPoint[] {
  const buckets = buildEmptyTrend();
  const bucketIndexByLabel = new Map(buckets.map((bucket, index) => [bucket.label, index]));
  const firstBucketStart = new Date(`${buckets[0].label}T00:00:00.000Z`);

  for (const createdAt of createdAtValues) {
    const dayStart = startOfUtcDay(createdAt);
    if (dayStart < firstBucketStart) {
      continue;
    }

    const diffDays = Math.floor((dayStart.getTime() - firstBucketStart.getTime()) / 86_400_000);
    const bucketIndex = Math.floor(diffDays / TREND_BUCKET_DAYS);
    if (bucketIndex < 0 || bucketIndex >= buckets.length) {
      continue;
    }

    const bucketLabel = buckets[bucketIndex]?.label;
    const matchedIndex = bucketLabel ? bucketIndexByLabel.get(bucketLabel) : undefined;
    if (matchedIndex !== undefined) {
      buckets[matchedIndex] = {
        ...buckets[matchedIndex],
        value: buckets[matchedIndex].value + 1,
      };
    }
  }

  return buckets;
}

function sortStatusCounts(rows: StatusCount[]) {
  return [...rows].sort((left, right) => {
    if (right.value !== left.value) {
      return right.value - left.value;
    }
    return left.label.localeCompare(right.label);
  });
}

function buildThresholdBreakdown(
  rows: Array<{ label: string | null | undefined; value: number }>
): { rows: BreakdownRow[]; threshold: number; withheldCount: number } {
  const normalized = rows
    .map((row) => ({
      label: row.label?.trim() || "Unspecified",
      value: row.value,
    }))
    .filter((row) => row.value > 0)
    .sort((left, right) => {
      if (right.value !== left.value) {
        return right.value - left.value;
      }
      return left.label.localeCompare(right.label);
    });

  let withheldCount = 0;
  const visibleRows: BreakdownRow[] = [];

  for (const row of normalized) {
    if (row.value < MIN_BREAKDOWN_SIZE) {
      withheldCount += row.value;
      continue;
    }
    visibleRows.push(row);
  }

  return {
    rows: visibleRows,
    threshold: MIN_BREAKDOWN_SIZE,
    withheldCount,
  };
}

function buildDemoDashboard(): AdminIntelligenceDashboard {
  const datasets = demoWorkforceDatasets.map((dataset) => ({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description ?? null,
    dataSource: dataset.dataSource ?? null,
    sampleSize: null,
    methodology: null,
    lastUpdated: dataset.updatedAt ?? null,
    isPublic: dataset.isPublic,
    metricsCount: dataset._count?.metrics ?? 0,
  }));

  return {
    ...EMPTY_DASHBOARD,
    summary: {
      ...EMPTY_DASHBOARD.summary,
      totalDatasets: datasets.length,
      totalMetrics: datasets.reduce((total, dataset) => total + dataset.metricsCount, 0),
      publicDatasets: datasets.filter((dataset) => dataset.isPublic).length,
    },
    datasets,
  };
}

export async function getAdminIntelligenceDashboard(): Promise<AdminIntelligenceDashboard> {
  await requirePermission(INSIGHT_PERMISSIONS.VIEW);

  if (DEMO_MODE) {
    return buildDemoDashboard();
  }

  try {
    const trendStart = new Date(
      `${buildEmptyTrend()[0].label}T00:00:00.000Z`
    );

    const [
      totalApplications,
      activeDemands,
      closedDemands,
      publishedJobs,
      openVacancies,
      applicationStatusGroups,
      documentStatusGroups,
      metricCategoryGroups,
      recentApplications,
      demandCountryRows,
      datasets,
    ] = await Promise.all([
      prisma.demandApplication.count(),
      prisma.demand.count({
        where: { deletedAt: null, status: "PUBLISHED" },
      }),
      prisma.demand.count({
        where: { deletedAt: null, status: { in: ["CLOSED", "ARCHIVED"] } },
      }),
      prisma.job.count({
        where: { deletedAt: null, status: "PUBLISHED" },
      }),
      prisma.demandPosition.aggregate({
        where: {
          demand: { deletedAt: null, status: "PUBLISHED" },
          status: "OPEN",
          isPublic: true,
        },
        _sum: { totalCount: true },
      }),
      prisma.demandApplication.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.candidateDocument.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.workforceMetric.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
      prisma.demandApplication.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.demand.findMany({
        where: { deletedAt: null },
        select: {
          country: { select: { name: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.workforceDataset.findMany({
        include: {
          _count: {
            select: {
              metrics: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      }),
    ]);

    const countryRollup = new Map<string, number>();
    for (const demand of demandCountryRows) {
      const label = demand.country?.name || "Unspecified";
      countryRollup.set(label, (countryRollup.get(label) || 0) + demand._count.applications);
    }

    const normalizedDatasets: DatasetSummary[] = datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      dataSource: dataset.dataSource,
      sampleSize: dataset.sampleSize,
      methodology: dataset.methodology,
      lastUpdated: dataset.lastUpdated,
      isPublic: dataset.isPublic,
      metricsCount: dataset._count.metrics,
    }));

    const totalMetrics = normalizedDatasets.reduce(
      (sum, dataset) => sum + dataset.metricsCount,
      0
    );

    return {
      summary: {
        totalApplications,
        activeDemands,
        closedDemands,
        publishedJobs,
        openVacancies: openVacancies._sum.totalCount ?? 0,
        totalDatasets: normalizedDatasets.length,
        totalMetrics,
        publicDatasets: normalizedDatasets.filter((dataset) => dataset.isPublic).length,
      },
      applicationStatuses: sortStatusCounts(
        applicationStatusGroups.map((row) => ({
          label: row.status,
          value: row._count._all,
        }))
      ),
      documentStatuses: sortStatusCounts(
        documentStatusGroups.map((row) => ({
          label: row.status,
          value: row._count._all,
        }))
      ),
      metricCategories: sortStatusCounts(
        metricCategoryGroups.map((row) => ({
          label: row.category,
          value: row._count._all,
        }))
      ),
      recentApplicationTrend: buildRecentTrend(
        recentApplications.map((row) => row.createdAt)
      ),
      countryBreakdown: buildThresholdBreakdown(
        Array.from(countryRollup.entries()).map(([label, value]) => ({
          label,
          value,
        }))
      ),
      datasets: normalizedDatasets,
    };
  } catch (error) {
    logger.error(
      "Failed to load workforce intelligence dashboard",
      error instanceof Error ? error : new Error(String(error))
    );
    return EMPTY_DASHBOARD;
  }
}

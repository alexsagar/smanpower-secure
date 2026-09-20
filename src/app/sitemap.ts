import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { isStagingNoIndexEnabled } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site-config";
import { prisma } from "@/lib/prisma";
import {
  trustContent,
  industriesContent,
  trainingContent,
  employersContent,
  ethicalContent,
  destinationsContent,
} from "@/lib/content";
import { CACHE_TAGS, CACHE_REVALIDATE } from "@/lib/cache-tags";

type DynamicSitemapData = {
  demands: { slug: string; updatedAt: Date; publishedAt: Date | null }[];
  articles: { slug: string; updatedAt: Date; publishDate: Date | null }[];
  news: { slug: string; updatedAt: Date; publishDate: Date | null }[];
  careers: { slug: string; updatedAt: Date }[];
  stories: { slug: string; updatedAt: Date; publishedAt: Date | null }[];
  pages: { slug: string; updatedAt: Date }[];
};

async function fetchDynamicSitemapData(): Promise<DynamicSitemapData> {
  if (process.env.DEMO_MODE === "true") {
    return { demands: [], articles: [], news: [], careers: [], stories: [], pages: [] };
  }

  const [demands, articles, news, careers, stories, pages] = await Promise.all([
    prisma.demand.findMany({
      where: {
        status: "PUBLISHED",
        isPublic: true,
        deletedAt: null,
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: new Date() } },
        ],
      },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.insightArticle.findMany({
      where: { status: "PUBLISHED", deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true, publishDate: true },
    }),
    prisma.newsArticle.findMany({
      where: { status: "PUBLISHED", isPublished: true, deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true, publishDate: true },
    }),
    prisma.careerOpening.findMany({
      where: { status: "OPEN", deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.cmsPage.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return { demands, articles, news, careers, stories, pages };
}

const getCachedDynamicSitemapData = unstable_cache(
  fetchDynamicSitemapData,
  ["cms-sitemap-dynamic-data"],
  { revalidate: CACHE_REVALIDATE.sitemap, tags: [CACHE_TAGS.sitemap, CACHE_TAGS.demands, CACHE_TAGS.insights, CACHE_TAGS.news, CACHE_TAGS.stories, CACHE_TAGS.careers, CACHE_TAGS.pages] }
);

async function getDynamicSitemapData(): Promise<DynamicSitemapData> {
  try {
    return await getCachedDynamicSitemapData();
  } catch {
    return await fetchDynamicSitemapData();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isStagingNoIndexEnabled()) return [];

  const siteUrl = getSiteUrl();
  const BASE_URL = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://smanpower.com";
  const entries: MetadataRoute.Sitemap = [];

  const addEntry = (path: string, changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "monthly", priority: number = 0.5, lastModified?: Date) => {
    // Only emit lastModified when a real CMS/database timestamp exists.
    // Static routes have no genuine timestamp, so we omit it rather than
    // stamping the crawl time (an artificial, always-changing date).
    entries.push({
      url: `${BASE_URL}${path || "/"}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency,
      priority,
    });
  };

  // Static core public pages
  const staticPages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/about/community-impact", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about/leadership", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about/mission-vision-values", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about/our-people", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about/our-story", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/careers", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/demands", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/destinations", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/employers", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/employers/request-workforce", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/ethical-recruitment", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/industries", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/insights", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/manpower-agency-in-kathmandu", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/news", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/success-stories", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/terms-of-service", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/training-facilities", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/trust-centre", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/worker-grievance", changeFrequency: "yearly" as const, priority: 0.5 },
  ];

  staticPages.forEach(({ path, changeFrequency, priority }) => {
    addEntry(path, changeFrequency, priority);
  });

  // Sub-pages prerendered via generateStaticParams matching route content arrays
  trustContent.forEach(({ slug }) => {
    addEntry(`/trust-centre/${slug}`, "monthly", 0.7);
  });
  industriesContent.forEach(({ slug }) => {
    addEntry(`/industries/${slug}`, "monthly", 0.7);
  });
  trainingContent.forEach(({ slug }) => {
    addEntry(`/training-facilities/${slug}`, "monthly", 0.7);
  });
  destinationsContent.forEach(({ slug }) => {
    addEntry(`/destinations/${slug}`, "monthly", 0.7);
  });
  employersContent.forEach(({ slug }) => {
    addEntry(`/employers/${slug}`, "monthly", 0.7);
  });
  ethicalContent.forEach(({ slug }) => {
    if (slug === "privacy-policy") return;
    addEntry(`/ethical-recruitment/${slug}`, "monthly", 0.7);
  });

  // Dynamic Content (cached cross-request)
  const { demands, articles, news, careers, stories, pages } = await getDynamicSitemapData();

  demands.forEach((demand: any) => {
    addEntry(`/demands/${demand.slug}`, "daily", 0.9, demand.publishedAt || demand.updatedAt);
  });

  articles.forEach((article: any) => {
    addEntry(`/insights/${article.slug}`, "weekly", 0.7, article.publishDate || article.updatedAt);
  });

  news.forEach((item: any) => {
    addEntry(`/news/${item.slug}`, "weekly", 0.7, item.publishDate || item.updatedAt);
  });

  careers.forEach((item: any) => {
    addEntry(`/careers/${item.slug}`, "weekly", 0.6, item.updatedAt);
  });

  stories.forEach((story: any) => {
    addEntry(`/success-stories/${story.slug}`, "monthly", 0.6, story.publishedAt || story.updatedAt);
  });

  const UTILITY_SLUGS = new Set(["home", "layout", "search", "demands/detail"]);
  pages.forEach((page: any) => {
    const slug: string = page.slug || "";
    if (!slug || UTILITY_SLUGS.has(slug) || slug.includes("/")) return;
    const existing = staticPages.find(p => p.path === `/${slug}`);
    if (!existing) {
      addEntry(`/${slug}`, "monthly", 0.6, page.updatedAt);
    }
  });

  return entries;
}

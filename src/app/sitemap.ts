import type { MetadataRoute } from "next";
import { isStagingNoIndexEnabled } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site-config";
import { prisma } from "@/lib/prisma";

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
    { path: "/employers", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/employers/request-workforce", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/ethical-recruitment", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/industries", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/insights", changeFrequency: "weekly" as const, priority: 0.7 },
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

  // Dynamic Demands
  // Only PUBLISHED and isPublic demands (no demo/draft/fake data)
  if (process.env.DEMO_MODE !== "true") {
    const demands = await prisma.demand.findMany({
      where: { status: "PUBLISHED", isPublic: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    demands.forEach((demand: any) => {
      addEntry(`/demands/${demand.slug}`, "daily", 0.9, demand.publishedAt || demand.updatedAt);
    });

    // Dynamic Articles
    const articles = await prisma.insightArticle.findMany({
      where: { status: "PUBLISHED", deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true, publishDate: true },
    });
    articles.forEach((article: any) => {
      addEntry(`/insights/${article.slug}`, "weekly", 0.7, article.publishDate || article.updatedAt);
    });

    // Dynamic News
    const news = await prisma.newsArticle.findMany({
      where: { status: "PUBLISHED", isPublished: true, deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true, publishDate: true },
    });
    news.forEach((item: any) => {
      addEntry(`/news/${item.slug}`, "weekly", 0.7, item.publishDate || item.updatedAt);
    });

    // Dynamic Careers
    const careers = await prisma.careerOpening.findMany({
      where: { status: "OPEN", deletedAt: null, noIndex: false },
      select: { slug: true, updatedAt: true },
    });
    careers.forEach((item: any) => {
      addEntry(`/careers/${item.slug}`, "weekly", 0.6, item.updatedAt);
    });

    // Dynamic Stories
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    stories.forEach((story: any) => {
      addEntry(`/success-stories/${story.slug}`, "monthly", 0.6, story.publishedAt || story.updatedAt);
    });
    
    // Dynamic CMS Pages
    const pages = await prisma.cmsPage.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    // Utility/copy CMS records (page-copy keys, layout fragments, detail
    // templates) are stored as CmsPages but are NOT standalone public routes.
    // Emitting them produced /home, /layout and /demands/detail in the sitemap.
    const UTILITY_SLUGS = new Set(["home", "layout", "search", "demands/detail"]);
    pages.forEach((page: any) => {
      const slug: string = page.slug || "";
      // Skip utility keys, multi-segment copy keys (e.g. "demands/detail"),
      // and any slug that collides with an existing static route.
      if (!slug || UTILITY_SLUGS.has(slug) || slug.includes("/")) return;
      const existing = staticPages.find(p => p.path === `/${slug}`);
      if (!existing) {
        addEntry(`/${slug}`, "monthly", 0.6, page.updatedAt);
      }
    });
  }

  return entries;
}

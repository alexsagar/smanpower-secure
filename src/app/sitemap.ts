import type { MetadataRoute } from "next";
import { isStagingNoIndexEnabled } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site-config";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isStagingNoIndexEnabled()) return [];

  const siteUrl = getSiteUrl();
  // Safe fallback if siteUrl is missing in production to prevent malformed sitemap
  const BASE_URL = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://smanpower.com";
  
  const locales = ["en", "ne"];
  const entries: MetadataRoute.Sitemap = [];

  const addEntries = (path: string, changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "monthly", priority: number = 0.5, lastModified?: Date) => {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: lastModified || new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${path}`,
            ne: `${BASE_URL}/ne${path}`,
          },
        },
      });
    }
  };

  const addLocalizedEntry = (locale: string, path: string, changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "monthly", priority: number = 0.5, lastModified?: Date) => {
    entries.push({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: lastModified || new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          [locale]: `${BASE_URL}/${locale}${path}`,
        },
      },
    });
  };

  // Static core public pages
  const staticPages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/employers", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/job-seekers", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/ethical-recruitment", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/industries", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/training-facilities", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/trust-centre", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/demands", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/insights", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/news", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/success-stories", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  staticPages.forEach(({ path, changeFrequency, priority }) => {
    addEntries(path, changeFrequency, priority);
  });

  // Dynamic Demands
  // Only PUBLISHED and isPublic demands (no demo/draft/fake data)
  if (process.env.DEMO_MODE !== "true") {
    const demands = await prisma.demand.findMany({
      where: { status: "PUBLISHED", isPublic: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    demands.forEach((demand: any) => {
      addEntries(`/demands/${demand.slug}`, "daily", 0.9, demand.publishedAt || demand.updatedAt);
    });

    // Dynamic Articles
    const articles = await prisma.insightArticle.findMany({
      where: { status: "PUBLISHED", deletedAt: null, noIndex: false },
      select: { slug: true, lang: true, updatedAt: true, publishDate: true },
    });
    articles.forEach((article: any) => {
      addLocalizedEntry(article.lang || "en", `/insights/${article.slug}`, "weekly", 0.7, article.publishDate || article.updatedAt);
    });

    // Dynamic News
    const news = await prisma.newsArticle.findMany({
      where: { status: "PUBLISHED", isPublished: true, deletedAt: null, noIndex: false },
      select: { slug: true, lang: true, updatedAt: true, publishDate: true },
    });
    news.forEach((item: any) => {
      addLocalizedEntry(item.lang || "en", `/news/${item.slug}`, "weekly", 0.7, item.publishDate || item.updatedAt);
    });

    // Dynamic Careers
    const careers = await prisma.careerOpening.findMany({
      where: { status: "OPEN", deletedAt: null, noIndex: false },
      select: { slug: true, lang: true, updatedAt: true },
    });
    careers.forEach((item: any) => {
      addLocalizedEntry(item.lang || "en", `/careers/${item.slug}`, "weekly", 0.6, item.updatedAt);
    });

    // Dynamic Stories
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    stories.forEach((story: any) => {
      addEntries(`/success-stories/${story.slug}`, "monthly", 0.6, story.publishedAt || story.updatedAt);
    });
    
    // Dynamic CMS Pages
    const pages = await prisma.cmsPage.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    pages.forEach((page: any) => {
      // Avoid duplicate root paths if CMS page matches existing static routes
      const existing = staticPages.find(p => p.path === `/${page.slug}`);
      if (!existing && page.slug) {
        addEntries(`/${page.slug}`, "monthly", 0.6, page.updatedAt);
      }
    });
  }

  return entries;
}

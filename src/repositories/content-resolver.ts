import "server-only";

// ============================================================
// Content Resolver — Factory + Convenience Exports
// ============================================================
// Frontend code imports from here. The resolver decides which
// repository implementation to use based on DEMO_MODE.
// ============================================================

import { DEMO_MODE } from "@/config/demo";
import type { ContentRepository } from "./content-repository";
import type { NavLocation } from "@/types/content";
import type { CmsDemandFilters } from "@/types/content";

import { DemoContentRepository } from "./demo-content-repository";
import { PrismaContentRepository } from "./prisma-content-repository";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_REVALIDATE } from "@/lib/cache-tags";

let _cachedRepo: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (_cachedRepo) return _cachedRepo;

  if (DEMO_MODE) {
    _cachedRepo = new DemoContentRepository();
  } else {
    _cachedRepo = new PrismaContentRepository();
  }

  return _cachedRepo!;
}

// ── Cross-request cached global data ──────────────────────────
// Layout & Global Settings are cached with Next.js unstable_cache
// and invalidated on CMS mutations or after CACHE_REVALIDATE.layout.

export const getNavigation = unstable_cache(
  async (location: NavLocation) => getContentRepository().getNavigation(location),
  ["cms-navigation"],
  { revalidate: CACHE_REVALIDATE.layout, tags: [CACHE_TAGS.navigation] }
);

export const getSiteSettings = unstable_cache(
  async () => getContentRepository().getSiteSettings(),
  ["cms-site-settings"],
  { revalidate: CACHE_REVALIDATE.layout, tags: [CACHE_TAGS.settings] }
);

export const getFooterSettings = unstable_cache(
  async () => getContentRepository().getFooterSettings(),
  ["cms-footer-settings"],
  { revalidate: CACHE_REVALIDATE.layout, tags: [CACHE_TAGS.settings, CACHE_TAGS.navigation] }
);

// ── Request-scoped memoized convenience functions ─────────────
// Public data is shared across requests and invalidated by the matching CMS tag.

function publicCache<T extends unknown[], R>(key: string, revalidate: number, tags: string[], read: (...args: T) => Promise<R>) {
  return unstable_cache(read, [key], { revalidate, tags });
}

export const getHomepage = publicCache("cms-homepage", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], () => getContentRepository().getHomepage());
export const getPageBySlug = publicCache("cms-page", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], (slug: string) => getContentRepository().getPageBySlug(slug));
export const getHeroByPageSlug = publicCache("cms-hero", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], (slug: string) => getContentRepository().getHeroByPageSlug(slug));
export const getContentBlocksByPageSlug = publicCache("cms-blocks", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], (slug: string) => getContentRepository().getContentBlocksByPageSlug(slug));
export const getPageSeo = publicCache("cms-seo", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], (pagePath: string, lang?: string) => getContentRepository().getPageSeo(pagePath, lang));
export const getPublishedJobs = publicCache("cms-jobs", CACHE_REVALIDATE.careers, [CACHE_TAGS.careers], (filters?: { country?: string; industry?: string }) => getContentRepository().getPublishedJobs(filters));
export const getJobBySlug = publicCache("cms-job", CACHE_REVALIDATE.careers, [CACHE_TAGS.careers], (slug: string) => getContentRepository().getJobBySlug(slug));
export const getPublishedDemands = publicCache("cms-demands", CACHE_REVALIDATE.demands, [CACHE_TAGS.demands], (filters?: CmsDemandFilters) => getContentRepository().getPublishedDemands(filters));
export const getDemandBySlug = publicCache("cms-demand", CACHE_REVALIDATE.demands, [CACHE_TAGS.demands], (slug: string) => getContentRepository().getDemandBySlug(slug));
export const getDemandFilterOptions = publicCache("cms-demand-filters", CACHE_REVALIDATE.demands, [CACHE_TAGS.demands], () => getContentRepository().getDemandFilterOptions());
export const getFeaturedStories = publicCache("cms-featured-stories", CACHE_REVALIDATE.stories, [CACHE_TAGS.stories], () => getContentRepository().getFeaturedStories());
export const getPublishedStories = publicCache("cms-stories", CACHE_REVALIDATE.stories, [CACHE_TAGS.stories], (limit?: number) => getContentRepository().getPublishedStories(limit));
export const getStoryBySlug = publicCache("cms-story", CACHE_REVALIDATE.stories, [CACHE_TAGS.stories], (slug: string) => getContentRepository().getStoryBySlug(slug));
export const getPublishedTestimonials = publicCache("cms-testimonials", CACHE_REVALIDATE.stories, [CACHE_TAGS.stories], () => getContentRepository().getPublishedTestimonials());
export const getIndustries = publicCache("cms-industries", CACHE_REVALIDATE.pages, [CACHE_TAGS.industries], () => getContentRepository().getIndustries());
export const getIndustryBySlug = publicCache("cms-industry", CACHE_REVALIDATE.pages, [CACHE_TAGS.industries], (slug: string) => getContentRepository().getIndustryBySlug(slug));
export const getPublicTrustDocuments = publicCache("cms-trust", CACHE_REVALIDATE.pages, [CACHE_TAGS.compliance], () => getContentRepository().getPublicTrustDocuments());
export const getTrustDocumentsByType = publicCache("cms-trust-type", CACHE_REVALIDATE.pages, [CACHE_TAGS.compliance], (type: string) => getContentRepository().getTrustDocumentsByType(type));
export const getTrainingFacilities = publicCache("cms-facilities", CACHE_REVALIDATE.pages, [CACHE_TAGS.facilities], () => getContentRepository().getTrainingFacilities());
export const getTrainingFacilityBySlug = publicCache("cms-facility", CACHE_REVALIDATE.pages, [CACHE_TAGS.facilities], (slug: string) => getContentRepository().getTrainingFacilityBySlug(slug));
export const getFeaturedInsights = publicCache("cms-featured-insights", CACHE_REVALIDATE.insights, [CACHE_TAGS.insights], () => getContentRepository().getFeaturedInsights());
export const getPublishedInsights = publicCache("cms-insights", CACHE_REVALIDATE.insights, [CACHE_TAGS.insights], () => getContentRepository().getPublishedInsights());
export const getInsightBySlug = publicCache("cms-insight", CACHE_REVALIDATE.insights, [CACHE_TAGS.insights], (slug: string) => getContentRepository().getInsightBySlug(slug));
export const getStatistics = publicCache("cms-statistics", CACHE_REVALIDATE.pages, [CACHE_TAGS.pages], () => getContentRepository().getStatistics());
export const getClientPartners = publicCache("cms-partners", CACHE_REVALIDATE.pages, [CACHE_TAGS.partners], () => getContentRepository().getClientPartners());
export const getTeamMembers = publicCache("cms-team", CACHE_REVALIDATE.pages, [CACHE_TAGS.team], () => getContentRepository().getTeamMembers());

// Private/admin media reads deliberately bypass the public cache.
export const getMediaAssets = () => getContentRepository().getMediaAssets();
export const getMediaAssetById = (id: string) => getContentRepository().getMediaAssetById(id);

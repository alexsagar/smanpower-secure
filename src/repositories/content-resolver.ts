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

import { cache } from "react";
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
// React cache() guarantees that during a single render (e.g. generateMetadata + Page),
// identical entity queries share the same execution promise.

export const getHomepage = cache(() => getContentRepository().getHomepage());
export const getPageBySlug = cache((slug: string) => getContentRepository().getPageBySlug(slug));
export const getHeroByPageSlug = cache((slug: string) => getContentRepository().getHeroByPageSlug(slug));
export const getContentBlocksByPageSlug = cache((slug: string) => getContentRepository().getContentBlocksByPageSlug(slug));
export const getPageSeo = cache((pagePath: string, lang?: string) => getContentRepository().getPageSeo(pagePath, lang));
export const getPublishedJobs = cache((filters?: { country?: string; industry?: string }) => getContentRepository().getPublishedJobs(filters));
export const getJobBySlug = cache((slug: string) => getContentRepository().getJobBySlug(slug));
export const getPublishedDemands = cache((filters?: CmsDemandFilters) => getContentRepository().getPublishedDemands(filters));
export const getDemandBySlug = cache((slug: string) => getContentRepository().getDemandBySlug(slug));
export const getDemandFilterOptions = cache(() => getContentRepository().getDemandFilterOptions());
export const getFeaturedStories = cache(() => getContentRepository().getFeaturedStories());
export const getPublishedStories = cache((limit?: number) => getContentRepository().getPublishedStories(limit));
export const getStoryBySlug = cache((slug: string) => getContentRepository().getStoryBySlug(slug));
export const getPublishedTestimonials = cache(() => getContentRepository().getPublishedTestimonials());
export const getIndustries = cache(() => getContentRepository().getIndustries());
export const getIndustryBySlug = cache((slug: string) => getContentRepository().getIndustryBySlug(slug));
export const getPublicTrustDocuments = cache(() => getContentRepository().getPublicTrustDocuments());
export const getTrustDocumentsByType = cache((type: string) => getContentRepository().getTrustDocumentsByType(type));
export const getTrainingFacilities = cache(() => getContentRepository().getTrainingFacilities());
export const getTrainingFacilityBySlug = cache((slug: string) => getContentRepository().getTrainingFacilityBySlug(slug));
export const getFeaturedInsights = cache(() => getContentRepository().getFeaturedInsights());
export const getPublishedInsights = cache(() => getContentRepository().getPublishedInsights());
export const getInsightBySlug = cache((slug: string) => getContentRepository().getInsightBySlug(slug));
export const getStatistics = cache(() => getContentRepository().getStatistics());
export const getClientPartners = cache(() => getContentRepository().getClientPartners());
export const getTeamMembers = cache(() => getContentRepository().getTeamMembers());
export const getMediaAssets = cache(() => getContentRepository().getMediaAssets());
export const getMediaAssetById = cache((id: string) => getContentRepository().getMediaAssetById(id));

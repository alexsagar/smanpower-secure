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

// ── Convenience functions ─────────────────────────────────────
// These are the primary API for frontend components.

export const getHomepage = () => getContentRepository().getHomepage();
export const getPageBySlug = (slug: string) => getContentRepository().getPageBySlug(slug);
export const getHeroByPageSlug = (slug: string) => getContentRepository().getHeroByPageSlug(slug);
export const getContentBlocksByPageSlug = (slug: string) => getContentRepository().getContentBlocksByPageSlug(slug);
export const getPageSeo = (pagePath: string, lang?: string) => getContentRepository().getPageSeo(pagePath, lang);
export const getNavigation = (location: NavLocation) => getContentRepository().getNavigation(location);
export const getSiteSettings = () => getContentRepository().getSiteSettings();
export const getFooterSettings = () => getContentRepository().getFooterSettings();
export const getPublishedJobs = (filters?: { country?: string; industry?: string }) => getContentRepository().getPublishedJobs(filters);
export const getJobBySlug = (slug: string) => getContentRepository().getJobBySlug(slug);
export const getPublishedDemands = (filters?: CmsDemandFilters) => getContentRepository().getPublishedDemands(filters);
export const getDemandBySlug = (slug: string) => getContentRepository().getDemandBySlug(slug);
export const getDemandFilterOptions = () => getContentRepository().getDemandFilterOptions();
export const getFeaturedStories = () => getContentRepository().getFeaturedStories();
export const getPublishedStories = () => getContentRepository().getPublishedStories();
export const getStoryBySlug = (slug: string) => getContentRepository().getStoryBySlug(slug);
export const getPublishedTestimonials = () => getContentRepository().getPublishedTestimonials();
export const getIndustries = () => getContentRepository().getIndustries();
export const getIndustryBySlug = (slug: string) => getContentRepository().getIndustryBySlug(slug);
export const getPublicTrustDocuments = () => getContentRepository().getPublicTrustDocuments();
export const getTrustDocumentsByType = (type: string) => getContentRepository().getTrustDocumentsByType(type);
export const getTrainingFacilities = () => getContentRepository().getTrainingFacilities();
export const getTrainingFacilityBySlug = (slug: string) => getContentRepository().getTrainingFacilityBySlug(slug);
export const getFeaturedInsights = () => getContentRepository().getFeaturedInsights();
export const getPublishedInsights = () => getContentRepository().getPublishedInsights();
export const getInsightBySlug = (slug: string) => getContentRepository().getInsightBySlug(slug);
export const getStatistics = () => getContentRepository().getStatistics();
export const getClientPartners = () => getContentRepository().getClientPartners();
export const getTeamMembers = () => getContentRepository().getTeamMembers();
export const getMediaAssets = () => getContentRepository().getMediaAssets();
export const getMediaAssetById = (id: string) => getContentRepository().getMediaAssetById(id);

// ============================================================
// Content Repository Interface
// ============================================================
// Single interface that both DemoContentRepository and
// PrismaContentRepository implement. The frontend only imports
// from content-resolver.ts, never directly from either impl.
// ============================================================

import type {
  CmsPage,
  CmsHeroSection,
  CmsContentBlock,
  CmsNavigation,
  CmsSiteSettings,
  CmsFooterSettings,
  CmsStatistic,
  CmsSuccessStory,
  CmsTestimonial,
  CmsJob,
  CmsDemand,
  CmsDemandFilters,
  CmsIndustry,
  CmsComplianceDocument,
  CmsTrainingFacility,
  CmsInsightArticle,
  CmsTeamMember,
  CmsClientPartner,
  CmsMediaAsset,
  CmsPageSeo,
  NavLocation,
} from "@/types/content";

export interface ContentRepository {
  // ── Pages ────────────────────────────────────────────
  getHomepage(): Promise<CmsPage>;
  getPageBySlug(slug: string): Promise<CmsPage | null>;
  getHeroByPageSlug(slug: string): Promise<CmsHeroSection | null>;
  getContentBlocksByPageSlug(slug: string): Promise<CmsContentBlock[]>;
  getPageSeo(pagePath: string, lang?: string): Promise<CmsPageSeo | null>;

  // ── Navigation & Settings ────────────────────────────
  getNavigation(location: NavLocation): Promise<CmsNavigation[]>;
  getSiteSettings(): Promise<CmsSiteSettings>;
  getFooterSettings(): Promise<CmsFooterSettings>;

  // ── Jobs ─────────────────────────────────────────────
  getPublishedJobs(filters?: { country?: string; industry?: string }): Promise<CmsJob[]>;
  getJobBySlug(slug: string): Promise<CmsJob | null>;

  // ── Demands ─────────────────────────────────────────
  getPublishedDemands(filters?: CmsDemandFilters): Promise<CmsDemand[]>;
  getDemandBySlug(slug: string): Promise<CmsDemand | null>;
  getDemandFilterOptions(): Promise<{ countries: string[]; cities: string[]; companies: string[]; industries: string[] }>;

  // ── Stories & Testimonials ───────────────────────────
  getFeaturedStories(): Promise<CmsSuccessStory[]>;
  getPublishedStories(): Promise<CmsSuccessStory[]>;
  getStoryBySlug(slug: string): Promise<CmsSuccessStory | null>;
  getPublishedTestimonials(): Promise<CmsTestimonial[]>;

  // ── Industries ───────────────────────────────────────
  getIndustries(): Promise<CmsIndustry[]>;
  getIndustryBySlug(slug: string): Promise<CmsIndustry | null>;

  // ── Compliance & Trust ───────────────────────────────
  getPublicTrustDocuments(): Promise<CmsComplianceDocument[]>;
  getTrustDocumentsByType(type: string): Promise<CmsComplianceDocument[]>;

  // ── Training ─────────────────────────────────────────
  getTrainingFacilities(): Promise<CmsTrainingFacility[]>;
  getTrainingFacilityBySlug(slug: string): Promise<CmsTrainingFacility | null>;

  // ── Insights & News ──────────────────────────────────
  getFeaturedInsights(): Promise<CmsInsightArticle[]>;
  getPublishedInsights(): Promise<CmsInsightArticle[]>;
  getInsightBySlug(slug: string): Promise<CmsInsightArticle | null>;

  // ── Statistics ───────────────────────────────────────
  getStatistics(): Promise<CmsStatistic[]>;

  // ── Partners ─────────────────────────────────────────
  getClientPartners(): Promise<CmsClientPartner[]>;

  // ── Team ─────────────────────────────────────────────
  getTeamMembers(): Promise<CmsTeamMember[]>;

  // ── Media ────────────────────────────────────────────
  getMediaAssets(): Promise<CmsMediaAsset[]>;
  getMediaAssetById(id: string): Promise<CmsMediaAsset | null>;
}

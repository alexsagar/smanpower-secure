// ============================================================
// Demo Content Repository
// ============================================================
// Implementation of ContentRepository that reads from the
// static fixture files instead of a database.
// ============================================================

import type { ContentRepository } from "./content-repository";
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

import { demoHomepage } from "@/demo-data/homepage";
import { demoPages } from "@/demo-data/pages";
import { demoHeaderNavigation, demoFooterNavigation } from "@/demo-data/navigation";
import { demoSiteSettings, demoFooterSettings } from "@/demo-data/site-settings";
import { demoJobs } from "@/demo-data/jobs";
import { demoStories } from "@/demo-data/stories";
import { demoIndustries } from "@/demo-data/industries";
import { demoComplianceDocs } from "@/demo-data/compliance";
import { demoFacilities } from "@/demo-data/facilities";
import { demoInsights } from "@/demo-data/insights";
import { demoStatistics, demoClientPartners } from "@/demo-data/homepage";
import { demoTeam } from "@/demo-data/team";
import { getAllDemoMedia, getDemoMediaById } from "@/demo-data/media";
import { demoDemands } from "@/demo-data/demands";

export class DemoContentRepository implements ContentRepository {
  // ── Pages ────────────────────────────────────────────

  async getHomepage(): Promise<CmsPage> {
    return demoHomepage;
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    if (slug === "home") return demoHomepage;
    return demoPages.find((p) => p.slug === slug) || null;
  }

  async getHeroByPageSlug(slug: string): Promise<CmsHeroSection | null> {
    const page = await this.getPageBySlug(slug);
    return page?.hero || null;
  }

  async getContentBlocksByPageSlug(slug: string): Promise<CmsContentBlock[]> {
    const page = await this.getPageBySlug(slug);
    return page?.blocks || [];
  }

  async getPageSeo(pagePath: string, lang?: string): Promise<CmsPageSeo | null> {
    const page = await this.getPageBySlug(pagePath);
    return page?.seo || null;
  }

  // ── Navigation & Settings ────────────────────────────

  async getNavigation(location: NavLocation): Promise<CmsNavigation[]> {
    if (location === "header") return demoHeaderNavigation;
    if (location === "footer") return demoFooterNavigation;
    return [];
  }

  async getSiteSettings(): Promise<CmsSiteSettings> {
    return demoSiteSettings;
  }

  async getFooterSettings(): Promise<CmsFooterSettings> {
    return demoFooterSettings;
  }

  // ── Jobs ─────────────────────────────────────────────

  async getPublishedJobs(filters?: { country?: string; industry?: string }): Promise<CmsJob[]> {
    let jobs = demoJobs.filter((j) => j.status === "PUBLISHED");
    if (filters?.country) {
      jobs = jobs.filter((j) => j.country.toLowerCase() === filters.country!.toLowerCase());
    }
    if (filters?.industry) {
      jobs = jobs.filter((j) => j.industry.toLowerCase() === filters.industry!.toLowerCase());
    }
    return jobs;
  }

  async getJobBySlug(slug: string): Promise<CmsJob | null> {
    return demoJobs.find((j) => j.slug === slug) || null;
  }

  // ── Demands ─────────────────────────────────────────

  async getPublishedDemands(filters?: CmsDemandFilters): Promise<CmsDemand[]> {
    let demands = demoDemands.filter(
      (d) => d.isPublic && (d.status === "PUBLISHED" || d.status === "CLOSED")
    );

    if (filters?.country) {
      demands = demands.filter(
        (d) => d.country.toLowerCase() === filters.country!.toLowerCase()
      );
    }
    if (filters?.city) {
      demands = demands.filter(
        (d) => d.city?.toLowerCase() === filters.city!.toLowerCase()
      );
    }
    if (filters?.company) {
      demands = demands.filter(
        (d) => d.companyName.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }
    if (filters?.industry) {
      demands = demands.filter(
        (d) => d.industry?.toLowerCase() === filters.industry!.toLowerCase()
      );
    }
    if (filters?.status) {
      demands = demands.filter((d) => d.statusBadge === filters.status);
    }
    if (filters?.foodAvailable) {
      demands = demands.filter((d) =>
        d.positions.some(
          (p) =>
            p.foodFacilityStatus === "PROVIDED" ||
            p.foodFacilityStatus === "ALLOWANCE_PROVIDED"
        )
      );
    }
    if (filters?.accommodationAvailable) {
      demands = demands.filter((d) =>
        d.positions.some(
          (p) =>
            p.accommodationStatus === "PROVIDED" ||
            p.accommodationStatus === "ALLOWANCE_PROVIDED"
        )
      );
    }

    return demands;
  }

  async getDemandBySlug(slug: string): Promise<CmsDemand | null> {
    return demoDemands.find((d) => d.slug === slug) || null;
  }

  async getDemandFilterOptions(): Promise<{
    countries: string[];
    cities: string[];
    companies: string[];
    industries: string[];
  }> {
    const published = demoDemands.filter(
      (d) => d.isPublic && (d.status === "PUBLISHED" || d.status === "CLOSED")
    );
    return {
      countries: [...new Set(published.map((d) => d.country))],
      cities: [...new Set(published.map((d) => d.city).filter(Boolean))] as string[],
      companies: [...new Set(published.map((d) => d.companyName))],
      industries: [...new Set(published.map((d) => d.industry).filter(Boolean))] as string[],
    };
  }

  // ── Stories & Testimonials ───────────────────────────

  async getFeaturedStories(): Promise<CmsSuccessStory[]> {
    return demoStories.filter((s) => s.isFeatured && s.isPublished);
  }

  async getPublishedStories(): Promise<CmsSuccessStory[]> {
    return demoStories.filter((s) => s.isPublished);
  }

  async getStoryBySlug(slug: string): Promise<CmsSuccessStory | null> {
    return demoStories.find((s) => s.slug === slug) || null;
  }

  async getPublishedTestimonials(): Promise<CmsTestimonial[]> {
    return []; // No demo testimonials yet
  }

  // ── Industries ───────────────────────────────────────

  async getIndustries(): Promise<CmsIndustry[]> {
    return demoIndustries.filter((i) => i.isActive);
  }

  async getIndustryBySlug(slug: string): Promise<CmsIndustry | null> {
    return demoIndustries.find((i) => i.slug === slug) || null;
  }

  // ── Compliance & Trust ───────────────────────────────

  async getPublicTrustDocuments(): Promise<CmsComplianceDocument[]> {
    return demoComplianceDocs.filter((d) => d.isPublic);
  }

  async getTrustDocumentsByType(type: string): Promise<CmsComplianceDocument[]> {
    return demoComplianceDocs.filter((d) => d.isPublic && d.documentType === type);
  }

  // ── Training ─────────────────────────────────────────

  async getTrainingFacilities(): Promise<CmsTrainingFacility[]> {
    return demoFacilities.filter((f) => f.isActive);
  }

  async getTrainingFacilityBySlug(slug: string): Promise<CmsTrainingFacility | null> {
    return demoFacilities.find((f) => f.slug === slug) || null;
  }

  // ── Insights & News ──────────────────────────────────

  async getFeaturedInsights(): Promise<CmsInsightArticle[]> {
    return demoInsights.filter((i) => i.isFeatured && i.isPublished);
  }

  async getPublishedInsights(): Promise<CmsInsightArticle[]> {
    return demoInsights.filter((i) => i.isPublished);
  }

  async getInsightBySlug(slug: string): Promise<CmsInsightArticle | null> {
    return demoInsights.find((i) => i.slug === slug) || null;
  }

  // ── Statistics ───────────────────────────────────────

  async getStatistics(): Promise<CmsStatistic[]> {
    return demoStatistics;
  }

  // ── Partners ─────────────────────────────────────────

  async getClientPartners(): Promise<CmsClientPartner[]> {
    return demoClientPartners.filter((p) => p.isPublic);
  }

  // ── Team ─────────────────────────────────────────────

  async getTeamMembers(): Promise<CmsTeamMember[]> {
    return demoTeam.filter((t) => t.isPublished);
  }

  // ── Media ────────────────────────────────────────────

  async getMediaAssets(): Promise<CmsMediaAsset[]> {
    return getAllDemoMedia();
  }

  async getMediaAssetById(id: string): Promise<CmsMediaAsset | null> {
    return getDemoMediaById(id) || null;
  }
}

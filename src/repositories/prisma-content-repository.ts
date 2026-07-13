import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";
import type {
  CmsPage,
  CmsHeroSection,
  CmsContentBlock,
  CmsPageSeo,
  CmsNavigation,
  NavLocation,
  CmsSiteSettings,
  CmsFooterSettings,
  CmsJob,
  CmsSuccessStory,
  CmsTestimonial,
  CmsIndustry,
  CmsComplianceDocument,
  CmsTrainingFacility,
  CmsInsightArticle,
  CmsStatistic,
  CmsClientPartner,
  CmsTeamMember,
  CmsMediaAsset,
  CmsDemand,
  CmsDemandFilters,
} from "@/types/content";
import type { ContentRepository } from "./content-repository";

const prisma = new PrismaClient();

export function safeJsonParse<T = unknown>(data: unknown, fieldName?: string, fallback: T = {} as T): unknown {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      logger.warn(`[PrismaContentRepository] Failed to parse JSON string for ${fieldName || 'unknown'}`);
      return fallback; // fallback to prevent downstream crashes
    }
  }
  return data ?? fallback;
}

export class PrismaContentRepository implements ContentRepository {
  private notImplemented(methodName: string): never {
    throw new Error(`PrismaContentRepository.${methodName} is not yet implemented. Please ensure DEMO_MODE=true is set until the database is configured.`);
  }

  async getHomepage(): Promise<CmsPage> {
    const page = await this.getPageBySlug("home");
    if (!page) throw new Error("Homepage not found in database");
    return page;
  }



  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
      include: {
        hero: {
          include: { image: true, video: true }
        },
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!page) return null;

    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status as any,
      publishedAt: page.status === "PUBLISHED" ? page.updatedAt.toISOString() : undefined,
      seo: {} as any,
      hero: page.hero ? {
        id: page.hero.id,
        pageSlug: page.slug,
        heroType: page.hero.videoId ? "video" : page.hero.imageId ? "image" : "text-only",
        eyebrow: page.hero.eyebrow || undefined,
        richHeading: safeJsonParse(page.hero.richHeading, "hero.richHeading") as any,
        richDescription: safeJsonParse(page.hero.richDescription, "hero.richDescription") as any,
        primaryCta: page.hero.primaryCtaText && page.hero.primaryCtaHref ? {
          text: page.hero.primaryCtaText,
          href: page.hero.primaryCtaHref,
          variant: "primary"
        } : undefined,
        secondaryCta: page.hero.secondaryCtaText && page.hero.secondaryCtaHref ? {
          text: page.hero.secondaryCtaText,
          href: page.hero.secondaryCtaHref,
          variant: "secondary"
        } : undefined,
        overlayEnabled: page.hero.overlayEnabled,
        textAlignment: "left",
        verticalAlignment: "center",
        image: page.hero.image ? { ...page.hero.image, resourceType: "image", source: "LOCAL_DEMO", mediaStatus: "REAL_APPROVED", visibility: "PUBLIC", overlayEnabled: page.hero.overlayEnabled, overlayOpacity: page.hero.overlayOpacity } as any : undefined,
        video: page.hero.video ? { ...page.hero.video, resourceType: "video", source: "LOCAL_DEMO", mediaStatus: "REAL_APPROVED", visibility: "PUBLIC" } as any : undefined
      } : undefined,
      blocks: page.blocks.map(b => ({
        id: b.id,
        blockType: b.blockType as any,
        blockKey: b.blockKey,
        order: b.order,
        visible: b.visible,
        richHeading: safeJsonParse(b.richHeading, `block[${b.blockType}].richHeading`) as any,
        content: safeJsonParse(b.content, `block[${b.blockType}].content`) as any,
        image: b.imageId ? { mediaId: b.imageId } : undefined
      })) as any
    };
  }

  async getHeroByPageSlug(slug: string): Promise<CmsHeroSection | null> {
    const page = await this.getPageBySlug(slug);
    return page?.hero || null;
  }

  async getContentBlocksByPageSlug(slug: string): Promise<CmsContentBlock[]> {
    const page = await this.getPageBySlug(slug);
    return page?.blocks || [];
  }

  async getPageSeo(pagePath: string, lang: string = "en"): Promise<CmsPageSeo | null> {
    try {
      const seo = await prisma.sEOPageMeta.findUnique({
        where: { pagePath_lang: { pagePath, lang } },
      });
      if (!seo) return null;
      return {
        metaTitle: seo.metaTitle || undefined,
        metaDescription: seo.metaDescription || undefined,
        canonicalUrl: seo.canonicalUrl || undefined,
        ogImage: seo.ogImage || undefined,
        noIndex: seo.noIndex,
      };
    } catch {
      return null;
    }
  }

  async getNavigation(location: NavLocation): Promise<CmsNavigation[]> {
    const navs = await prisma.navigationItem.findMany({
      where: { location, parentId: null },
      include: { children: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' }
    });

    return navs.map((n, idx) => ({
      id: n.id,
      label: n.label,
      labelNe: undefined,
      location: n.location as NavLocation,
      order: n.order,
      items: n.children
        .filter((c) => Boolean(c.href))
        .map((c, cIdx) => ({
          id: c.id,
          label: c.label,
          href: c.href as string,
          order: c.order,
          isActive: true
        }))
    }));
  }

  async getSiteSettings(): Promise<CmsSiteSettings> {
    const address = await prisma.siteSetting.findUnique({ where: { key: "footer_contact" }});
    const data = address?.value as any || {};
    return {
      companyName: "Seven Seas Intercontinental",
      companyShortName: "Seven Seas",
      companyLegalName: "Seven Seas Intercontinental Services Pvt. Ltd.",
      tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
      website: "https://smanpower.com",
      domain: "smanpower.com",
      logoUrl: "/images/SSIS.png",
      address: data.address || "",
      addressLine2: "",
      city: "Kathmandu",
      province: "Bagmati",
      country: "Nepal",
      phone: data.phone || "",
      email: data.email || "",
      whatsapp: "",
      officeHours: "",
      socialLinks: { facebook: "", linkedin: "", instagram: "", twitter: "", youtube: "" },
      defaultSeo: { metaTitle: "", metaDescription: "" }
    };
  }

  async getFooterSettings(): Promise<CmsFooterSettings> {
    const mission = await prisma.siteSetting.findUnique({ where: { key: "footer_mission" }});
    
    // Fetch footer navigation
    const footerNavs = await prisma.navigationItem.findMany({
      where: { location: "footer", parentId: null, isActive: true },
      include: { children: { where: { isActive: true }, orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' }
    });

    const sections = footerNavs.map(nav => ({
      title: nav.label,
      links: nav.children
        .filter((child) => Boolean(child.href))
        .map(child => ({
          label: child.label,
          href: child.href as string
        }))
    }));

    return {
      tagline: mission ? String(mission.value) : "",
      ctaText: "Partner With Us",
      ctaHref: "/contact",
      sections: sections.length > 0 ? sections : [
        {
          title: "Navigation",
          links: [
            { label: "Footer content pending configuration", href: "#" }
          ]
        }
      ],
      copyrightText: "© 2026 Seven Seas Intercontinental Services Pvt. Ltd. All rights reserved.",
      legalLinks: [
        { label: "Privacy Policy", href: "/ethical-recruitment/privacy-policy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Worker Grievance", href: "/trust-centre/grievance" },
      ]
    };
  }

  async getPublishedJobs(filters?: { country?: string; industry?: string }): Promise<CmsJob[]> {
    return [];
  }

  async getJobBySlug(slug: string): Promise<CmsJob | null> {
    return null;
  }

  async getFeaturedStories(): Promise<CmsSuccessStory[]> {
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      include: { featuredImage: true, industry: true, country: true },
      orderBy: { storyDate: 'desc' },
      take: 3
    });
    return stories.map(s => this.mapStoryToCms(s));
  }

  async getPublishedStories(): Promise<CmsSuccessStory[]> {
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      include: { featuredImage: true, industry: true, country: true },
      orderBy: { storyDate: 'desc' }
    });
    return stories.map(s => this.mapStoryToCms(s));
  }

  async getStoryBySlug(slug: string): Promise<CmsSuccessStory | null> {
    const story = await prisma.successStory.findUnique({
      where: { slug },
      include: { featuredImage: true, industry: true, country: true }
    });
    if (!story) return null;
    return this.mapStoryToCms(story);
  }

  private mapStoryToCms(s: any): any {
    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      summary: s.summary || "",
      content: s.content,
      storyType: s.storyType as any,
      personName: s.showPersonName ? (s.personName || undefined) : undefined,
      quote: s.quote || undefined,
      industry: s.industry?.name || undefined,
      country: s.country?.name || undefined,
      storyDate: s.storyDate ? s.storyDate.toISOString() : undefined,
      image: s.featuredImage ? {
        id: s.featuredImage.id,
        source: "LOCAL_DEMO",
        secureUrl: s.featuredImage.fileUrl,
        resourceType: "image",
        fileName: s.featuredImage.fileName,
        altText: s.featuredImage.altText || s.title,
        mediaStatus: s.featuredImage.status,
        visibility: s.featuredImage.isPublic ? "PUBLIC" : "PRIVATE",
        createdAt: s.featuredImage.createdAt?.toISOString() || "",
      } : undefined,
      seo: {
        metaTitle: s.metaTitle || undefined,
        metaDescription: s.metaDescription || undefined,
        canonicalUrl: s.canonicalUrl || undefined,
        ogImage: s.ogImage || undefined,
        ogTitle: s.ogTitle || undefined,
        ogDescription: s.ogDescription || undefined,
        noIndex: s.noIndex || false
      },
      publishedAt: s.publishedAt ? s.publishedAt.toISOString() : undefined
    };
  }

  async getPublishedTestimonials(): Promise<CmsTestimonial[]> {
    return [];
  }

  async getIndustries(): Promise<CmsIndustry[]> {
    const inds = await prisma.industry.findMany();
    return inds.map(i => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      description: i.description || undefined,
      icon: i.icon || "",
      order: i.order,
      isActive: i.isActive,
      image: i.image ? { id: "", source: "LOCAL_DEMO", secureUrl: i.image, resourceType: "image", fileName: i.image, altText: i.name, mediaStatus: "REAL_APPROVED", visibility: "PUBLIC", createdAt: new Date().toISOString() } as any : undefined,
    }));
  }

  async getIndustryBySlug(slug: string): Promise<CmsIndustry | null> {
    const i = await prisma.industry.findUnique({ where: { slug } });
    if (!i) return null;
    return {
      id: i.id,
      name: i.name,
      slug: i.slug,
      description: i.description || undefined,
      icon: i.icon || "",
      order: i.order,
      isActive: i.isActive,
      image: i.image ? { id: "", source: "LOCAL_DEMO", secureUrl: i.image, resourceType: "image", fileName: i.image, altText: i.name, mediaStatus: "REAL_APPROVED", visibility: "PUBLIC", createdAt: new Date().toISOString() } as any : undefined,
    };
  }

  async getPublicTrustDocuments(): Promise<CmsComplianceDocument[]> {
    const docs = await prisma.complianceDocument.findMany({ where: { isPublic: true } });
    return docs.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description || undefined,
      documentType: d.documentType as any,
      issueDate: d.issueDate ? d.issueDate.toISOString() : undefined,
      expiryDate: d.expiryDate ? d.expiryDate.toISOString() : undefined,
      fileUrl: d.fileUrl || "",
      isPublic: d.isPublic,
      isVerified: d.isVerified,
      order: d.order
    }));
  }

  async getTrustDocumentsByType(type: string): Promise<CmsComplianceDocument[]> {
    return this.getPublicTrustDocuments();
  }

  async getTrainingFacilities(): Promise<CmsTrainingFacility[]> {
    const facs = await prisma.trainingFacility.findMany();
    return facs.map(f => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      description: f.description || "",
      location: f.location || "",
      capacity: f.capacity || 0,
      isActive: f.isActive,
      images: Array.isArray(f.images) ? (f.images as string[]).map((img) => ({ secureUrl: img, source: "LOCAL_DEMO", resourceType: "image", fileName: img, altText: f.name, mediaStatus: "REAL_APPROVED", visibility: "PUBLIC", id: img, createdAt: new Date().toISOString() } as any)) : []
    }));
  }

  async getTrainingFacilityBySlug(slug: string): Promise<CmsTrainingFacility | null> {
    const f = await prisma.trainingFacility.findUnique({ where: { slug }});
    if (!f) return null;
    return {
      id: f.id,
      name: f.name,
      slug: f.slug,
      description: f.description || "",
      location: f.location || "",
      capacity: f.capacity || 0,
      isActive: f.isActive,
      images: Array.isArray(f.images) ? (f.images as string[]).map((img) => ({ secureUrl: img, source: "LOCAL_DEMO", resourceType: "image", fileName: img, altText: f.name, mediaStatus: "REAL_APPROVED", visibility: "PUBLIC", id: img, createdAt: new Date().toISOString() } as any)) : []
    };
  }

  async getFeaturedInsights(): Promise<CmsInsightArticle[]> {
    const insights = await prisma.insightArticle.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      include: { featuredImage: true, category: true, author: true },
      orderBy: { publishDate: 'desc' },
      take: 3
    });
    return insights.map(i => this.mapInsightToCms(i));
  }

  async getPublishedInsights(): Promise<CmsInsightArticle[]> {
    const insights = await prisma.insightArticle.findMany({
      where: { status: "PUBLISHED" },
      include: { featuredImage: true, category: true, author: true },
      orderBy: { publishDate: 'desc' }
    });
    return insights.map(i => this.mapInsightToCms(i));
  }

  async getInsightBySlug(slug: string): Promise<CmsInsightArticle | null> {
    const insight = await prisma.insightArticle.findUnique({
      where: { slug },
      include: { featuredImage: true, category: true, author: true }
    });
    if (!insight) return null;
    return this.mapInsightToCms(insight);
  }

  private mapInsightToCms(i: any): any {
    return {
      id: i.id,
      title: i.title,
      slug: i.slug,
      summary: i.summary || "",
      content: i.content,
      category: i.category?.name || "Uncategorized",
      tags: i.tags || [],
      authorName: i.author?.name || "Seven Seas Editorial Team",
      readingTime: i.readingTime || "5 min read",
      publishDate: i.publishDate ? i.publishDate.toISOString() : undefined,
      image: i.featuredImage ? {
        id: i.featuredImage.id,
        source: "LOCAL_DEMO",
        secureUrl: i.featuredImage.fileUrl,
        resourceType: "image",
        fileName: i.featuredImage.fileName,
        altText: i.featuredImage.altText || i.title,
        mediaStatus: i.featuredImage.status,
        visibility: i.featuredImage.isPublic ? "PUBLIC" : "PRIVATE",
        createdAt: i.featuredImage.createdAt?.toISOString() || "",
      } : undefined,
      seo: {
        metaTitle: i.metaTitle || undefined,
        metaDescription: i.metaDescription || undefined,
        canonicalUrl: i.canonicalUrl || undefined,
        ogImage: i.ogImage || undefined,
        ogTitle: i.ogTitle || undefined,
        ogDescription: i.ogDescription || undefined,
        noIndex: i.noIndex || false
      }
    };
  }

  async getStatistics(): Promise<CmsStatistic[]> {
    return [];
  }

  async getClientPartners(): Promise<CmsClientPartner[]> {
    return [];
  }

  async getTeamMembers(): Promise<CmsTeamMember[]> {
    return [];
  }

  async getMediaAssets(): Promise<CmsMediaAsset[]> {
    const assets = await prisma.mediaAsset.findMany();
    return assets.map(a => ({
      id: a.id,
      source: "LOCAL_DEMO",
      secureUrl: a.fileUrl,
      resourceType: "image",
      fileName: a.fileName,
      altText: a.altText || "",
      caption: a.caption || undefined,
      mediaStatus: a.status as any,
      visibility: a.isPublic ? "PUBLIC" : "PRIVATE",
      width: a.width || undefined,
      height: a.height || undefined,
      folder: a.folder || "",
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  }

  async getMediaAssetById(id: string): Promise<CmsMediaAsset | null> {
    const a = await prisma.mediaAsset.findUnique({ where: { id }});
    if (!a) return null;
    return {
      id: a.id,
      source: "LOCAL_DEMO",
      secureUrl: a.fileUrl,
      resourceType: "image",
      fileName: a.fileName,
      altText: a.altText || "",
      caption: a.caption || undefined,
      mediaStatus: a.status as any,
      visibility: a.isPublic ? "PUBLIC" : "PRIVATE",
      width: a.width || undefined,
      height: a.height || undefined,
      folder: a.folder || "",
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  }

  // ── Demands ─────────────────────────────────────────

  private mapDemandStatusBadge(demand: { status: string; applicationDeadline: Date | null; applicationStartDate: Date | null }): string {
    const now = new Date();
    if (demand.status === "CLOSED" || demand.status === "ARCHIVED") return "Closed";
    if (demand.status === "PUBLISHED") {
      if (demand.applicationStartDate && new Date(demand.applicationStartDate) > now) return "Upcoming";
      if (demand.applicationDeadline) {
        const deadline = new Date(demand.applicationDeadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return "Closed";
        if (daysLeft <= 7) return "Closing Soon";
      }
      return "Open";
    }
    return "Upcoming";
  }

  private mapDemandToCms(r: any): any {
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      companyName: r.companyName,
      companyLogo: r.companyLogo ? {
        id: r.companyLogo.id,
        source: "LOCAL_DEMO",
        secureUrl: r.companyLogo.fileUrl,
        resourceType: "image",
        fileName: r.companyLogo.fileName,
        altText: r.companyLogo.altText || "",
        mediaStatus: r.companyLogo.status,
        visibility: r.companyLogo.isPublic ? "PUBLIC" : "PRIVATE",
        createdAt: r.companyLogo.createdAt?.toISOString() || "",
      } : undefined,
      industry: r.industry?.name || undefined,
      industrySlug: r.industry?.slug || undefined,
      country: r.country?.name || "Unknown",
      countryCode: r.country?.code || undefined,
      city: r.city || undefined,
      employerAddress: r.employerAddress || undefined,
      demandReferenceNumber: r.demandReferenceNumber || undefined,
      approvalDate: r.approvalDate?.toISOString() || undefined,
      receivedDate: r.receivedDate?.toISOString() || undefined,
      applicationStartDate: r.applicationStartDate?.toISOString() || undefined,
      applicationDeadline: r.applicationDeadline?.toISOString() || undefined,
      interviewDate: r.interviewDate?.toISOString() || undefined,
      interviewLocation: r.interviewLocation || undefined,
      contractType: r.contractType || undefined,
      generalNotes: r.generalNotes || undefined,
      status: r.status,
      statusBadge: this.mapDemandStatusBadge(r),
      isPublic: r.isPublic,
      enableApplication: r.enableApplication,
      requiredApplicationDocuments: r.requiredApplicationDocuments || undefined,
      candidateInstructions: r.candidateInstructions || undefined,
      feeTransparencyNotice: r.feeTransparencyNotice || undefined,
      candidateSafetyNotice: r.candidateSafetyNotice || undefined,
      contactPerson: r.contactPerson || undefined,
      contactPhone: r.contactPhone || undefined,
      contactWhatsapp: r.contactWhatsapp || undefined,
      applicationConfirmationMessage: r.applicationConfirmationMessage || undefined,
      seoTitle: r.seoTitle || undefined,
      metaDescription: r.metaDescription || undefined,
      ogImageUrl: r.ogImageUrl || undefined,
      canonicalUrl: r.canonicalUrl || undefined,
      totalPositions: r.positions?.length || r._count?.positions || 0,
      totalManpower: r.positions?.reduce((sum: number, p: any) => sum + (p.totalCount || 0), 0) || 0,
      positions: (r.positions || []).map((p: any) => ({
        id: p.id,
        demandId: p.demandId,
        displayOrder: p.displayOrder || 0,
        title: p.title,
        maleCount: p.maleCount || undefined,
        femaleCount: p.femaleCount || undefined,
        totalCount: p.totalCount,
        minimumQualification: p.minimumQualification || undefined,
        requiredExperience: p.requiredExperience || undefined,
        requiredSkills: p.requiredSkills || undefined,
        salaryCurrency: p.salaryCurrency || undefined,
        salaryAmount: p.salaryAmount || undefined,
        nprEquivalent: p.nprEquivalent || undefined,
        overtimeStatus: p.overtimeStatus || "NOT_SPECIFIED",
        overtimeNotes: p.overtimeNotes || undefined,
        workHoursPerDay: p.workHoursPerDay || undefined,
        workDaysPerWeek: p.workDaysPerWeek || undefined,
        annualLeave: p.annualLeave || undefined,
        foodFacilityStatus: p.foodFacilityStatus || "NOT_SPECIFIED",
        foodFacilityNotes: p.foodFacilityNotes || undefined,
        accommodationStatus: p.accommodationStatus || "NOT_SPECIFIED",
        accommodationNotes: p.accommodationNotes || undefined,
        contractPeriod: p.contractPeriod || undefined,
        otherBenefits: p.otherBenefits || undefined,
        status: p.status,
        isPublic: p.isPublic,
      })),
      documents: (r.documents || []).map((d: any) => ({
        id: d.id,
        demandId: d.demandId,
        mediaAssetId: d.mediaAssetId || undefined,
        mediaAsset: d.mediaAsset ? {
          id: d.mediaAsset.id,
          source: "LOCAL_DEMO",
          secureUrl: d.mediaAsset.fileUrl,
          resourceType: "image",
          fileName: d.mediaAsset.fileName,
          altText: d.mediaAsset.altText || "",
          mediaStatus: d.mediaAsset.status,
          visibility: d.mediaAsset.isPublic ? "PUBLIC" : "PRIVATE",
          createdAt: d.mediaAsset.createdAt?.toISOString() || "",
        } : undefined,
        documentType: d.documentType,
        title: d.title || undefined,
        description: d.description || undefined,
        issueDate: d.issueDate?.toISOString() || undefined,
        expiryDate: d.expiryDate?.toISOString() || undefined,
        visibility: d.visibility || "PUBLIC",
        approvalStatus: d.approvalStatus || "PENDING",
      })),
      publishedAt: r.publishedAt?.toISOString() || undefined,
      closedAt: r.closedAt?.toISOString() || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString() || undefined,
      createdByName: r.createdBy?.name || undefined,
    };
  }

  private get demandIncludes() {
    return {
      country: true,
      industry: true,
      companyLogo: true,
      createdBy: { select: { name: true } },
      positions: { orderBy: { displayOrder: "asc" as const } },
      documents: { include: { mediaAsset: true } },
    };
  }

  async getPublishedDemands(filters?: CmsDemandFilters): Promise<CmsDemand[]> {
    const where: any = {
      status: "PUBLISHED",
      isPublic: true,
    };

    if (filters?.country) {
      where.country = { name: { contains: filters.country, mode: "insensitive" } };
    }
    if (filters?.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }
    if (filters?.company) {
      where.companyName = { contains: filters.company, mode: "insensitive" };
    }
    if (filters?.industry) {
      where.industry = { name: { contains: filters.industry, mode: "insensitive" } };
    }

    const results = await prisma.demand.findMany({
      where,
      include: this.demandIncludes,
      orderBy: { publishedAt: "desc" },
    });

    return results.map((r: any) => this.mapDemandToCms(r));
  }

  async getDemandBySlug(slug: string): Promise<CmsDemand | null> {
    const result = await prisma.demand.findUnique({
      where: { slug },
      include: this.demandIncludes,
    });

    if (!result) return null;
    return this.mapDemandToCms(result);
  }

  async getDemandFilterOptions(): Promise<{ countries: string[]; cities: string[]; companies: string[]; industries: string[] }> {
    const demands = await prisma.demand.findMany({
      where: { status: "PUBLISHED", isPublic: true },
      select: {
        companyName: true,
        city: true,
        country: { select: { name: true } },
        industry: { select: { name: true } },
      },
    });

    const countriesSet = new Set<string>();
    const citiesSet = new Set<string>();
    const companiesSet = new Set<string>();
    const industriesSet = new Set<string>();

    for (const d of demands) {
      if (d.country?.name) countriesSet.add(d.country.name);
      if (d.city) citiesSet.add(d.city);
      if (d.companyName) companiesSet.add(d.companyName);
      if (d.industry?.name) industriesSet.add(d.industry.name);
    }

    return {
      countries: Array.from(countriesSet).sort(),
      cities: Array.from(citiesSet).sort(),
      companies: Array.from(companiesSet).sort(),
      industries: Array.from(industriesSet).sort(),
    };
  }
}

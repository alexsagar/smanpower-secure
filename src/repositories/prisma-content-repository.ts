import "server-only";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { cmsMediaResourceTypeFromAuthoritative } from "@/lib/media-resource-type";
import { getDemandApplicationStatus, normalizeDemandVacancies } from "@/lib/demand-presentation";
import { COMPLIANCE_LOGO_ALT } from "@/config/approved-content";
import type {
  CmsPage,
  CmsHeroSection,
  CmsContentBlock,
  CmsPageSeo,
  CmsNavigation,
  NavLocation,
  CmsSiteSettings,
  CmsFooterSettings,
  CmsSocialLink,
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
  CmsDemand,
  CmsDemandFilters,
  CmsMediaAsset,
  MediaResourceType,
  MediaStatus,
  MediaVisibility,
} from "@/types/content";
import type { ContentRepository } from "./content-repository";

const COMPATIBILITY_FAX_DISPLAY = "Fax: +977-1-4479655";
const COMPATIBILITY_FAX_HREF = "tel:+977-1-4479655";

const DEFAULT_SITE_SETTINGS: CmsSiteSettings = {
  companyName: "Seven Seas Intercontinental",
  companyShortName: "Seven Seas",
  companyLegalName: "Seven Seas Intercontinental Services Pvt. Ltd.",
  tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
  website: "https://smanpower.com",
  domain: "smanpower.com",
  logoUrl: "/images/SSIS.png",
  address: "",
  addressLine2: "",
  city: "Kathmandu",
  province: "Bagmati",
  country: "Nepal",
  phone: "",
  faxDisplay: COMPATIBILITY_FAX_DISPLAY,
  faxHref: COMPATIBILITY_FAX_HREF,
  email: "",
  whatsapp: "",
  officeHours: "",
  defaultSeo: { metaTitle: "", metaDescription: "" },
};

const DEFAULT_FOOTER_SETTINGS: CmsFooterSettings = {
  tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
  ctaText: "Partner With Us",
  ctaHref: "/contact",
  sections: [],
  socialLinks: [],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Worker Grievance", href: "/worker-grievance" },
  ],
  copyrightText: `Copyright ${new Date().getFullYear()} Seven Seas Intercontinental Services Pvt. Ltd. All rights reserved.`,
  certificationLogos: [
    { imageUrl: "/images/sedex.png", accessibleName: COMPLIANCE_LOGO_ALT.sedex, enabled: true, order: 1 },
    { imageUrl: "/images/rba.png", accessibleName: COMPLIANCE_LOGO_ALT.rba, enabled: true, order: 2 },
    { imageUrl: "/images/iso.png", accessibleName: COMPLIANCE_LOGO_ALT.iso, enabled: true, order: 3 },
  ],
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function isValidExternalUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.hostname.includes("localhost");
  } catch {
    return false;
  }
}

function isValidInternalHref(value: string | undefined) {
  return typeof value === "string" && value.startsWith("/") && value !== "#";
}

function readHref(value: unknown): string | undefined {
  const href = readString(value);
  if (!href || href === "#") return undefined;
  if (isValidInternalHref(href)) return href;
  return isValidExternalUrl(href) ? href : undefined;
}

function readLinkList(
  value: unknown,
  fallback: { label: string; href: string }[]
): { label: string; href: string }[] {
  if (!Array.isArray(value)) return fallback;

  const links = value
    .map((entry) => {
      const record = asRecord(entry);
      const label = readString(record.label);
      const href = readHref(record.href);
      return label && href ? { label, href } : null;
    })
    .filter((entry): entry is { label: string; href: string } => Boolean(entry));

  return links.length > 0 ? links : fallback;
}

function normalizeFooterSocialLinks(value: unknown): CmsSocialLink[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry, index): CmsSocialLink | null => {
      const record = asRecord(entry);
      const platform = readString(record.platform)?.toLowerCase();
      const label = readString(record.label);
      const url = readString(record.url);
      const isActive = typeof record.isActive === "boolean" ? record.isActive : true;
      const order = typeof record.order === "number" && Number.isFinite(record.order) ? record.order : index + 1;

      if (!platform || !label || !url || !isActive || !isValidExternalUrl(url)) {
        return null;
      }

      return {
        platform,
        label,
        url,
        isActive,
        order,
      };
    })
    .filter((link): link is CmsSocialLink => Boolean(link))
    .sort((a, b) => a.order - b.order || a.platform.localeCompare(b.platform) || a.label.localeCompare(b.label));
}

function buildAddressLines(
  settings: Pick<CmsSiteSettings, "address" | "addressLine2" | "city" | "province" | "country" | "postalCode">
) {
  const locality = [settings.city, settings.province, settings.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ");

  const localityWithPostal = [locality, settings.postalCode]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ");

  return [settings.address, settings.addressLine2, localityWithPostal].filter(
    (value): value is string => Boolean(value && value.trim())
  );
}

function normalizePhoneHref(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

function normalizeEmailHref(value: string | undefined) {
  return value ? `mailto:${value}` : undefined;
}

function normalizeWhatsAppHref(value: string | undefined) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

function readTelHref(value: unknown) {
  const href = readString(value);
  return href?.startsWith("tel:") ? href : undefined;
}

function readMailtoHref(value: unknown) {
  const href = readString(value);
  return href?.startsWith("mailto:") ? href : undefined;
}

function readWhatsAppHref(value: unknown) {
  const href = readString(value);
  return href && href.startsWith("https://wa.me/") ? href : undefined;
}

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

type PrismaMediaRecord = {
  id: string;
  publicId?: string | null;
  assetId?: string | null;
  fileUrl: string;
  fileName: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  tags?: string[] | null;
  status: string;
  isPublic: boolean;
  mimeType?: string | null;
  fileSize?: number | null;
  resourceType: "IMAGE" | "VIDEO" | "DOCUMENT";
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;
};

export function mapPrismaMediaAsset(
  asset: PrismaMediaRecord
): CmsMediaAsset {
  return {
    id: asset.id,
    source: "CLOUDINARY",
    cloudinaryPublicId: asset.publicId || undefined,
    cloudinaryAssetId: asset.assetId || undefined,
    secureUrl: asset.fileUrl,
    resourceType: cmsMediaResourceTypeFromAuthoritative(asset.resourceType),
    format: asset.mimeType?.split("/")[1] || undefined,
    width: asset.width || undefined,
    height: asset.height || undefined,
    duration: asset.duration || undefined,
    bytes: asset.fileSize || undefined,
    fileName: asset.fileName,
    altText: asset.altText || "",
    caption: asset.caption || undefined,
    folder: asset.folder || undefined,
    tags: asset.tags || undefined,
    mediaStatus: asset.status as MediaStatus,
    visibility: (asset.isPublic ? "PUBLIC" : "PRIVATE") as MediaVisibility,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt?.toISOString() || undefined,
  };
}

export function mapUrlBackedMediaAsset(
  secureUrl: string,
  options: {
    id?: string;
    fileName?: string;
    altText: string;
    resourceType?: MediaResourceType;
    createdAt?: string;
  }
): CmsMediaAsset {
  const derivedFileName =
    options.fileName ||
    secureUrl.split("/").pop() ||
    "media";

  return {
    id: options.id || derivedFileName,
    source: "CLOUDINARY",
    secureUrl,
    resourceType: options.resourceType || "image",
    fileName: derivedFileName,
    altText: options.altText,
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    createdAt: options.createdAt || new Date().toISOString(),
  };
}

type PrismaNavigationChild = {
  id: string;
  label: string;
  href?: string | null;
  order: number;
  isActive: boolean;
};

type PrismaNavigationGroup = {
  id: string;
  label: string;
  location: NavLocation;
  order: number;
  isActive: boolean;
  children: PrismaNavigationChild[];
};

type TeamMemberRecord = {
  id: string;
  name: string;
  nameNe?: string;
  designation: string;
  department?: string;
  bio?: string;
  photo?: string;
  photoAltText?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  group?: "LEADERSHIP" | "PEOPLE" | "BOTH";
  order: number;
  isPublished: boolean;
};

type StatisticRecord = {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  description: string;
  source?: string;
  order: number;
};

const TEAM_MEMBERS_SETTING_KEY = "team_members";

export function mapNavigationGroups(navs: PrismaNavigationGroup[]): CmsNavigation[] {
  return navs
    .filter((nav) => nav.isActive)
    .map((nav) => ({
      id: nav.id,
      label: nav.label,
      labelNe: undefined,
      location: nav.location,
      order: nav.order,
      items: nav.children
        .filter((child) => child.isActive && Boolean(child.href))
        .map((child) => ({
          id: child.id,
          label: child.label,
          href: child.href as string,
          order: child.order,
          isActive: child.isActive,
        })),
    }));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function mapStatisticRecord(entry: unknown): CmsStatistic | null {
  if (!isObject(entry)) return null;

  const id = asString(entry.id);
  const label = asString(entry.label);
  const value = asString(entry.value);
  const description = asString(entry.description);
  const order =
    typeof entry.order === "number" && Number.isFinite(entry.order)
      ? entry.order
      : null;

  if (!id || !label || !value || !description || order === null) {
    return null;
  }

  return {
    id,
    label,
    value,
    suffix: asString(entry.suffix),
    description,
    source: asString(entry.source),
    order,
  };
}

function mapTeamMemberRecord(entry: unknown): CmsTeamMember | null {
  if (!isObject(entry)) return null;

  const id = asString(entry.id);
  const name = asString(entry.name);
  const designation = asString(entry.designation);
  const order =
    typeof entry.order === "number" && Number.isFinite(entry.order)
      ? entry.order
      : null;
  const isPublished = typeof entry.isPublished === "boolean" ? entry.isPublished : null;

  if (!id || !name || !designation || order === null || isPublished === null) {
    return null;
  }

  return {
    id,
    name,
    nameNe: asString(entry.nameNe),
    designation,
    department: asString(entry.department),
    bio: asString(entry.bio),
    photo: entry.photo
      ? mapUrlBackedMediaAsset(String(entry.photo), {
          id: `${id}-photo`,
          altText: asString(entry.photoAltText) || name,
        })
      : undefined,
    photoAltText: asString(entry.photoAltText) || name,
    email: asString(entry.email),
    phone: asString(entry.phone),
    linkedIn: asString(entry.linkedIn),
    group: entry.group === "LEADERSHIP" || entry.group === "BOTH" ? entry.group : "PEOPLE",
    order,
    isPublished,
  };
}

export class PrismaContentRepository implements ContentRepository {
  private logRepositoryError(methodName: string, error: unknown): never {
    const normalized =
      error instanceof Error ? error : new Error(String(error));
    logger.error(`PrismaContentRepository.${methodName} failed`, normalized);
    throw normalized;
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
          include: { image: true, video: true, posterImage: true, mobileImage: true }
        },
        blocks: {
          include: { image: true, video: true, posterImage: true, mobileImage: true },
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
        overlayOpacity: page.hero.overlayOpacity,
        textAlignment: "left",
        verticalAlignment: "center",
        image: page.hero.image ? mapPrismaMediaAsset(page.hero.image as PrismaMediaRecord) as any : undefined,
        video: page.hero.video ? mapPrismaMediaAsset(page.hero.video as PrismaMediaRecord) as any : undefined,
        videoPoster: page.hero.posterImage ? mapPrismaMediaAsset(page.hero.posterImage as PrismaMediaRecord) as any : undefined,
        mobileImage: page.hero.mobileImage ? mapPrismaMediaAsset(page.hero.mobileImage as PrismaMediaRecord) as any : undefined,
      } : undefined,
      blocks: page.blocks.map(b => ({
        id: b.id,
        blockType: b.blockType as any,
        blockKey: b.blockKey,
        order: b.order,
        visible: b.visible,
        richHeading: safeJsonParse(b.richHeading, `block[${b.blockType}].richHeading`) as any,
        content: safeJsonParse(b.content, `block[${b.blockType}].content`) as any,
        image: b.image ? mapPrismaMediaAsset(b.image as PrismaMediaRecord) as any : undefined,
        video: b.video ? mapPrismaMediaAsset(b.video as PrismaMediaRecord) as any : undefined,
        videoPoster: b.posterImage ? mapPrismaMediaAsset(b.posterImage as PrismaMediaRecord) as any : undefined,
        mobileImage: b.mobileImage ? mapPrismaMediaAsset(b.mobileImage as PrismaMediaRecord) as any : undefined,
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
      where: { location, parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return mapNavigationGroups(navs as PrismaNavigationGroup[]);
  }

  async getSiteSettings(): Promise<CmsSiteSettings> {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["footer_contact"],
        },
      },
    });

    const settingMap = new Map(settings.map((setting) => [setting.key, setting.value]));
    const contact = asRecord(safeJsonParse(settingMap.get("footer_contact"), "footer_contact", {}));

    const normalized: CmsSiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      address: readString(contact.address) || DEFAULT_SITE_SETTINGS.address,
      addressLine2: readString(contact.addressLine2) || DEFAULT_SITE_SETTINGS.addressLine2,
      city: readString(contact.city) || DEFAULT_SITE_SETTINGS.city,
      province: readString(contact.province) || DEFAULT_SITE_SETTINGS.province,
      country: readString(contact.country) || DEFAULT_SITE_SETTINGS.country,
      postalCode: readString(contact.postalCode),
      phone: readString(contact.phone) || DEFAULT_SITE_SETTINGS.phone,
      phoneDisplay: readString(contact.phoneDisplay) || readString(contact.phone) || DEFAULT_SITE_SETTINGS.phone,
      phoneHref:
        readTelHref(contact.phoneHref) ||
        normalizePhoneHref(readString(contact.phoneDisplay) || readString(contact.phone) || DEFAULT_SITE_SETTINGS.phone),
      faxDisplay:
        readString(contact.faxDisplay) || readString(contact.fax) || DEFAULT_SITE_SETTINGS.faxDisplay,
      faxHref:
        readTelHref(contact.faxHref) ||
        normalizePhoneHref(readString(contact.faxDisplay) || readString(contact.fax)) ||
        DEFAULT_SITE_SETTINGS.faxHref,
      email: readString(contact.email) || DEFAULT_SITE_SETTINGS.email,
      emailDisplay: readString(contact.emailDisplay) || readString(contact.email) || DEFAULT_SITE_SETTINGS.email,
      emailHref:
        readMailtoHref(contact.emailHref) ||
        normalizeEmailHref(readString(contact.emailDisplay) || readString(contact.email) || DEFAULT_SITE_SETTINGS.email),
      whatsapp: readString(contact.whatsapp) || DEFAULT_SITE_SETTINGS.whatsapp,
      whatsappDisplay:
        readString(contact.whatsappDisplay) || readString(contact.whatsapp) || DEFAULT_SITE_SETTINGS.whatsapp,
      whatsappHref:
        readWhatsAppHref(contact.whatsappHref) ||
        normalizeWhatsAppHref(
          readString(contact.whatsappDisplay) || readString(contact.whatsapp) || DEFAULT_SITE_SETTINGS.whatsapp
        ),
      officeHours: readString(contact.officeHours) || DEFAULT_SITE_SETTINGS.officeHours,
      defaultSeo: DEFAULT_SITE_SETTINGS.defaultSeo,
    };

    return {
      ...normalized,
      footerAddressLines: buildAddressLines(normalized),
    };
  }

  async getFooterSettings(): Promise<CmsFooterSettings> {
    const [settings, footerNavs] = await Promise.all([
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: ["footer_mission", "footer_cta", "footer_legal_links", "footer_copyright", "footer_social_links", "footer_ai_summary_config", "footer_certification_logos"],
          },
        },
      }),
      prisma.navigationItem.findMany({
        where: { location: "footer", parentId: null, isActive: true },
        include: { children: { where: { isActive: true }, orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      }),
    ]);

    const settingMap = new Map(settings.map((setting) => [setting.key, setting.value]));
    const cta = asRecord(safeJsonParse(settingMap.get("footer_cta"), "footer_cta", {}));
    const ctaText = readString(cta.text);
    const ctaHref = readHref(cta.href);

    const sections = footerNavs.map(nav => ({
      title: nav.label,
      links: nav.children
        .filter((child) => Boolean(child.href))
        .map(child => ({
          label: child.label,
          href: child.href as string
        }))
    }));

    const aiSummaryRaw = settingMap.get("footer_ai_summary_config");
    let aiSummary: CmsFooterSettings["aiSummary"];
    if (aiSummaryRaw) {
      try {
        const parsed = typeof aiSummaryRaw === "string" ? JSON.parse(aiSummaryRaw) : aiSummaryRaw;
        if (parsed && typeof parsed === "object") {
          aiSummary = parsed as CmsFooterSettings["aiSummary"];
        }
      } catch {
        // ignore parsing error
      }
    }

    return {
      tagline: readString(settingMap.get("footer_mission")) || DEFAULT_FOOTER_SETTINGS.tagline,
      ctaText: ctaText && ctaHref ? ctaText : DEFAULT_FOOTER_SETTINGS.ctaText,
      ctaHref: ctaText && ctaHref ? ctaHref : DEFAULT_FOOTER_SETTINGS.ctaHref,
      sections: sections.length > 0 ? sections : DEFAULT_FOOTER_SETTINGS.sections,
      socialLinks: normalizeFooterSocialLinks(
        safeJsonParse(settingMap.get("footer_social_links"), "footer_social_links", [])
      ),
      copyrightText:
        readString(settingMap.get("footer_copyright")) || DEFAULT_FOOTER_SETTINGS.copyrightText,
      legalLinks: readLinkList(
        safeJsonParse(settingMap.get("footer_legal_links"), "footer_legal_links", []),
        DEFAULT_FOOTER_SETTINGS.legalLinks
      ),
      aiSummary,
      certificationLogos: Array.isArray(safeJsonParse(settingMap.get("footer_certification_logos"), "footer_certification_logos", null))
        ? safeJsonParse(settingMap.get("footer_certification_logos"), "footer_certification_logos", []) as CmsFooterSettings["certificationLogos"]
        : DEFAULT_FOOTER_SETTINGS.certificationLogos,
    };
  }

  async getPublishedJobs(filters?: { country?: string; industry?: string }): Promise<CmsJob[]> {
    try {
      const now = new Date();
      const jobs = await prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          OR: [
            { deadline: null },
            { deadline: { gte: now } },
          ],
          ...(filters?.country
            ? { country: { name: { equals: filters.country, mode: "insensitive" } } }
            : {}),
          ...(filters?.industry
            ? { industry: { name: { equals: filters.industry, mode: "insensitive" } } }
            : {}),
        },
        include: {
          country: true,
          industry: true,
        },
        orderBy: [
          { isFeatured: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
          { id: "asc" },
        ],
      });

      return jobs.map((job) => ({
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements || undefined,
        benefits: job.benefits || undefined,
        responsibilities: job.responsibilities || undefined,
        country: job.country.name,
        countryCode: job.country.code,
        industry: job.industry.name,
        employerName: job.employerName || undefined,
        showEmployerName: job.showEmployerName,
        salary: job.salary || undefined,
        showSalary: job.showSalary,
        contractPeriod: job.contractPeriod || undefined,
        employmentType: job.employmentType,
        experienceRequired: job.experienceRequired || undefined,
        skillsRequired: job.skillsRequired || undefined,
        educationRequired: job.educationRequired || undefined,
        languageRequired: job.languageRequired || undefined,
        documentsRequired: job.documentsRequired || undefined,
        deadline: job.deadline?.toISOString(),
        status: job.status,
        isFeatured: job.isFeatured,
        vacancies: job.vacancies,
        feeNotice: job.feeNotice || undefined,
        safetyNotice: job.safetyNotice || undefined,
        metaTitle: job.metaTitle || undefined,
        metaDescription: job.metaDescription || undefined,
        publishedAt: job.publishedAt?.toISOString(),
        createdAt: job.createdAt.toISOString(),
      }));
    } catch (error) {
      return this.logRepositoryError("getPublishedJobs", error);
    }
  }

  async getJobBySlug(slug: string): Promise<CmsJob | null> {
    try {
      const now = new Date();
      const job = await prisma.job.findFirst({
        where: {
          slug,
          status: "PUBLISHED",
          deletedAt: null,
          OR: [
            { deadline: null },
            { deadline: { gte: now } },
          ],
        },
        include: {
          country: true,
          industry: true,
        },
      });

      if (!job) return null;

      return {
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements || undefined,
        benefits: job.benefits || undefined,
        responsibilities: job.responsibilities || undefined,
        country: job.country.name,
        countryCode: job.country.code,
        industry: job.industry.name,
        employerName: job.employerName || undefined,
        showEmployerName: job.showEmployerName,
        salary: job.salary || undefined,
        showSalary: job.showSalary,
        contractPeriod: job.contractPeriod || undefined,
        employmentType: job.employmentType,
        experienceRequired: job.experienceRequired || undefined,
        skillsRequired: job.skillsRequired || undefined,
        educationRequired: job.educationRequired || undefined,
        languageRequired: job.languageRequired || undefined,
        documentsRequired: job.documentsRequired || undefined,
        deadline: job.deadline?.toISOString(),
        status: job.status,
        isFeatured: job.isFeatured,
        vacancies: job.vacancies,
        feeNotice: job.feeNotice || undefined,
        safetyNotice: job.safetyNotice || undefined,
        metaTitle: job.metaTitle || undefined,
        metaDescription: job.metaDescription || undefined,
        publishedAt: job.publishedAt?.toISOString(),
        createdAt: job.createdAt.toISOString(),
      };
    } catch (error) {
      return this.logRepositoryError("getJobBySlug", error);
    }
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

  async getPublishedStories(limit?: number): Promise<CmsSuccessStory[]> {
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      include: { featuredImage: true, industry: true, country: true },
      orderBy: { storyDate: 'desc' },
      ...(limit ? { take: limit } : {})
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
      // Field names must match CmsSuccessStory — the public pages read these directly.
      featuredImageId: s.featuredImageId || null,
      featuredImage: s.featuredImage ? {
        ...mapPrismaMediaAsset(s.featuredImage as PrismaMediaRecord),
        altText: s.featuredImage.altText || s.title,
      } : null,
      status: s.status,
      isPublished: s.status === "PUBLISHED",
      isFeatured: s.isFeatured ?? false,
      metaTitle: s.metaTitle || undefined,
      metaDescription: s.metaDescription || undefined,
      canonicalUrl: s.canonicalUrl || undefined,
      ogImage: s.ogImage || undefined,
      noIndex: s.noIndex || false,
      createdAt: s.createdAt ? s.createdAt.toISOString() : "",
      publishedAt: s.publishedAt ? s.publishedAt.toISOString() : undefined
    };
  }

  async getPublishedTestimonials(): Promise<CmsTestimonial[]> {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: {
          isPublished: true,
          consentGiven: true,
        },
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" },
          { id: "asc" },
        ],
      });

      return testimonials.map((testimonial) => ({
        id: testimonial.id,
        personName: testimonial.personName,
        designation: testimonial.designation || undefined,
        companyName: testimonial.companyName || undefined,
        content: testimonial.content,
        image: testimonial.image
          ? mapUrlBackedMediaAsset(testimonial.image, {
              id: `${testimonial.id}-image`,
              altText: testimonial.personName,
            })
          : undefined,
        rating: testimonial.rating || undefined,
        storyType:
          testimonial.storyType === "candidate" ? "candidate" : "employer",
        consentGiven: testimonial.consentGiven,
        isPublished: testimonial.isPublished,
        order: testimonial.order,
      }));
    } catch (error) {
      return this.logRepositoryError("getPublishedTestimonials", error);
    }
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
      image: i.image ? mapUrlBackedMediaAsset(i.image, { altText: i.name }) as any : undefined,
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
      image: i.image ? mapUrlBackedMediaAsset(i.image, { altText: i.name }) as any : undefined,
    };
  }

  async getPublicTrustDocuments(): Promise<CmsComplianceDocument[]> {
    // The `order` column was ignored here, so Postgres returned these in
    // whatever order it liked and the homepage trust section shuffled. `id` is
    // the tiebreak so equal `order` values still render deterministically.
    const docs = await prisma.complianceDocument.findMany({
      where: { isPublic: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
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
      images: Array.isArray(f.images) ? (f.images as string[]).map((img) => mapUrlBackedMediaAsset(img, { id: img, altText: f.name }) as any) : []
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
      images: Array.isArray(f.images) ? (f.images as string[]).map((img) => mapUrlBackedMediaAsset(img, { id: img, altText: f.name }) as any) : []
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
        ...mapPrismaMediaAsset(i.featuredImage as PrismaMediaRecord),
        altText: i.featuredImage.altText || i.title,
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
    try {
      const block = await prisma.cmsContentBlock.findFirst({
        where: {
          blockType: "statistics",
          visible: true,
          page: {
            slug: "home",
            status: "PUBLISHED",
          },
        },
        select: {
          content: true,
        },
        orderBy: [
          { order: "asc" },
          { id: "asc" },
        ],
      });

      const content = safeJsonParse<Record<string, unknown>>(
        block?.content,
        "cmsContentBlock.content",
        {}
      ) as Record<string, unknown>;
      const stats = Array.isArray(content.stats)
        ? content.stats
        : [];

      return stats
        .map(mapStatisticRecord)
        .filter((stat): stat is CmsStatistic => stat !== null)
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    } catch (error) {
      return this.logRepositoryError("getStatistics", error);
    }
  }

  async getClientPartners(): Promise<CmsClientPartner[]> {
    try {
      const partners = await prisma.clientPartner.findMany({
        where: {
          isPublic: true,
        },
        orderBy: [
          { order: "asc" },
          { createdAt: "asc" },
          { id: "asc" },
        ],
      });

      return partners.map((partner) => ({
        id: partner.id,
        name: partner.name,
        logoUrl: partner.logoUrl || undefined,
        website: partner.website || undefined,
        country: partner.country || undefined,
        industry: partner.industry || undefined,
        type: partner.category === "GROUP_COMPANY" ? "group_company" : "client",
        isPublic: partner.isPublic,
        isVerified: partner.isVerified,
        order: partner.order,
      }));
    } catch (error) {
      return this.logRepositoryError("getClientPartners", error);
    }
  }

  async getTeamMembers(): Promise<CmsTeamMember[]> {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: {
          key: TEAM_MEMBERS_SETTING_KEY,
        },
        select: {
          value: true,
        },
      });

      const members = Array.isArray(setting?.value)
        ? setting?.value
        : [];

      return members
        .map(mapTeamMemberRecord)
        .filter((member): member is CmsTeamMember => member !== null && member.isPublished)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    } catch (error) {
      return this.logRepositoryError("getTeamMembers", error);
    }
  }

  async getMediaAssets(): Promise<CmsMediaAsset[]> {
    const assets = await prisma.mediaAsset.findMany();
    return assets.map(a => ({
      ...mapPrismaMediaAsset(a as PrismaMediaRecord),
    }));
  }

  async getMediaAssetById(id: string): Promise<CmsMediaAsset | null> {
    const a = await prisma.mediaAsset.findUnique({ where: { id }});
    if (!a) return null;
    return mapPrismaMediaAsset(a as PrismaMediaRecord);
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
    const positions = r.positions || [];
    const vacancies = normalizeDemandVacancies(positions);
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      companyName: r.companyName,
      companyLogo: r.companyLogo ? {
        ...mapPrismaMediaAsset(r.companyLogo as PrismaMediaRecord),
      } : undefined,
      featuredImage: r.featuredImage ? {
        ...mapPrismaMediaAsset(r.featuredImage as PrismaMediaRecord),
      } : undefined,
      industry: r.industry?.name || undefined,
      industrySlug: r.industry?.slug || undefined,
      country: r.country?.name || "Unknown",
      countryCode: r.country?.code || undefined,
      city: r.city || undefined,
      employerAddress: r.employerAddress || undefined,
      demandReferenceNumber: r.demandReferenceNumber || undefined,
      demandLotNumber: r.demandReferenceNumber || undefined,
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
      // Derived from the actual relation, never from the title text.
      isReadvertisement: Boolean(r.readvertisedFromId),
      // Real relationship links (only present on single-demand fetches). Never
      // fabricated: undefined when the linked record is unavailable.
      readvertisedFrom: r.readvertisedFrom
        ? { slug: r.readvertisedFrom.slug, demandLotNumber: r.readvertisedFrom.demandReferenceNumber || undefined }
        : undefined,
      currentReadvertisement: (() => {
        const child = (r.readvertisements || []).find(
          (c: any) => c.status === "PUBLISHED" || c.status === "CLOSED"
        );
        return child ? { slug: child.slug, demandLotNumber: child.demandReferenceNumber || undefined } : undefined;
      })(),
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
      totalManpower: vacancies.totalVacancies,
      ...vacancies,
      ...getDemandApplicationStatus(r, process.env.PUBLIC_APPLICATIONS_ENABLED === "true"),
      positions: (r.positions || []).map((p: any) => ({
        id: p.id,
        demandId: p.demandId,
        displayOrder: p.displayOrder || 0,
        title: p.title,
        maleCount: p.maleCount ?? undefined,
        femaleCount: p.femaleCount ?? undefined,
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
          ...mapPrismaMediaAsset(d.mediaAsset as PrismaMediaRecord),
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
      featuredImage: true,
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
    // Soft-deleted demands are never publicly viewable. Include the
    // readvertisement links (original + public children) so the detail page can
    // render the visible relationship without a second query.
    const result = await prisma.demand.findFirst({
      where: { slug, deletedAt: null },
      include: {
        ...this.demandIncludes,
        readvertisedFrom: { select: { slug: true, demandReferenceNumber: true } },
        readvertisements: {
          where: { deletedAt: null, isPublic: true },
          select: { slug: true, demandReferenceNumber: true, status: true },
          orderBy: { createdAt: "desc" },
        },
      },
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

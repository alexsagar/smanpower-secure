import { getSiteUrl, siteConfig } from "./site-config";
import type { CmsFooterSettings, CmsSiteSettings } from "@/types/content";
import { generateDemandSeo } from "@/lib/demand-presentation";

/**
 * Builds the Organization JSON-LD schema based strictly on verified data.
 * Does not emit unverified or fake information.
 */
export const buildOrganizationSchema = (settings?: CmsSiteSettings, footer?: CmsFooterSettings) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": settings?.companyName || siteConfig.name,
    "url": siteUrl,
    ...(settings?.companyLegalName ? { "legalName": settings.companyLegalName } : {}),
    ...(settings?.logoUrl ? { "logo": settings.logoUrl } : {}),
    ...(settings?.address || settings?.country ? { "address": { "@type": "PostalAddress", ...(settings.address ? { streetAddress: settings.address } : {}), ...(settings.city ? { addressLocality: settings.city } : {}), ...(settings.province ? { addressRegion: settings.province } : {}), ...(settings.postalCode ? { postalCode: settings.postalCode } : {}), ...(settings.country ? { addressCountry: settings.country } : {}) } } : {}),
    ...(settings?.phone ? { "telephone": settings.phone } : {}),
    ...(settings?.email ? { "email": settings.email } : {}),
    ...(footer?.socialLinks?.filter((link) => link.isActive && /^https:\/\//.test(link.url)).map((link) => link.url).length ? { "sameAs": footer.socialLinks.filter((link) => link.isActive && /^https:\/\//.test(link.url)).map((link) => link.url) } : {}),
  };
};

/**
 * Builds BlogPosting JSON-LD for an insight/article detail page. Emits only
 * verified fields from the article record — no invented data.
 */
export const buildArticleSchema = (article: {
  title: string;
  slug: string;
  summary?: string | null;
  metaDescription?: string | null;
  imageUrl?: string | null;
  authorName?: string | null;
  publishDate?: Date | string | null;
  updatedAt?: Date | string | null;
}) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  const url = `${siteUrl}/insights/${article.slug}`;
  const toIso = (d?: Date | string | null) =>
    d ? (typeof d === "string" ? d : d.toISOString()) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "headline": article.title,
    "url": url,
    ...(article.metaDescription || article.summary
      ? { "description": article.metaDescription || article.summary }
      : {}),
    ...(article.imageUrl ? { "image": [article.imageUrl] } : {}),
    ...(article.publishDate ? { "datePublished": toIso(article.publishDate) } : {}),
    "dateModified": toIso(article.updatedAt) || toIso(article.publishDate),
    "author": { "@type": "Organization", "name": article.authorName || siteConfig.name },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "@id": `${siteUrl}/#organization`,
    },
  };
};

/**
 * Strict business rule function to determine if a specific Demand Position
 * is eligible for public JobPosting JSON-LD schema generation.
 */
export const isEligibleForJobPostingSchema = ({ demand, position }: { demand: any, position: any }) => {
  // Global / Environment checks
  if (process.env.DEMO_MODE === "true" || process.env.QA_MODE === "true") {
    return false;
  }

  // Demand-level checks
  if (
    !demand ||
    demand.status !== "PUBLISHED" ||
    !demand.isPublic ||
    !demand.title ||
    !demand.companyName ||
    !(typeof demand.country === "string" ? demand.country : demand.country?.name)
  ) {
    return false;
  }

  // Position-level checks
  if (
    !position ||
    position.status !== "OPEN" ||
    !position.isPublic ||
    !position.title
  ) {
    return false;
  }

  // Expiry check
  const deadline = position.deadlineOverride || demand.applicationDeadline;
  if (deadline && new Date(deadline).getTime() < new Date().getTime()) {
    return false; // Expired
  }

  return true;
};

/**
 * Builds a strict JobPosting schema for a specific position within a demand.
 * Returns null if the position is not eligible.
 */
export const buildJobPostingSchema = (demand: any, position: any) => {
  if (!isEligibleForJobPostingSchema({ demand, position })) {
    return null;
  }

  // Check application deadline (fallback to demand deadline if position override missing)
  const deadline = position.deadlineOverride || demand.applicationDeadline;
  const validThrough = deadline ? new Date(deadline).toISOString() : null;
  
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;
  const country = typeof demand.country === "string" ? demand.country : demand.country.name;
  const generatedSeo = generateDemandSeo({ ...demand, country });

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": position.title,
    "description": demand.metaDescription || demand.generalNotes || generatedSeo.description,
    ...(demand.publishedAt ? { "datePosted": new Date(demand.publishedAt).toISOString() } : {}),
    "url": `${siteUrl}/demands/${demand.slug}`,
    ...(validThrough ? { "validThrough": validThrough } : {}),
    "hiringOrganization": {
      "@type": "Organization",
      "name": demand.companyName,
      ...(demand.companyLogo?.fileUrl ? { "logo": demand.companyLogo.fileUrl } : {})
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": country
      }
    }
  };
};

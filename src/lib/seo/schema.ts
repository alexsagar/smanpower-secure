import { getSiteUrl, siteConfig } from "./site-config";
import { BRAND, CONTACT } from "@/lib/constants";
import type { CmsFooterSettings, CmsSiteSettings } from "@/types/content";
import { generateDemandSeo } from "@/lib/demand-presentation";
import { toSafeIsoString } from "@/lib/date";

/**
 * Builds the Organization JSON-LD schema based strictly on verified data.
 * Does not emit unverified or fake information.
 */
export const buildOrganizationSchema = (settings?: CmsSiteSettings, footer?: CmsFooterSettings) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  const rawLogo = settings?.logoUrl || "/images/SSIS.webp";
  const logo = rawLogo.startsWith("http://") || rawLogo.startsWith("https://")
    ? rawLogo
    : `${siteUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`;

  const legalName = settings?.companyLegalName || BRAND.legalName;
  const address = settings?.address || CONTACT.address;
  const phone = settings?.phone || CONTACT.phone;
  const email = settings?.email || CONTACT.email;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": settings?.companyName || siteConfig.name,
    "url": siteUrl,
    "legalName": legalName,
    "foundingDate": "2010",
    "logo": logo,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": settings?.city || "Kathmandu",
      "addressRegion": settings?.province || "Bagmati Province",
      "postalCode": settings?.postalCode || "44600",
      "addressCountry": settings?.country || "Nepal",
    },
    "identifier": {
      "@type": "PropertyValue",
      "name": "DoFE Licence Number",
      "value": BRAND.dofeLicenceNumber,
    },
    ...(phone ? { "telephone": phone } : {}),
    ...(email ? { "email": email } : {}),
    ...(footer?.socialLinks?.filter((link) => link.isActive && /^https:\/\//.test(link.url)).map((link) => link.url).length ? { "sameAs": footer.socialLinks.filter((link) => link.isActive && /^https:\/\//.test(link.url)).map((link) => link.url) } : {}),
  };
};

/**
 * WebSite entity with a stable @id. Emitted once, site-wide. The SearchAction
 * is safe to declare because the repaired /search route accepts a `q` query
 * parameter in exactly this format.
 */
export const buildWebSiteSchema = (settings?: CmsSiteSettings) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": settings?.companyName || siteConfig.name,
    "publisher": { "@id": `${siteUrl}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${siteUrl}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
};

/**
 * WebPage entity keyed to the page's real canonical URL and linked to the
 * site-wide WebSite entity. `canonicalUrl` must be the page's own canonical.
 */
export const buildWebPageSchema = ({
  canonicalUrl,
  name,
  description,
}: {
  canonicalUrl: string;
  name: string;
  description?: string | null;
}) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl || !canonicalUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    "url": canonicalUrl,
    "name": name,
    ...(description ? { description } : {}),
    "isPartOf": { "@id": `${siteUrl}/#website` },
  };
};

/**
 * EmploymentAgency JSON-LD for the single verified Kathmandu office.
 *
 * Emits only fields whose values are rendered on the page itself: name,
 * address, telephone and email. Opening hours, geo coordinates and a Google
 * Business Profile `sameAs` are deliberately omitted until an authoritative
 * source confirms them — an absent property is correct, an invented one is not.
 * Never emit this for a destination country: there is no office abroad.
 */
export const buildEmploymentAgencySchema = ({
  canonicalUrl,
  name,
  streetAddress,
  addressLocality,
  addressRegion,
  postalCode,
  addressCountry,
  telephone,
  email,
}: {
  canonicalUrl: string;
  name: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
  telephone?: string;
  email?: string;
}) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl || !canonicalUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "@id": `${canonicalUrl}#office`,
    "name": name,
    "url": canonicalUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": streetAddress,
      "addressLocality": addressLocality,
      ...(addressRegion ? { addressRegion } : {}),
      ...(postalCode ? { postalCode } : {}),
      "addressCountry": addressCountry,
    },
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
  };
};

/**
 * BreadcrumbList JSON-LD built from the SAME items used to render the visible
 * breadcrumb trail, guaranteeing parity. `items` are ordered root → current;
 * `url` is optional on the final (current) crumb.
 */
export const buildBreadcrumbSchema = (items: { name: string; url?: string }[]) => {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
};

/**
 * NewsArticle JSON-LD for a genuine news record. Emits only stored fields.
 */
export const buildNewsArticleSchema = (article: {
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
  const url = `${siteUrl}/news/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "headline": article.title,
    "url": url,
    ...(article.metaDescription || article.summary
      ? { "description": article.metaDescription || article.summary }
      : {}),
    ...(article.imageUrl ? { "image": [article.imageUrl] } : {}),
    ...(article.publishDate ? { "datePublished": toSafeIsoString(article.publishDate) } : {}),
    "dateModified": toSafeIsoString(article.updatedAt) || toSafeIsoString(article.publishDate),
    "author": { "@type": "Organization", "name": article.authorName || siteConfig.name },
    "publisher": { "@type": "Organization", "name": siteConfig.name, "@id": `${siteUrl}/#organization` },
  };
};

/**
 * FAQPage JSON-LD. Emit ONLY when the same questions/answers are visibly
 * rendered on the page. `faqs` must be the exact visible Q&A array.
 */
export const buildFaqSchema = (faqs: { q: string; a: string }[]) => {
  const clean = (faqs || []).filter((f) => f?.q?.trim() && f?.a?.trim());
  if (!clean.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": clean.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
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
    ...(article.publishDate ? { "datePublished": toSafeIsoString(article.publishDate) } : {}),
    "dateModified": toSafeIsoString(article.updatedAt) || toSafeIsoString(article.publishDate),
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
 * Resolves standard Schema.org employmentType from evidence on the position or demand.
 * Returns undefined if no verifiable evidence is present (never invents or defaults to FULL_TIME).
 */
export const resolveEmploymentType = (position: any, demand?: any): string | undefined => {
  const raw = position?.employmentType || demand?.contractType;
  if (!raw || typeof raw !== "string") return undefined;

  const normalized = raw.trim().toUpperCase().replace(/[-\s]+/g, "_");
  if (normalized === "FULL_TIME" || normalized === "FULLTIME") return "FULL_TIME";
  if (normalized === "PART_TIME" || normalized === "PARTTIME") return "PART_TIME";
  if (normalized === "CONTRACT" || normalized === "CONTRACTOR") return "CONTRACTOR";
  if (normalized === "TEMPORARY" || normalized === "TEMP") return "TEMPORARY";
  if (normalized === "INTERN" || normalized === "INTERNSHIP") return "INTERN";
  if (normalized === "VOLUNTEER") return "VOLUNTEER";
  if (normalized === "PER_DIEM") return "PER_DIEM";
  if (normalized === "OTHER") return "OTHER";

  const lower = raw.toLowerCase();
  if (lower.includes("full time") || lower.includes("full-time")) return "FULL_TIME";
  if (lower.includes("part time") || lower.includes("part-time")) return "PART_TIME";
  if (lower.includes("contract")) return "CONTRACTOR";
  if (lower.includes("temporary") || lower.includes("seasonal")) return "TEMPORARY";

  return undefined;
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

  // Genuine structured salary only: emit baseSalary just when both a numeric
  // amount and a currency are stored on the position. Never fabricate, never
  // infer employment type (Demand has no stored employmentType field).
  const salaryAmount =
    typeof position.salaryAmount === "number" && position.salaryAmount > 0 && position.salaryCurrency
      ? { amount: position.salaryAmount, currency: String(position.salaryCurrency) }
      : null;

  const employmentType = resolveEmploymentType(position, demand);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": position.title,
    "description": demand.metaDescription || demand.generalNotes || generatedSeo.description,
    // Real stored demand lot number, never synthesized.
    ...(demand.demandReferenceNumber
      ? { "identifier": { "@type": "PropertyValue", "name": "Demand Lot Number", "value": String(demand.demandReferenceNumber) } }
      : {}),
    ...(demand.publishedAt ? { "datePosted": new Date(demand.publishedAt).toISOString() } : {}),
    "url": `${siteUrl}/demands/${demand.slug}`,
    // Applications are submitted directly on our own /demands/[slug]/apply form.
    "directApply": true,
    ...(employmentType ? { "employmentType": employmentType } : {}),
    ...(validThrough ? { "validThrough": validThrough } : {}),
    ...(salaryAmount
      ? {
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": salaryAmount.currency,
            "value": { "@type": "QuantitativeValue", "value": salaryAmount.amount },
          },
        }
      : {}),
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

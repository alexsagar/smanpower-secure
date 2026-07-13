import { getSiteUrl, siteConfig } from "./site-config";

/**
 * Builds the Organization JSON-LD schema based strictly on verified data.
 * Does not emit unverified or fake information.
 */
export const buildOrganizationSchema = () => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteUrl,
    // Add only verified data here. 
    // Logo, sameAs, contactPoint should only be added if fetched from approved DB configs.
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
    !demand.country?.name
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

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": position.title,
    "description": demand.generalNotes || demand.seoTitle || position.title, // Ensure safe serialization
    "datePosted": demand.publishedAt ? new Date(demand.publishedAt).toISOString() : new Date().toISOString(),
    ...(validThrough ? { "validThrough": validThrough } : {}),
    "employmentType": "FULL_TIME", // Defaulting to full time as typical for overseas
    "hiringOrganization": {
      "@type": "Organization",
      "name": demand.companyName,
      ...(demand.companyLogo?.fileUrl ? { "logo": demand.companyLogo.fileUrl } : {})
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": demand.country.code || demand.country.name
      }
    }
  };
};

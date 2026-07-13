import { getSiteUrl } from "./site-config";

/**
 * Builds a strictly validated canonical URL.
 * Strips query parameters, trailing slashes, and ensures HTTPS in production.
 * Returns null if the SITE_URL is malformed or missing in production to prevent bad indexing.
 */
export const buildCanonicalUrl = (path: string, overrideUrl?: string | null): string | null => {
  // If a CMS editor provided a manual override, use it if it's safe.
  if (overrideUrl) {
    try {
      const parsed = new URL(overrideUrl);
      if (parsed.protocol === "https:" || process.env.NODE_ENV === "development") {
        return parsed.toString().replace(/\/$/, ""); // Strip trailing slash
      }
    } catch (e) {
      console.warn(`WARNING: Invalid canonical override URL: ${overrideUrl}`);
    }
  }

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return null;
  }

  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Strip query parameters
  const pathWithoutQuery = normalizedPath.split("?")[0];

  // Combine and strip trailing slash (except for root "/")
  const fullUrl = `${siteUrl}${pathWithoutQuery}`;
  if (fullUrl === siteUrl + "/") {
    return siteUrl;
  }
  
  return fullUrl.replace(/\/$/, "");
};

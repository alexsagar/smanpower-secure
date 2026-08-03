import { getSiteUrl } from "./site-config";

/**
 * Builds a strictly validated canonical URL.
 * Strips query parameters, trailing slashes, and ensures HTTPS in production.
 * Returns null if the SITE_URL is malformed or missing in production to prevent bad indexing.
 */
export const buildCanonicalUrl = (path: string, overrideUrl?: string | null): string | null => {
  const siteUrl = getSiteUrl();

  // If a CMS editor provided a manual override, accept it ONLY when it points at
  // the production apex origin or is a safe relative path. Any other host
  // (www, workers.dev, vercel.app, localhost, staging, unrelated origins) is
  // rejected and we fall back to the self-referencing canonical. We never
  // overwrite the stored CMS value here — an invalid override is simply ignored.
  if (overrideUrl && siteUrl) {
    const trimmed = overrideUrl.trim();
    // Relative path override → resolve against the apex origin below.
    if (trimmed.startsWith("/")) {
      path = trimmed;
    } else {
      try {
        const parsed = new URL(trimmed);
        if (process.env.NODE_ENV === "development" || parsed.origin === siteUrl) {
          return parsed.toString().replace(/\/$/, "");
        }
        console.warn(`Rejected off-host canonical override (${parsed.origin}); using self canonical.`);
      } catch {
        console.warn(`WARNING: Invalid canonical override URL: ${overrideUrl}`);
      }
    }
  }

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

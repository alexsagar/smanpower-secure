export const getSiteUrl = (): string => {
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;

  // Local development fallback
  if (process.env.NODE_ENV === "development") {
    return url || "http://localhost:3000";
  }

  // Production validation
  if (!url) {
    if (process.env.APP_ENV === "production") {
      return "https://smanpower.com";
    }
    console.warn("WARNING: SITE_URL is not defined in production environment.");
    // Do not return localhost in production. We return an empty string to avoid malformed canonicals,
    // which canonical.ts will handle safely.
    return "";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      if (process.env.APP_ENV === "production") {
        console.warn(`WARNING: Disallowed non-HTTPS or localhost SITE_URL (${url}) in production. Enforcing https://smanpower.com.`);
        return "https://smanpower.com";
      }
      console.warn(`WARNING: SITE_URL (${url}) must use HTTPS in production.`);
      return "";
    }
    // Remove trailing slash for consistency
    return parsed.origin;
  } catch (e) {
    console.error(`ERROR: SITE_URL (${url}) is malformed.`, e);
    if (process.env.APP_ENV === "production") {
      return "https://smanpower.com";
    }
    return "";
  }
};

export const siteConfig = {
  name: "Seven Seas Intercontinental",
  /**
   * Brand stem used to detect a title that already carries the brand, so the
   * metadata builder doesn't append it twice. Matches "Seven Seas",
   * "Seven Seas Nepal", "Seven Seas Intercontinental", etc.
   */
  brandStem: "Seven Seas",
  description: "Global Manpower Recruitment and HR Solutions",
  defaultLocale: "en",
  themeColor: "#0f172a", // standard theme color
};

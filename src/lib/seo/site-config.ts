export const getSiteUrl = (): string => {
  const url = process.env.SITE_URL;

  // Local development fallback
  if (process.env.NODE_ENV === "development") {
    return url || "http://localhost:3000";
  }

  // Production validation
  if (!url) {
    console.warn("WARNING: SITE_URL is not defined in production environment.");
    // Do not return localhost in production. We return an empty string to avoid malformed canonicals,
    // which canonical.ts will handle safely.
    return "";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      console.warn(`WARNING: SITE_URL (${url}) must use HTTPS in production.`);
      return "";
    }
    // Remove trailing slash for consistency
    return parsed.origin;
  } catch (e) {
    console.error(`ERROR: SITE_URL (${url}) is malformed.`, e);
    return "";
  }
};

export const siteConfig = {
  name: "Seven Seas Intercontinental",
  description: "Global Manpower Recruitment and HR Solutions",
  defaultLocale: "en",
  themeColor: "#0f172a", // standard theme color
};

import type { MetadataRoute } from "next";
import { isStagingNoIndexEnabled } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://smanpower.com";

  if (isStagingNoIndexEnabled()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/", 
          "/api/", 
          "/login/", 
          "/reset-password/", 
          "/accept-invite/",
          "/forgot-password/",
          "/*preview*", 
          "/*/apply/" // Block all application forms from crawling (e.g. /demands/slug/apply)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

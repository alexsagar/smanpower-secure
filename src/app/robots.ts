import type { MetadataRoute } from "next";
import { isStagingNoIndexEnabled } from "@/lib/env";
import { getSiteUrl } from "@/lib/seo/site-config";

// Private paths that must never be crawled by ANY user-agent. robots is
// advisory, not a privacy control — these routes are also protected server-side.
const PRIVATE_DISALLOW = [
  "/admin/",
  "/api/",
  "/login/",
  "/reset-password/",
  "/accept-invite/",
  "/forgot-password/",
  "/*preview*",
  "/*/apply/", // application forms (also noindex)
];

// AI model-training crawlers to block (Option A, business-approved). Blocking is
// advisory and does not guarantee exclusion from training. Kept aligned with the
// Cloudflare bot rules (see Phase 3 report). Search/retrieval crawlers
// (OAI-SearchBot, ChatGPT-User, PerplexityBot) are intentionally NOT listed.
const TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

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
      // Conventional search + AI search/retrieval crawlers: allowed, with
      // private paths disallowed. "*" covers Googlebot, Bingbot, Applebot,
      // OAI-SearchBot, ChatGPT-User, PerplexityBot and social-preview bots.
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      },
      // Model-training crawlers: fully disallowed.
      ...TRAINING_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

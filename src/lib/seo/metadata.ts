import type { Metadata } from "next";
import { siteConfig, getSiteUrl } from "./site-config";
import { buildCanonicalUrl } from "./canonical";
import { isStagingNoIndexEnabled } from "@/lib/env";

interface PageMetaProps {
  title?: string;
  description?: string;
  path: string; // Used for canonical
  canonicalOverride?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
}

/**
 * Append the site name unless the title already carries the brand.
 *
 * Page-level fallbacks and CMS-authored meta titles routinely end in "| Seven
 * Seas Nepal" or similar, and appending unconditionally produced titles like
 * "… | Seven Seas Nepal | Seven Seas Intercontinental" — visible in search
 * results and in the browser tab.
 */
export function buildBrandedTitle(title?: string): string {
  if (!title?.trim()) return siteConfig.name;
  const stem = siteConfig.brandStem || siteConfig.name;
  return title.toLowerCase().includes(stem.toLowerCase())
    ? title
    : `${title} | ${siteConfig.name}`;
}

/**
 * Centralized metadata builder for App Router.
 * Ensures consistent canonicals, titles, and prevents private data leaks.
 */
export const buildPageMetadata = ({
  title,
  description,
  path,
  canonicalOverride,
  ogImage,
  noIndex = false,
}: PageMetaProps): Metadata => {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(path, canonicalOverride);
  const shouldNoIndex = noIndex || isStagingNoIndexEnabled();
  
  const finalTitle = buildBrandedTitle(title);
  const finalDescription = description || siteConfig.description;

  // Use a secure default branded image for OG, avoiding random or unverified stock images
  const defaultOgImage = siteUrl ? `${siteUrl}/images/og-default.png` : undefined;
  const finalOgImage = ogImage || defaultOgImage;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: canonicalUrl ? {
      canonical: canonicalUrl,
    } : {},
    openGraph: {
      title: title || siteConfig.name,
      description: finalDescription,
      url: canonicalUrl || undefined,
      siteName: siteConfig.name,
      images: finalOgImage ? [{ url: finalOgImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || siteConfig.name,
      description: finalDescription,
      images: finalOgImage ? [finalOgImage] : [],
    },
    robots: {
      index: !shouldNoIndex,
      follow: !shouldNoIndex,
      googleBot: {
        index: !shouldNoIndex,
        follow: !shouldNoIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
};

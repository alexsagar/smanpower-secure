import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/repositories/content-resolver";
import { getContentBySlug, type PageContent } from "@/lib/content";
import { mapBlockContentToPageContent } from "@/lib/dynamic-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Route-specific metadata for the `[slug]` marketing pages. Without this the
 * pages inherited the homepage title/description/canonical from the root
 * layout. Uses the resolved CMS/fallback content so each page gets a unique
 * title, factual description and a self-referencing canonical.
 */
export async function buildDynamicPageMetadata(
  category: string,
  slug: string
): Promise<Metadata> {
  const content = await getDynamicPageContent(category, slug);
  if (!content) {
    notFound();
  }
  const description = [content.subtitle, content.missionText?.[0]]
    .filter(Boolean)
    .join(" ")
    .trim()
    .slice(0, 300) || undefined;
  return buildPageMetadata({
    title: content.title,
    description,
    path: `/${category}/${slug}`,
  });
}

/**
 * Resolves the content for the `[slug]` marketing pages rendered by
 * DynamicPageTemplate (employers, ethical-recruitment, industries,
 * training-facilities, trust-centre).
 *
 * The CMS record is authoritative when one exists; `src/lib/content.ts` remains
 * as a fallback so a page whose CMS record is missing or unpublished keeps
 * rendering exactly as it does today instead of 404ing.
 */

const DYNAMIC_PAGE_BLOCK_TYPE = "image_text";

export async function getDynamicPageContent(
  category: string,
  slug: string
): Promise<PageContent | undefined> {
  const fallback = getContentBySlug(category, slug);
  const page = await getPageBySlug(`${category}/${slug}`);

  const block = page?.blocks?.find(
    (candidate) => candidate.visible && candidate.blockType === DYNAMIC_PAGE_BLOCK_TYPE
  );

  if (!block) {
    return fallback;
  }

  const content =
    block.content && typeof block.content === "object"
      ? (block.content as Record<string, unknown>)
      : {};

  return mapBlockContentToPageContent(slug, content, fallback);
}

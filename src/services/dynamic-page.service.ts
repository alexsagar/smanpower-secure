import { getPageBySlug } from "@/repositories/content-resolver";
import { getContentBySlug, type PageContent } from "@/lib/content";
import { mapBlockContentToPageContent } from "@/lib/dynamic-page-content";

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

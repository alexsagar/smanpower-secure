import { getPageBySlug } from "@/repositories/content-resolver";
import { mergePageCopy, PAGE_COPY_DEFAULTS, type PageCopySlug } from "@/lib/page-copy";

/**
 * Resolves editable copy for public pages that render their own JSX.
 *
 * Stored CMS copy is merged over the page's current live defaults, so an absent,
 * unpublished or partially-filled CMS record still renders exactly what the site
 * shows today. Only copy is resolved here — forms, queries and business logic
 * remain in the page components.
 */

export const PAGE_COPY_BLOCK_TYPE = "page_copy";

export async function getPageCopy<S extends PageCopySlug>(
  slug: S
): Promise<(typeof PAGE_COPY_DEFAULTS)[S]> {
  const defaults = PAGE_COPY_DEFAULTS[slug];

  try {
    const page = await getPageBySlug(slug);
    const block = page?.blocks?.find(
      (candidate) => candidate.visible && candidate.blockType === PAGE_COPY_BLOCK_TYPE
    );

    return mergePageCopy(defaults, block?.content);
  } catch {
    // Copy must never take a page down: fall back to the live defaults.
    return defaults;
  }
}

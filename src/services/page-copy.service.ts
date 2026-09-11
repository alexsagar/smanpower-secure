import { cache } from "react";
import { unstable_cache } from "next/cache";
import { resolveMediaUrl } from "@/lib/media-resolver";
import { getPageBySlug } from "@/repositories/content-resolver";
import { mergePageCopy, PAGE_COPY_DEFAULTS, type PageCopySlug } from "@/lib/page-copy";
import { CACHE_TAGS, CACHE_REVALIDATE } from "@/lib/cache-tags";

/**
 * Resolves editable copy for public pages that render their own JSX.
 *
 * Stored CMS copy is merged over the page's current live defaults, so an absent,
 * unpublished or partially-filled CMS record still renders exactly what the site
 * shows today. Only copy is resolved here — forms, queries and business logic
 * remain in the page components.
 */

export const PAGE_COPY_BLOCK_TYPE = "page_copy";

async function fetchPageCopyRaw<S extends PageCopySlug>(
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

const getCachedPageCopy = unstable_cache(
  fetchPageCopyRaw,
  ["cms-page-copy"],
  { revalidate: CACHE_REVALIDATE.layout, tags: [CACHE_TAGS.pageCopy, CACHE_TAGS.pages] }
);

export const getPageCopy = cache(async <S extends PageCopySlug>(slug: S): Promise<(typeof PAGE_COPY_DEFAULTS)[S]> => {
  return getCachedPageCopy(slug);
});

/**
 * Resolves the managed section image on a page's page_copy block, if an editor
 * has uploaded one. Pages fall back to their hardcoded asset when this is null.
 */
async function fetchPageCopyImageRaw(
  slug: PageCopySlug
): Promise<{ secureUrl: string; altText: string } | null> {
  try {
    const page = await getPageBySlug(slug);
    const block = page?.blocks?.find(
      (candidate) => candidate.visible && candidate.blockType === PAGE_COPY_BLOCK_TYPE
    );
    const image = block?.image;
    // `secureUrl` is the legacy Cloudinary URL even on migrated R2 assets, and
    // callers only get this flattened shape — so resolve delivery here, while
    // provider/storageKey are still in hand.
    return image
      ? { secureUrl: resolveMediaUrl(image), altText: image.altText || "" }
      : null;
  } catch {
    return null;
  }
}

const getCachedPageCopyImage = unstable_cache(
  fetchPageCopyImageRaw,
  ["cms-page-copy-image"],
  { revalidate: CACHE_REVALIDATE.layout, tags: [CACHE_TAGS.pageCopy, CACHE_TAGS.pages] }
);

export const getPageCopyImage = cache(async (slug: PageCopySlug): Promise<{ secureUrl: string; altText: string } | null> => {
  return getCachedPageCopyImage(slug);
});

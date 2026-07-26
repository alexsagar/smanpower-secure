// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

export const MEDIA_PLACEHOLDER = "/images/placeholder.png";

/**
 * Anything the app hands us for an image: a bare URL, a mapped CmsMediaAsset
 * (secureUrl, lowercase resourceType), or a raw Prisma media row (fileUrl,
 * uppercase resourceType). Spelling the shapes out keeps call sites type-checked
 * — a bare `any` here silently disables checking everywhere this is used.
 */
export interface MediaLike {
  secureUrl?: string | null;
  fileUrl?: string | null;
  url?: string | null;
  localPath?: string | null;
  resourceType?: string | null;
  altText?: string | null;
}

export type ResolvableMedia = string | MediaLike;

export function resolveMediaUrl(asset?: ResolvableMedia | null): string {
  if (!asset) return MEDIA_PLACEHOLDER;
  if (typeof asset === "string") return asset;

  return asset.secureUrl || asset.fileUrl || asset.url || asset.localPath || MEDIA_PLACEHOLDER;
}

/** Frontend-only delivery URL for typed CMS images; videos and documents stay untouched. */
export function resolveImageMediaUrl(
  asset?: ResolvableMedia | null,
  dimensions?: { width?: number; height?: number }
): string {
  const src = resolveMediaUrl(asset);
  if (src === MEDIA_PLACEHOLDER) return MEDIA_PLACEHOLDER;

  // Mapped assets say "image", raw Prisma rows say "IMAGE"; absent means assume image.
  const resourceType = typeof asset === "string" ? undefined : asset?.resourceType;
  return !resourceType || resourceType.toLowerCase() === "image"
    ? getCloudinaryImageUrl(src, dimensions)
    : src;
}

/**
 * True when a caption/alt string is really just an upload filename ("2.webp"),
 * which should never be shown to a reader as descriptive text.
 */
export function isFilenameLike(str?: string | null): boolean {
  return !str || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(str.trim());
}


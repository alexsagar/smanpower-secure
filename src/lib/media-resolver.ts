// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

export function resolveMediaUrl(asset?: CmsMediaAsset): string {
  if (!asset) return "/images/placeholder.png";

  if (asset.source === "CLOUDINARY" && asset.secureUrl) {
    return asset.secureUrl;
  }

  if (asset.localPath) {
    return asset.localPath;
  }

  return "/images/placeholder.png";
}

/** Frontend-only delivery URL for typed CMS images; videos and documents stay untouched. */
export function resolveImageMediaUrl(asset?: CmsMediaAsset, dimensions?: { width?: number; height?: number }): string {
  const src = resolveMediaUrl(asset);
  return asset?.resourceType === "image" ? getCloudinaryImageUrl(src, dimensions) : src;
}

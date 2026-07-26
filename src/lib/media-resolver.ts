// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

export function resolveMediaUrl(asset?: CmsMediaAsset | any): string {
  if (!asset) return "/images/placeholder.png";
  if (typeof asset === "string") return asset;

  const url = asset.secureUrl || asset.fileUrl || asset.url || asset.localPath;
  if (url) return url;

  return "/images/placeholder.png";
}

/** Frontend-only delivery URL for typed CMS images; videos and documents stay untouched. */
export function resolveImageMediaUrl(asset?: CmsMediaAsset | any, dimensions?: { width?: number; height?: number }): string {
  if (!asset) return "/images/placeholder.png";
  if (typeof asset === "string") return asset;

  const src = resolveMediaUrl(asset);
  if (!src || src === "/images/placeholder.png") return "/images/placeholder.png";

  return (!asset?.resourceType || asset.resourceType === "image" || asset.resourceType === "IMAGE")
    ? getCloudinaryImageUrl(src, dimensions)
    : src;
}


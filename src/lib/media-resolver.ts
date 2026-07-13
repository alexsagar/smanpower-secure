// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";

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

// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";
import { getCloudflareImageUrl, getCloudflareVideoUrl } from "@/lib/cloudflare-delivery";
import {
  MEDIA_PRESETS,
  type MediaPresetConfig,
  type MediaPresetName,
} from "@/lib/media-presets";

export const MEDIA_PLACEHOLDER = "/images/placeholder.png";

export interface MediaLike {
  provider?: "CLOUDINARY" | "R2" | "LOCAL" | null;
  storageKey?: string | null;
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
  
  if (typeof asset === "string") {
    return asset;
  }

  // Handle LOCAL assets
  if (asset.provider === "LOCAL") {
    return asset.secureUrl || asset.fileUrl || asset.url || asset.localPath || MEDIA_PLACEHOLDER;
  }

  // Handle explicitly R2 assets
  if (asset.provider === "R2" && asset.storageKey) {
    if (asset.resourceType?.toUpperCase() === "VIDEO") {
      return getCloudflareVideoUrl(asset.storageKey);
    }
    return getCloudflareImageUrl(asset.storageKey);
  }

  // Fallback to Cloudinary / legacy behavior
  return asset.secureUrl || asset.fileUrl || asset.url || asset.localPath || MEDIA_PLACEHOLDER;
}

export function resolvePresetMediaUrl(
  asset: ResolvableMedia | null | undefined,
  presetName: MediaPresetName,
  options: { fill?: boolean } = {}
): string | undefined {
  if (!asset) return undefined;

  const preset: MediaPresetConfig = MEDIA_PRESETS[presetName];

  // If LOCAL, never construct R2 or Cloudinary transformations
  if (typeof asset !== "string" && asset.provider === "LOCAL") {
    const localSrc = resolveMediaUrl(asset);
    return !localSrc || localSrc === MEDIA_PLACEHOLDER ? undefined : localSrc;
  }

  // If R2
  if (typeof asset !== "string" && asset.provider === "R2" && asset.storageKey) {
    return getCloudflareImageUrl(asset.storageKey, preset, options.fill);
  }

  const src = resolveMediaUrl(asset);
  if (!src || src === MEDIA_PLACEHOLDER) return undefined;

  const metadata = typeof asset === "string" ? undefined : (asset as CmsMediaAsset);
  const usePresetBox = !options.fill && preset.height !== undefined;

  return getCloudinaryImageUrl(src, {
    width: preset.width,
    height: usePresetBox ? preset.height : undefined,
    crop: usePresetBox ? preset.crop : "limit",
    gravity: usePresetBox ? preset.gravity : undefined,
    quality: preset.quality,
    trim: preset.trim,
    focalPointX: metadata?.focalPointX,
    focalPointY: metadata?.focalPointY,
  });
}

export function resolveOpenGraphImageUrl(
  asset?: ResolvableMedia | null
): string | undefined {
  return resolvePresetMediaUrl(asset, "openGraph");
}

/**
 * True when a caption/alt string is really just an upload filename ("2.webp"),
 * which should never be shown to a reader as descriptive text.
 */
export function isFilenameLike(str?: string | null): boolean {
  return !str || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(str.trim());
}


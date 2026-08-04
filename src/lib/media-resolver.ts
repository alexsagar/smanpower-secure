// ============================================================
// Media Resolver
// ============================================================
// Resolves CmsMediaAsset URLs based on their source.
// Handles fallback to placeholders if media is missing.
// ============================================================

import type { CmsMediaAsset } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";
import {
  MEDIA_PRESETS,
  type MediaPresetConfig,
  type MediaPresetName,
} from "@/lib/media-presets";

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

/**
 * Preset-aware delivery URL, for the places that need a plain string rather
 * than an element — `metadata` exports, JSON-LD, and anything handed to a
 * third party. Component call sites should use `<OptimizedImage preset=… />`,
 * which also handles srcSet, sizes, fit and loading.
 */
export function resolvePresetMediaUrl(
  asset: ResolvableMedia | null | undefined,
  presetName: MediaPresetName,
  options: {
    /**
     * Set when the resulting URL is rendered into a `fill` / `object-cover`
     * container. The layout is already cropping, so the preset's crop box must
     * not be baked in as well — doing both cuts the image to one aspect ratio
     * and then again to the container's, which visibly zooms the subject.
     * Mirrors the `fill` prop on OptimizedImage.
     */
    fill?: boolean;
  } = {}
): string | undefined {
  const src = resolveMediaUrl(asset);
  if (!src || src === MEDIA_PLACEHOLDER) return undefined;

  const preset: MediaPresetConfig = MEDIA_PRESETS[presetName];
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

/**
 * Social-card image: a real 1200x630 crop, not the full-size master. Social
 * scrapers do not read `srcset`, so this is the one place a single fixed
 * delivery URL is the right answer. Callers keep their approved default PNG as
 * the fallback when a page has no image of its own.
 */
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


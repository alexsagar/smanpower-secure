// ============================================================
// OptimizedImage
// ============================================================
// The single entry point for rendering CMS or local imagery.
//
// A call site says *where* the image is used (`preset`); this component decides
// width, crop, quality, srcSet, sizes, fit and loading. Editors keep storing the
// original Cloudinary URL, so existing records are optimised with no migration.
//
// Delivery path — exactly one, never both:
//   Cloudinary asset → Cloudinary transformation → <img srcSet>
//   local / other    → next/image → /_next/image
//
// Cloudinary URLs deliberately skip `next/image`: routing an already-resized
// Cloudinary URL through the Worker's optimiser re-encodes a second time, costs
// Worker CPU on every miss, and is the "double optimisation" we want to avoid.
// ============================================================

import Image from "next/image";
import {
  buildCloudinarySrcSet,
  getCloudinaryImageUrl,
  isCloudinaryImageUrl,
} from "@/lib/cloudinary-delivery";
import { MEDIA_PRESETS, type MediaPresetName } from "@/lib/media-presets";
import { MEDIA_PLACEHOLDER, resolveMediaUrl, type ResolvableMedia } from "@/lib/media-resolver";

export interface OptimizedImageProps {
  /** A bare URL, a CmsMediaAsset, or a raw Prisma media row. */
  src?: ResolvableMedia | null;
  preset: MediaPresetName;
  /** Empty string marks the image decorative — required, never inferred. */
  alt: string;
  className?: string;
  /** Override the preset's layout-derived `sizes` when the call site knows better. */
  sizes?: string;
  /** Above-the-fold LCP candidate. Overrides the preset's loading default. */
  priority?: boolean;
  /** Stretch to the positioned parent, like next/image's `fill`. */
  fill?: boolean;
  /** Intrinsic source dimensions, when the caller knows them. */
  width?: number;
  height?: number;
  focalPointX?: number;
  focalPointY?: number;
  title?: string;
}

/** Pull intrinsic dimensions and focal point off a mapped CMS asset. */
function readAssetMetadata(src?: ResolvableMedia | null) {
  if (!src || typeof src === "string") return {};
  const asset = src as {
    width?: number | null;
    height?: number | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
  };
  return {
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
    focalPointX: asset.focalPointX ?? undefined,
    focalPointY: asset.focalPointY ?? undefined,
  };
}

export function OptimizedImage({
  src,
  preset: presetName,
  alt,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
  focalPointX,
  focalPointY,
  title,
}: OptimizedImageProps) {
  const preset = MEDIA_PRESETS[presetName];
  const url = resolveMediaUrl(src);
  const metadata = readAssetMetadata(src);

  const intrinsicWidth = width ?? metadata.width;
  const intrinsicHeight = height ?? metadata.height;
  const focalX = focalPointX ?? metadata.focalPointX;
  const focalY = focalPointY ?? metadata.focalPointY;

  const finalSizes = sizes ?? preset.sizes;
  const loading = priority ? "eager" : preset.loading;
  const objectFit = preset.fit === "contain" ? "object-contain" : "object-cover";

  const transform = {
    width: preset.width,
    height: "height" in preset ? preset.height : undefined,
    crop: preset.crop,
    gravity: "gravity" in preset ? preset.gravity : undefined,
    quality: preset.quality,
    trim: "trim" in preset ? preset.trim : undefined,
    focalPointX: focalX,
    focalPointY: focalY,
  };

  // ── Local and non-Cloudinary sources: keep next/image ──
  if (!isCloudinaryImageUrl(url)) {
    // The placeholder and local /public assets are genuinely static files that
    // benefit from the built-in optimiser; a remote non-Cloudinary URL is not
    // ours to transform.
    const localWidth = intrinsicWidth ?? preset.width;
    const localHeight =
      intrinsicHeight ?? ("height" in preset ? preset.height : undefined) ?? preset.width;

    return (
      <Image
        src={url || MEDIA_PLACEHOLDER}
        alt={alt}
        title={title}
        sizes={finalSizes}
        priority={priority}
        loading={priority ? undefined : loading}
        className={`${objectFit} ${className ?? ""}`.trim()}
        {...(fill
          ? { fill: true as const }
          : { width: localWidth, height: localHeight })}
      />
    );
  }

  const finalSrc = getCloudinaryImageUrl(url, transform);
  const srcSet = buildCloudinarySrcSet(url, preset.widths, transform, intrinsicWidth);

  // Reserve layout space. A cropping preset knows its box exactly; otherwise use
  // the stored source ratio. Never invent a ratio for a document — when nothing
  // is known we omit it and let the natural image size settle the box.
  const boxHeight = "height" in preset ? preset.height : undefined;
  const aspectRatio = boxHeight
    ? `${preset.width} / ${boxHeight}`
    : intrinsicWidth && intrinsicHeight
      ? `${intrinsicWidth} / ${intrinsicHeight}`
      : undefined;

  if (process.env.NODE_ENV === "development" && !url) {
    console.warn(`[media] preset "${presetName}" received no usable source`);
  }

  return (
    // Cloudinary already performs the resize and format negotiation; next/image
    // would re-encode the result a second time on the Worker. See module header.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={finalSizes}
      alt={alt}
      title={title}
      loading={loading}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      width={fill ? undefined : (intrinsicWidth ?? preset.width)}
      height={fill ? undefined : (intrinsicHeight ?? boxHeight)}
      style={fill ? undefined : aspectRatio ? { aspectRatio } : undefined}
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${objectFit} ${className ?? ""}`.trim()}
      data-media-preset={process.env.NODE_ENV === "development" ? presetName : undefined}
    />
  );
}

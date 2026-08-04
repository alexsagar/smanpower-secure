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
import {
  MEDIA_PRESETS,
  type MediaPresetConfig,
  type MediaPresetName,
} from "@/lib/media-presets";
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
  // Widened to the interface: the `as const` table types each preset as its own
  // literal shape, on which optional keys like `height` do not exist.
  const preset: MediaPresetConfig = MEDIA_PRESETS[presetName];
  const url = resolveMediaUrl(src);
  const metadata = readAssetMetadata(src);

  const intrinsicWidth = width ?? metadata.width;
  const intrinsicHeight = height ?? metadata.height;
  const focalX = focalPointX ?? metadata.focalPointX;
  const focalY = focalPointY ?? metadata.focalPointY;

  const finalSizes = sizes ?? preset.sizes;
  const loading = priority ? "eager" : preset.loading;
  const objectFit = preset.fit === "contain" ? "object-contain" : "object-cover";

  // `fill` means the CSS container defines the box and `object-fit` does the
  // cropping. Applying the preset's own box as well would size the image to one
  // aspect ratio and then crop it again to the container's — cropping twice,
  // which visibly zooms the subject. With `fill`, ask Cloudinary only to limit
  // resolution and let the layout do the cropping.
  const usePresetBox = !fill && preset.height !== undefined;

  const transform = {
    width: preset.width,
    height: usePresetBox ? preset.height : undefined,
    crop: usePresetBox ? preset.crop : "limit",
    gravity: usePresetBox ? preset.gravity : undefined,
    quality: preset.quality,
    trim: preset.trim,
    focalPointX: focalX,
    focalPointY: focalY,
  } as const;

  // Reserve layout space using the dimensions of the image we actually deliver,
  // never the source's. A 2000x2000 master delivered at 320px must not report
  // width="2000" — with a width-auto class the browser lays it out at full
  // source size, which is how the logo strips blew up. `c_limit` never upscales,
  // so the delivered width is capped by the source.
  //
  // A `contain` preset (logos, documents) must never be given a synthetic box:
  // its height bound limits bytes, it does not describe the artwork's shape.
  // Forcing that ratio letterboxes every mark into the same slot and makes it
  // render smaller than the layout intends. Only a real source ratio is used
  // here; otherwise CSS (`max-h-*`, `w-auto`) sizes it as it did before.
  const declaresShape = usePresetBox && preset.fit === "cover";
  const deliveredWidth = Math.min(preset.width, intrinsicWidth ?? preset.width);
  const deliveredHeight = declaresShape
    ? Math.round((preset.height as number) * (deliveredWidth / preset.width))
    : intrinsicWidth && intrinsicHeight
      ? Math.round((intrinsicHeight / intrinsicWidth) * deliveredWidth)
      : undefined;

  // ── Local and non-Cloudinary sources: keep next/image ──
  if (!isCloudinaryImageUrl(url)) {
    // The placeholder and local /public assets are genuinely static files that
    // benefit from the built-in optimiser; a remote non-Cloudinary URL is not
    // ours to transform. next/image requires both dimensions, so fall back to a
    // square only when the source shape is genuinely unknown.
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
          : { width: deliveredWidth, height: deliveredHeight ?? deliveredWidth })}
      />
    );
  }

  const finalSrc = getCloudinaryImageUrl(url, transform);
  const srcSet = buildCloudinarySrcSet(url, preset.widths, transform, intrinsicWidth);

  // Never invent a ratio for a document of unknown shape — omit it and let the
  // image's natural size settle the box.
  const aspectRatio = deliveredHeight ? `${deliveredWidth} / ${deliveredHeight}` : undefined;

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
      width={fill ? undefined : deliveredWidth}
      height={fill ? undefined : deliveredHeight}
      style={fill ? undefined : aspectRatio ? { aspectRatio } : undefined}
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${objectFit} ${className ?? ""}`.trim()}
      data-media-preset={process.env.NODE_ENV === "development" ? presetName : undefined}
    />
  );
}

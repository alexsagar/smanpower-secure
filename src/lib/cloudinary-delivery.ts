// ============================================================
// Cloudinary Delivery
// ============================================================
// Frontend-only delivery URL building. The CMS keeps storing the original
// Cloudinary URL/public ID untouched; everything here is applied at render
// time, so existing records become optimised with no migration or re-upload.
//
// Nothing in this module reads a Cloudinary credential — delivery URLs are
// public by construction, so no secret can leak through it.
// ============================================================

export type CloudinaryCrop = "limit" | "fit" | "fill" | "pad" | "scale";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  /** Defaults to `limit`: never crops, never upscales. */
  crop?: CloudinaryCrop;
  /** e.g. `face` or `auto`; only applied for cropping modes. */
  gravity?: string;
  /** Focal point in percent (0-100), as stored on CmsMediaAsset. */
  focalPointX?: number;
  focalPointY?: number;
  /** `auto`, `auto:eco`, `auto:good`, `auto:best`. Defaults to `auto`. */
  quality?: string;
  /** `auto` for images, `auto:video` for video. Defaults per media kind. */
  format?: string;
  /** Trim uniform/transparent padding baked into the source (logo whitespace). */
  trim?: boolean;
  /** Extra raw transformation params appended verbatim, e.g. `fps_24`. */
  extra?: readonly string[];
}

export interface ParsedCloudinaryUrl {
  origin: string;
  cloudName: string;
  resourceType: string;
  deliveryType: string;
  /** Existing transformation segments found between delivery type and version. */
  transforms: string[];
  /** `v123456` when present, else undefined. */
  version?: string;
  /** Folder + public id + extension, e.g. `seven-seas-cms/cms_hero_1.png`. */
  publicIdPath: string;
  /** `?a=b` query string, preserved verbatim. */
  search: string;
  hash: string;
}

/**
 * Delivery types we may safely rewrite. `authenticated`, `private` and `fetch`
 * are excluded: their URLs carry a signature computed over the transformation
 * chain, so inserting params silently invalidates them.
 */
const REWRITABLE_DELIVERY_TYPES = new Set(["upload"]);

/** Cloudinary signed-URL marker, e.g. `s--Ab3dEf9x--`. */
const SIGNATURE_SEGMENT = /^s--[A-Za-z0-9_-]+--$/;

/**
 * A path segment is a transformation when every comma-separated component is a
 * short `key_value` param (`w_800`, `c_fill`, `q_auto:good`) or a bare flag.
 * The final segment is always the public id, never a transformation, which is
 * what keeps unversioned URLs like `/upload/cms_hero_1.png` parsing correctly.
 */
function isTransformSegment(segment: string): boolean {
  if (!segment) return false;
  return segment
    .split(",")
    .every((part) => /^[a-z]{1,3}_[A-Za-z0-9_.:%-]+$/.test(part) || /^fl_[a-z_]+$/.test(part));
}

export function parseCloudinaryUrl(src: string): ParsedCloudinaryUrl | null {
  if (!src || typeof src !== "string") return null;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null; // Relative/local paths and malformed input pass through untouched.
  }

  if (url.hostname !== "res.cloudinary.com") return null;

  // ["", cloud, resourceType, deliveryType, ...rest]
  const parts = url.pathname.split("/");
  if (parts.length < 5) return null;

  const [, cloudName, resourceType, deliveryType, ...rest] = parts;
  if (!cloudName || !resourceType || !deliveryType || rest.length === 0) return null;

  const transforms: string[] = [];
  let version: string | undefined;
  let index = 0;

  while (index < rest.length - 1) {
    const segment = rest[index];
    if (/^v\d+$/.test(segment)) {
      version = segment;
      index += 1;
      break;
    }
    // A signature segment means the URL is signed; keep it in `transforms` so
    // `canRewriteCloudinaryUrl` can see it and refuse to touch the chain.
    if (SIGNATURE_SEGMENT.test(segment) || isTransformSegment(segment)) {
      transforms.push(segment);
      index += 1;
      continue;
    }
    break;
  }

  const publicIdPath = rest.slice(index).join("/");
  if (!publicIdPath) return null;

  return {
    origin: url.origin,
    cloudName,
    resourceType,
    deliveryType,
    transforms,
    version,
    publicIdPath,
    search: url.search,
    hash: url.hash,
  };
}

export function isCloudinaryUrl(src?: string | null): boolean {
  return Boolean(src && parseCloudinaryUrl(src));
}

export function isCloudinaryImageUrl(src?: string | null): boolean {
  return parseCloudinaryUrl(src ?? "")?.resourceType === "image";
}

export function isCloudinaryVideoUrl(src?: string | null): boolean {
  return parseCloudinaryUrl(src ?? "")?.resourceType === "video";
}

/** True when the URL already carries a delivery transformation chain. */
export function isAlreadyTransformedCloudinaryUrl(src?: string | null): boolean {
  return (parseCloudinaryUrl(src ?? "")?.transforms.length ?? 0) > 0;
}

/**
 * Signed and authenticated assets must keep their URL byte-for-byte: the
 * signature covers the transformation chain, so any insertion breaks delivery.
 */
export function canRewriteCloudinaryUrl(
  parsed: ParsedCloudinaryUrl | null
): parsed is ParsedCloudinaryUrl {
  if (!parsed) return false;
  if (!REWRITABLE_DELIVERY_TYPES.has(parsed.deliveryType)) return false;
  return !parsed.transforms.some((segment) => SIGNATURE_SEGMENT.test(segment));
}

function hasParam(existing: string, name: string): boolean {
  return new RegExp(`(^|,)${name}_`).test(existing);
}

function buildTransformSegment(
  existing: string,
  options: CloudinaryTransformOptions,
  defaults: { format: string; quality: string }
): string {
  const {
    width,
    height,
    crop,
    gravity,
    focalPointX,
    focalPointY,
    quality = defaults.quality,
    format = defaults.format,
    trim,
    extra = [],
  } = options;

  // A crop mode is only meaningful with a dimension. `limit` is the safe default:
  // it preserves aspect ratio and never upscales a source smaller than `width`.
  const cropMode = width || height ? crop || "limit" : undefined;
  const cropsToBox = cropMode === "fill" || cropMode === "pad";

  // Cloudinary focal gravity is `g_xy_center` plus x_/y_ offsets; the CMS
  // stores percentages, so express them with the `p` (percent) suffix.
  const usesFocalPoint =
    cropsToBox &&
    typeof focalPointX === "number" &&
    typeof focalPointY === "number" &&
    Number.isFinite(focalPointX) &&
    Number.isFinite(focalPointY);

  const params = [
    trim && !hasParam(existing, "e") && "e_trim",
    cropMode && !hasParam(existing, "c") && `c_${cropMode}`,
    width && !hasParam(existing, "w") && `w_${width}`,
    height && !hasParam(existing, "h") && `h_${height}`,
    usesFocalPoint
      ? !hasParam(existing, "g") &&
        `g_xy_center,x_${Math.round(focalPointX)}p,y_${Math.round(focalPointY)}p`
      : cropsToBox && gravity && !hasParam(existing, "g") && `g_${gravity}`,
    !hasParam(existing, "q") && `q_${quality}`,
    // An empty default format means "keep the asset's own container".
    format && !hasParam(existing, "f") && `f_${format}`,
    ...extra.filter((param) => {
      const name = param.split("_")[0];
      return name ? !hasParam(existing, name) : false;
    }),
  ].filter((value): value is string => Boolean(value));

  return params.join(",");
}

function buildUrl(parsed: ParsedCloudinaryUrl, segment: string): string {
  const path = [
    parsed.cloudName,
    parsed.resourceType,
    parsed.deliveryType,
    segment,
    ...parsed.transforms,
    parsed.version,
    parsed.publicIdPath,
  ]
    .filter((part): part is string => Boolean(part))
    .join("/");

  return `${parsed.origin}/${path}${parsed.search}${parsed.hash}`;
}

/**
 * Add safe delivery transforms to a Cloudinary image without changing the
 * stored CMS URL. Non-Cloudinary, signed and authenticated URLs pass through
 * unchanged; a parse failure returns the input verbatim.
 */
export function getCloudinaryImageUrl(
  src: string,
  options: CloudinaryTransformOptions = {}
): string {
  const parsed = parseCloudinaryUrl(src);
  if (!canRewriteCloudinaryUrl(parsed) || parsed.resourceType !== "image") return src;

  const existing = parsed.transforms.join(",");
  const segment = buildTransformSegment(existing, options, { format: "auto", quality: "auto" });
  if (!segment) return src;

  return buildUrl(parsed, segment);
}

/**
 * Video delivery. Never trims: no `du_`/`eo_` is ever emitted here, so the full
 * duration is always preserved.
 *
 * No format is applied unless the caller asks for one, so the asset keeps its
 * own container. `f_auto:video` resolves to H.264/MP4, which is markedly less
 * efficient than VP9 — forcing it on a VP9/WebM master measurably *inflated*
 * the file. Callers that need a specific container (to offer `<source>`
 * candidates) pass `format` explicitly.
 */
export function getCloudinaryVideoUrl(
  src: string,
  options: CloudinaryTransformOptions = {}
): string {
  const parsed = parseCloudinaryUrl(src);
  if (!canRewriteCloudinaryUrl(parsed) || parsed.resourceType !== "video") return src;

  const existing = parsed.transforms.join(",");
  const segment = buildTransformSegment(existing, options, {
    format: "",
    quality: "auto",
  });
  if (!segment) return src;

  return buildUrl(parsed, segment);
}

/**
 * Derive a poster image from a Cloudinary video. Image-from-video derivatives
 * are reliable even where video format derivatives are restricted, so this
 * needs no separately uploaded poster asset.
 *
 * `so_auto` asks Cloudinary to pick a representative frame, which avoids the
 * black or transition frame that `so_0` often lands on.
 */
export function getCloudinaryPosterUrl(
  src: string,
  options: CloudinaryTransformOptions & { startOffset?: string } = {}
): string | undefined {
  const parsed = parseCloudinaryUrl(src);
  if (!canRewriteCloudinaryUrl(parsed) || parsed.resourceType !== "video") return undefined;

  const { startOffset = "auto", extra = [], ...transformOptions } = options;
  const existing = parsed.transforms.join(",");
  const segment = buildTransformSegment(
    existing,
    { ...transformOptions, extra: [`so_${startOffset}`, ...extra] },
    { format: "auto", quality: "auto:good" }
  );

  // A video frame is delivered from the *video* resource type with an image
  // extension. Rewriting the path to /image/upload/ instead returns 404: the
  // public id does not exist as an image asset.
  return buildUrl(
    { ...parsed, publicIdPath: parsed.publicIdPath.replace(/\.[^/.]+$/, ".jpg") },
    segment
  );
}

/**
 * Responsive `srcSet` for a preset's width list. Widths above the known
 * intrinsic width are dropped so a 1200px source is never requested at 2000px —
 * `c_limit` would return the original anyway, and the extra candidate only
 * tempts the browser into a pointless larger fetch.
 */
export function buildCloudinarySrcSet(
  src: string,
  widths: readonly number[],
  options: CloudinaryTransformOptions = {},
  intrinsicWidth?: number
): string | undefined {
  const parsed = parseCloudinaryUrl(src);
  if (!canRewriteCloudinaryUrl(parsed) || parsed.resourceType !== "image") return undefined;
  if (widths.length === 0) return undefined;

  const usable = widths.filter((width) => !intrinsicWidth || width <= intrinsicWidth);
  // Every candidate is larger than the source: offer just the smallest, which
  // `c_limit` resolves to the original without upscaling.
  const finalWidths = usable.length > 0 ? usable : [Math.min(...widths)];
  const aspect = options.width && options.height ? options.height / options.width : undefined;

  return finalWidths
    .map((width) => {
      const height = aspect ? Math.round(aspect * width) : undefined;
      return `${getCloudinaryImageUrl(src, { ...options, width, height })} ${width}w`;
    })
    .join(", ");
}

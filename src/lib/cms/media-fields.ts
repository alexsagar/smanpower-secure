import type { MediaPurpose } from "@/lib/media-purposes";

/**
 * Generic detection for CMS content fields that hold a media reference.
 *
 * Block content stores media two ways: dedicated MediaAsset columns (handled by
 * MediaInput already) and plain URL strings inside JSON (heroImage,
 * facilities[].imageSrc, documents[].image, ...). This module recognises the
 * second kind by rule rather than by an enumerated field list, so media fields
 * added in future are picked up with no code change.
 *
 * Detected fields keep storing a URL string — the same shape as today — so no
 * migration is needed and every renderer keeps receiving what it expects.
 */

/** Tokens that mark a key as referring to media. */
const MEDIA_TOKENS = new Set([
  "image",
  "img",
  "photo",
  "logo",
  "banner",
  "thumbnail",
  "thumb",
  "poster",
  "video",
  "media",
  "backdrop",
]);

/**
 * Tokens that mark a key as describing media rather than pointing at it.
 * `imageAlt` and `videoCaption` are text, not pickers.
 */
const DESCRIPTIVE_TOKENS = new Set([
  "alt",
  "caption",
  "title",
  "text",
  "label",
  "description",
  "desc",
  "name",
  "credit",
  "type",
  // `imageTag` holds a short label shown beside an image, not a media path.
  "tag",
  "badge",
  "kicker",
]);

/** Values that look like a media file or a hosted media URL. */
const MEDIA_VALUE = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|mov)(\?|#|$)|^\/images\//i;
const CLOUDINARY_VALUE = /res\.cloudinary\.com/i;

/** Splits camelCase / snake_case / kebab-case keys into lowercase tokens. */
export function keyTokens(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .map((token) => token.toLowerCase())
    .filter(Boolean);
}

export function isMediaValue(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (MEDIA_VALUE.test(value.trim()) || CLOUDINARY_VALUE.test(value.trim()))
  );
}

/**
 * True when a content field should be edited with the Media Library picker.
 *
 * A field qualifies on either signal — key shape or value shape — so an empty
 * `heroImage` still gets a picker, and an unconventionally named field holding
 * an obvious image path does too. Descriptive keys are always excluded.
 */
export function isMediaField(key: string, value: unknown): boolean {
  if (value !== null && value !== undefined && typeof value !== "string") return false;

  const tokens = keyTokens(key);
  if (tokens.some((token) => DESCRIPTIVE_TOKENS.has(token))) return false;

  return tokens.some((token) => MEDIA_TOKENS.has(token)) || isMediaValue(value);
}

export type MediaFieldKind = "IMAGE" | "VIDEO";

export function mediaFieldKind(key: string, value?: unknown): MediaFieldKind {
  const tokens = keyTokens(key);
  if (tokens.includes("video")) return "VIDEO";
  if (typeof value === "string" && /\.(mp4|webm|mov)(\?|#|$)/i.test(value)) return "VIDEO";
  return "IMAGE";
}

/** Cloudinary upload purpose matching the field, so uploads land correctly. */
export function mediaFieldPurpose(key: string, value?: unknown): MediaPurpose {
  if (mediaFieldKind(key, value) === "VIDEO") return "cms_video";

  const tokens = keyTokens(key);
  if (tokens.includes("poster")) return "cms_poster_image";
  if (tokens.includes("mobile")) return "cms_mobile_image";

  return "cms_image";
}

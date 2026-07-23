/**
 * Overlay opacity handling shared by every hero / page-header background.
 *
 * The CMS stores overlay opacity as an integer 0–100 (`CmsHeroSection.overlayOpacity`,
 * Prisma `Int @default(60)`). CSS colour alpha wants 0–1, so every consumer must
 * normalise through here rather than dividing inline — that inconsistency is what
 * previously let a stored `60` reach a CSS property expecting `0.6`.
 */

/** Used wherever a hero has an overlay enabled but no explicit stored value. */
export const DEFAULT_OVERLAY_OPACITY = 60;

/**
 * Clamp a CMS overlay opacity (0–100, possibly missing/NaN) and convert it to a
 * CSS alpha (0–1). Missing or malformed values fall back to {@link DEFAULT_OVERLAY_OPACITY}
 * so old CMS records keep rendering safely.
 */
export function normalizeOverlayOpacity(value?: number | null): number {
  const raw = typeof value === "number" && Number.isFinite(value) ? value : DEFAULT_OVERLAY_OPACITY;
  const clamped = Math.min(100, Math.max(0, raw));
  return clamped / 100;
}

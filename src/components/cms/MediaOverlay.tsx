import { normalizeOverlayOpacity } from "@/lib/overlay";

interface MediaOverlayProps {
  /** CMS overlay toggle. When false, nothing is rendered. */
  enabled?: boolean;
  /** CMS overlay opacity, 0–100. Missing/invalid values fall back to the default. */
  opacity?: number | null;
  /**
   * Extra classes for stacking (z-index) relative to the consumer's layers.
   * The overlay is always absolutely positioned, full-bleed, and never
   * intercepts pointer events so links, buttons and video controls stay usable.
   */
  className?: string;
}

/**
 * Single reusable darkening layer that sits above a hero's background image or
 * video and below its content. The darkness is driven entirely by the CMS
 * overlay opacity so editors get a visible 0–100 → 0–1 mapping on every hero.
 */
export function MediaOverlay({ enabled = true, opacity, className }: MediaOverlayProps) {
  if (!enabled) return null;
  const alpha = normalizeOverlayOpacity(opacity);
  if (alpha <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
      style={{ backgroundColor: `rgba(0, 0, 0, ${alpha})` }}
    />
  );
}

// ============================================================
// Brand Style Presets
// ============================================================
// Approved text styles for the CMS editor and renderer.
// Maps CMS text preset identifiers to actual CSS classes.
// ============================================================

import { TextStylePreset } from "@/types/content";

export const TEXT_STYLE_MAP: Record<TextStylePreset, string> = {
  "default-body": "font-sans text-brand-charcoal font-normal",
  "editorial-italic-gold": "font-serif italic font-light text-brand-gold",
  "editorial-italic-light": "font-serif italic font-light text-brand-white/80",
  "gold-emphasis": "font-sans text-brand-gold font-semibold",
  "muted-supporting": "font-sans text-brand-charcoal/50 font-normal",
  "white-emphasis": "font-sans text-brand-white font-semibold",
  "pull-quote": "font-serif italic text-2xl lg:text-3xl text-brand-charcoal",
  "small-eyebrow": "font-sans text-[10px] lg:text-xs font-semibold tracking-[0.3em] uppercase",
  "cta-link-style": "font-sans font-semibold border-b border-brand-gold pb-1 hover:text-brand-gold transition-colors",
};

export function getStyleForPreset(preset: string): string {
  if (preset in TEXT_STYLE_MAP) {
    return TEXT_STYLE_MAP[preset as TextStylePreset];
  }
  return "";
}

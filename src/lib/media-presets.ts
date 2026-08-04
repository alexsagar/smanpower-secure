// ============================================================
// Media Delivery Presets
// ============================================================
// Purpose-aware delivery rules. A page or component picks *where* an asset is
// used; this table decides how it is delivered. Editors never see or choose a
// Cloudinary transformation.
//
// Distinct from `media-purposes.ts`, which governs *upload* (folder,
// permission, allowed formats, size caps). Upload protects storage and
// security; these presets protect frontend performance. Keep them separate.
// ============================================================

import type { CloudinaryCrop } from "./cloudinary-delivery";

/** Shared responsive width pool; each preset picks only the widths it needs. */
export const MEDIA_WIDTHS = [
  120, 160, 240, 320, 480, 640, 720, 768, 1024, 1200, 1400, 1600, 1920, 2000, 2400,
] as const;

export interface MediaPresetConfig {
  /** Delivery width the `src` fallback is built at (the largest sensible one). */
  width: number;
  /** Only set when the layout intentionally crops to a fixed box. */
  height?: number;
  /**
   * `limit` never crops and never upscales — the default for documents, logos
   * and anything where the whole image must remain visible. `fill` is opt-in,
   * for intentional photographic cover layouts only.
   */
  crop: CloudinaryCrop;
  /** Applied only with a cropping mode. */
  gravity?: string;
  quality: "auto" | "auto:eco" | "auto:good" | "auto:best";
  /** Candidate widths for `srcSet`. */
  widths: readonly number[];
  /** Default `sizes`, matching the real layout. Overridable per call site. */
  sizes: string;
  /** Trim baked-in uniform padding (logo whitespace). */
  trim?: boolean;
  /** Below-the-fold by default; presets for LCP candidates opt out. */
  loading: "lazy" | "eager";
  /** CSS fit hint consumed by the component so documents/logos never crop. */
  fit: "contain" | "cover";
}

/**
 * `c_limit` everywhere except the handful of presets with a deliberate
 * editorial crop. Anything showing a document, a logo or a certificate is
 * `limit` + `contain` by construction, so text can never be cut off.
 */
export const MEDIA_PRESETS = {
  // ── Hero ────────────────────────────────────────────────
  heroImage: {
    width: 1920,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [768, 1024, 1280, 1600, 1920, 2400],
    sizes: "100vw",
    loading: "eager",
    fit: "cover",
  },
  heroPoster: {
    width: 1600,
    crop: "limit",
    quality: "auto:good",
    widths: [640, 768, 1024, 1280, 1600, 1920],
    sizes: "100vw",
    loading: "eager",
    fit: "cover",
  },
  sectionBanner: {
    width: 1600,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [768, 1024, 1280, 1600, 1920],
    sizes: "100vw",
    loading: "lazy",
    fit: "cover",
  },

  // ── Editorial content ───────────────────────────────────
  contentImage: {
    width: 1200,
    crop: "limit",
    quality: "auto:good",
    widths: [480, 640, 768, 1024, 1200],
    sizes: "(max-width: 768px) 100vw, 50vw",
    loading: "lazy",
    fit: "cover",
  },
  articleCard: {
    width: 720,
    height: 420,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [320, 480, 640, 720],
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    loading: "lazy",
    fit: "cover",
  },
  articleHero: {
    width: 1600,
    crop: "limit",
    quality: "auto:good",
    widths: [640, 768, 1024, 1200, 1600],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "eager",
    fit: "cover",
  },
  articleInline: {
    width: 1200,
    crop: "limit",
    quality: "auto:good",
    widths: [480, 640, 768, 1024, 1200],
    sizes: "(max-width: 768px) 100vw, 768px",
    loading: "lazy",
    fit: "contain",
  },

  // ── People ──────────────────────────────────────────────
  teamCard: {
    width: 480,
    height: 600,
    crop: "fill",
    // Face gravity only ever applies to people presets — never to documents,
    // logos or certificates.
    gravity: "face",
    quality: "auto:good",
    widths: [240, 320, 480, 640],
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px",
    loading: "lazy",
    fit: "cover",
  },
  teamProfile: {
    width: 1200,
    crop: "limit",
    quality: "auto:good",
    widths: [480, 640, 768, 1024, 1200],
    sizes: "(max-width: 768px) 100vw, 480px",
    loading: "lazy",
    fit: "contain",
  },
  avatar: {
    width: 160,
    height: 160,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    widths: [80, 120, 160, 240],
    sizes: "80px",
    loading: "lazy",
    fit: "cover",
  },

  // ── Success stories & case studies ──────────────────────
  successStoryCard: {
    width: 720,
    height: 480,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [320, 480, 640, 720],
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    loading: "lazy",
    fit: "cover",
  },
  successStoryHero: {
    width: 1600,
    crop: "limit",
    quality: "auto:good",
    widths: [640, 768, 1024, 1200, 1600],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "lazy",
    fit: "cover",
  },
  successStoryGallery: {
    width: 1400,
    crop: "limit",
    quality: "auto:good",
    widths: [480, 640, 768, 1024, 1400],
    sizes: "(max-width: 768px) 100vw, 50vw",
    loading: "lazy",
    fit: "contain",
  },

  // ── Gallery ─────────────────────────────────────────────
  galleryThumbnail: {
    width: 480,
    height: 360,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [240, 320, 480, 640],
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    loading: "lazy",
    fit: "cover",
  },
  galleryDetail: {
    width: 1400,
    crop: "limit",
    quality: "auto:good",
    widths: [640, 768, 1024, 1200, 1400],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "lazy",
    fit: "contain",
  },
  galleryLightbox: {
    width: 2400,
    crop: "limit",
    quality: "auto:best",
    widths: [1024, 1400, 1600, 1920, 2400],
    sizes: "100vw",
    loading: "lazy",
    fit: "contain",
  },

  // ── Logos ───────────────────────────────────────────────
  // Never cropped, never stretched, never face-detected, never upscaled.
  // `q_auto:best` + `contain` keeps small marks sharp and transparency intact;
  // `f_auto` still serves WebP/AVIF, both of which support alpha.
  //
  // `height` here bounds a `c_limit` box — it does NOT crop. It matters because
  // `e_trim` removes the padding baked into a logo file, and without a height
  // bound a tall trimmed mark renders far larger than a wide one beside it. The
  // declared box also gives the element a stable aspect ratio to reserve.
  clientLogo: {
    width: 320,
    height: 160,
    crop: "limit",
    quality: "auto:best",
    widths: [120, 160, 240, 320],
    sizes: "160px",
    trim: true,
    loading: "lazy",
    fit: "contain",
  },
  partnerLogo: {
    width: 320,
    height: 160,
    crop: "limit",
    quality: "auto:best",
    widths: [120, 160, 240, 320],
    sizes: "160px",
    trim: true,
    loading: "lazy",
    fit: "contain",
  },
  certificationLogo: {
    width: 320,
    height: 320,
    crop: "limit",
    quality: "auto:best",
    widths: [120, 160, 240, 320],
    sizes: "96px",
    loading: "lazy",
    fit: "contain",
  },
  navigationLogo: {
    width: 320,
    height: 160,
    crop: "limit",
    quality: "auto:best",
    widths: [120, 160, 240, 320],
    sizes: "160px",
    loading: "eager",
    fit: "contain",
  },
  footerLogo: {
    width: 320,
    height: 160,
    crop: "limit",
    quality: "auto:best",
    widths: [120, 160, 240, 320],
    sizes: "160px",
    loading: "lazy",
    fit: "contain",
  },

  // ── Documents ───────────────────────────────────────────
  // Text-bearing scans. `c_limit` + `contain` only: cropping one of these
  // destroys the information the page exists to show.
  certificateDocument: {
    width: 1400,
    crop: "limit",
    quality: "auto:best",
    widths: [480, 640, 768, 1024, 1200, 1400],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "lazy",
    fit: "contain",
  },
  licenceDocument: {
    width: 1400,
    crop: "limit",
    quality: "auto:best",
    widths: [480, 640, 768, 1024, 1200, 1400],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "lazy",
    fit: "contain",
  },
  generalDocument: {
    width: 1400,
    crop: "limit",
    quality: "auto:best",
    widths: [480, 640, 768, 1024, 1200, 1400],
    sizes: "(max-width: 1024px) 100vw, 1024px",
    loading: "lazy",
    fit: "contain",
  },
  documentThumbnail: {
    width: 640,
    crop: "limit",
    quality: "auto:good",
    widths: [320, 480, 640],
    sizes: "(max-width: 640px) 100vw, 320px",
    loading: "lazy",
    fit: "contain",
  },

  // ── Demand letters ──────────────────────────────────────
  // Wide (≈1200×399) or portrait, always text-heavy and always scanned.
  // Never `c_fill`, never `object-cover`, never a background image.
  demandLetterThumbnail: {
    width: 640,
    crop: "limit",
    quality: "auto:good",
    widths: [320, 480, 640],
    sizes: "(max-width: 640px) 100vw, 320px",
    loading: "lazy",
    fit: "contain",
  },
  demandLetterDetail: {
    width: 1200,
    crop: "limit",
    quality: "auto:best",
    widths: [480, 640, 768, 1024, 1200],
    sizes: "(max-width: 1280px) 100vw, 1280px",
    loading: "lazy",
    fit: "contain",
  },
  demandLetterLightbox: {
    width: 2000,
    crop: "limit",
    quality: "auto:best",
    widths: [768, 1024, 1200, 1600, 2000],
    sizes: "100vw",
    loading: "lazy",
    fit: "contain",
  },

  // ── Social ──────────────────────────────────────────────
  // The one place a fixed crop is correct: social cards are a fixed 1.91:1 box.
  openGraph: {
    width: 1200,
    height: 630,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    widths: [1200],
    sizes: "1200px",
    loading: "lazy",
    fit: "cover",
  },
} as const satisfies Record<string, MediaPresetConfig>;

export type MediaPresetName = keyof typeof MEDIA_PRESETS;

export function getMediaPreset(name: MediaPresetName): MediaPresetConfig {
  return MEDIA_PRESETS[name];
}

// ── Hero video ────────────────────────────────────────────

/**
 * Hero background video delivery.
 *
 * - `c_limit,w_1600` caps resolution without cropping or upscaling.
 * - `fps_24` is plenty for ambient footage. Measured: keeping 30fps costs ~10%
 *   for no visible benefit on a slow background clip, and pushes the file above
 *   the original.
 * - `ac_none` strips the audio track the muted hero can never play.
 * - `q_auto:good` is the measured sweet spot. On the live 2.51MB / 854x480
 *   master: eco 1.80MB, good 2.42MB, best 3.89MB. `best` ships 55% MORE than
 *   the untransformed original, which defeats the purpose; `good` still comes
 *   in under it while dropping eco's compression artefacts. The hero also
 *   preloads nothing and fades in behind an already-painted poster, so the
 *   extra bytes cost bandwidth rather than perceived load.
 * - No `du_`/`eo_`, so the full duration always plays.
 *
 * Deliberately carries NO `f_` parameter. `f_auto:video` resolves to H.264/MP4,
 * which is far less efficient than VP9: on the 2.51MB VP9 master it produced a
 * 2.69MB file — bigger than the original. Omitting the format keeps each asset
 * in its own container; at identical quality settings the VP9 output was
 * consistently the smaller of the two. Format compatibility is handled by
 * HERO_VIDEO_SOURCE_FORMATS instead.
 */
export const HERO_VIDEO_PRESET = {
  width: 1600,
  crop: "limit",
  quality: "auto:good",
  extra: ["fps_24", "ac_none"],
} as const;

/**
 * Container candidates offered as `<source>` elements, best-first. A browser
 * loads only the first one it can play, so the MP4 is transcoded on demand and
 * costs nothing for the VP9-capable majority. Anything that can play neither
 * keeps the poster, which is the designed fallback.
 */
export const HERO_VIDEO_SOURCE_FORMATS = [
  { format: "webm", type: "video/webm" },
  { format: "mp4", type: "video/mp4" },
] as const;

/** Breakpoint at or above which the hero video is allowed to mount at all. */
export const HERO_VIDEO_MIN_WIDTH = 768;

/**
 * Inline section video. Unlike the hero this one has visible controls and is
 * content rather than decoration, so the audio track is kept and the frame rate
 * is left alone; only resolution and encoding are optimised.
 */
export const INLINE_VIDEO_PRESET = {
  width: 1280,
  crop: "limit",
  quality: "auto:good",
  format: "auto:video",
} as const;

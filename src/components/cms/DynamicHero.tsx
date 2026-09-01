// ============================================================
// Dynamic Hero Component
// ============================================================
// CMS-driven hero section supporting images, videos,
// rich text headings, and flexible CTA buttons.
// ============================================================

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsHeroSection, CmsMediaAsset, CmsFooterCertificationLogo } from "@/types/content";
import { resolveMediaUrl, MEDIA_PLACEHOLDER } from "@/lib/media-resolver";
import { RichTextRenderer } from "./RichTextRenderer";
import { ManagedVideo } from "./ManagedVideo";
import { MediaOverlay } from "./MediaOverlay";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { getCloudinaryPosterUrl, getCloudinaryVideoUrl } from "@/lib/cloudinary-delivery";
import {
  HERO_VIDEO_MIN_WIDTH,
  HERO_VIDEO_PRESET,
  HERO_VIDEO_SOURCE_FORMATS,
  MEDIA_PRESETS,
} from "@/lib/media-presets";

interface DynamicHeroProps {
  hero: CmsHeroSection;
  /**
   * Certification logos to surface as compact hero trust badges. Reuses the
   * same CMS-managed list as the footer (Settings → Footer → Certification
   * Logos), so editors manage one source and no hero-specific schema exists.
   */
  certificationLogos?: CmsFooterCertificationLogo[];
  lang?: string;
}

// Mirrors FooterCertificationLogos: only render logos an editor enabled with a
// safe local/HTTPS image source, in their chosen order.
function getVisibleCertificationLogos(logos?: CmsFooterCertificationLogo[]) {
  return (logos ?? [])
    .filter(
      (logo) =>
        logo.enabled &&
        logo.accessibleName.trim() &&
        (logo.imageUrl.startsWith("/") || /^https:\/\//.test(logo.imageUrl)),
    )
    .sort((a, b) => a.order - b.order || a.accessibleName.localeCompare(b.accessibleName));
}

/**
 * The rendered hero video source. Whatever the CMS currently holds is
 * transformed at render time — nothing about the URL, public ID, version,
 * filename or folder is known here, so changing the selected video in the CMS
 * needs no code change.
 *
 * The transform caps resolution, drops the frame rate to 24 and strips the
 * audio track a muted hero can never play. It carries no `du_`/`eo_`, so the
 * full duration always plays, and the original Cloudinary master is untouched.
 * A non-Cloudinary or signed URL passes through and simply plays as stored.
 */
function getPlayableVideo(hero: CmsHeroSection) {
  if (hero.video?.resourceType !== "video") return undefined;

  // Provider-aware: R2 videos resolve to media.smanpower.com, Cloudinary to its
  // secureUrl, LOCAL to its path — all decided inside the shared resolver, not
  // here. getCloudinaryVideoUrl below returns non-Cloudinary URLs untouched.
  const src = resolveMediaUrl(hero.video);
  if (!src || src === MEDIA_PLACEHOLDER) return undefined;

  // Default source keeps the asset's own container. Non-Cloudinary URLs come
  // back untouched and simply play as stored.
  const defaultSrc = getCloudinaryVideoUrl(src, HERO_VIDEO_PRESET);
  if (defaultSrc === src) return { src, sources: undefined };

  const sources = HERO_VIDEO_SOURCE_FORMATS.map(({ format, type }) => ({
    src: getCloudinaryVideoUrl(src, { ...HERO_VIDEO_PRESET, format }),
    type,
  }));

  return { src: defaultSrc, sources };
}

/**
 * Poster fallback order:
 *   1. explicit CMS poster / mobile image
 *   2. a frame generated from the selected video
 *   3. the approved static hero image
 *   4. nothing — the section's own black background shows through
 */
function getFallbackImageUrl(hero: CmsHeroSection) {
  const asset = hero.videoPoster || hero.image;
  if (asset) return resolveMediaUrl(asset);
  return deriveCloudinaryVideoPoster(hero.video);
}

/**
 * Generate the poster from the video itself. Image-from-video transforms stay
 * available even where video format derivatives are restricted, so this always
 * gives the hero something to show while the video loads, when autoplay is
 * blocked, or when the video is never mounted at all.
 */
function deriveCloudinaryVideoPoster(video?: CmsMediaAsset) {
  const src = video?.resourceType === "video" ? video.secureUrl : undefined;
  if (!src) return undefined;

  const preset = MEDIA_PRESETS.heroPoster;
  return getCloudinaryPosterUrl(src, {
    width: preset.width,
    crop: preset.crop,
    quality: preset.quality,
  });
}

function getMobileFallbackImageUrl(hero: CmsHeroSection) {
  return hero.mobileImage ? resolveMediaUrl(hero.mobileImage) : undefined;
}

export function DynamicHero({ hero, certificationLogos, lang = "en" }: DynamicHeroProps) {
  void lang;
  const playableVideo = getPlayableVideo(hero);
  const posterUrl = getFallbackImageUrl(hero);
  const mobileFallbackUrl = getMobileFallbackImageUrl(hero);
  const trustBadges = getVisibleCertificationLogos(certificationLogos);

  return (
    <section className="relative min-h-[100dvh] py-16 lg:py-24 w-full bg-brand-black overflow-hidden flex flex-col justify-center">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full z-0">
        {playableVideo ? (
          <ManagedVideo
            src={playableVideo.src}
            sources={playableVideo.sources}
            posterSrc={posterUrl}
            mobileFallbackSrc={mobileFallbackUrl}
            alt={hero.accessibilityDescription || "Hero background video"}
            autoPlay
            muted
            loop
            preload="none"
            priority
            decorative={!hero.accessibilityDescription}
            showPlaybackToggle
            posterOnlyBelowWidth={HERO_VIDEO_MIN_WIDTH}
            containerClassName="absolute inset-0"
            videoClassName="absolute inset-0 h-full w-full object-cover opacity-60"
            fallbackClassName="scale-110 opacity-60 transition-transform duration-[3s] ease-out"
          />
        ) : hero.image ? (
          <OptimizedImage
            src={hero.image}
            preset="heroImage"
            alt={hero.accessibilityDescription || ""}
            fill
            priority
            className="scale-110 opacity-40 transition-transform duration-[3s] ease-out hover:scale-125"
          />
        ) : null}
        <MediaOverlay enabled={hero.overlayEnabled} opacity={hero.overlayOpacity} />
        {/* Structural bottom fade keeps the floating CTA bar legible regardless
            of the configurable overlay above. */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-brand-black/80" />
      </div>

      {/* Architectural 4-Column Grid Lines */}
      <div className="absolute inset-0 z-10 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12">
        <div className="w-px h-full bg-brand-white/[0.03]" />
        <div className="w-px h-full bg-brand-white/[0.03]" />
        <div className="w-px h-full bg-brand-white/[0.03]" />
        <div className="w-px h-full bg-brand-white/[0.03]" />
      </div>

      {/* Center High-Fashion Typography Lockup */}
      <div className="relative z-20 container-wide px-6 lg:px-12 mx-auto flex flex-col items-center text-center mt-12 pb-24">
        {hero.eyebrow && (
          <ScrollReveal>
            <div className="flex flex-col items-center mb-6">
              <span className="text-brand-gold text-[9px] font-semibold tracking-[0.3em] uppercase mb-4">
                {hero.eyebrow}
              </span>
            </div>
          </ScrollReveal>
        )}

        {/* The page H1 is deliberately outside motion: it must paint in SSR HTML. */}
        <div className="text-brand-white font-bold tracking-tighter text-6xl md:text-8xl lg:text-[7rem] xl:text-[8rem] leading-[0.9] [&_h1]:m-0 [&_h2]:m-0 [&_h1]:font-inherit [&_h2]:font-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h1]:tracking-inherit [&_h2]:tracking-inherit">
          <RichTextRenderer content={hero.richHeading} />
        </div>

        {hero.richDescription && (
          <ScrollReveal delay={0.2} className="mt-8 md:mt-12 flex flex-col items-center">
            <div className="text-white opacity-80 max-w-md text-center uppercase tracking-[0.2em] text-xs leading-loose">
              <RichTextRenderer content={hero.richDescription} />
            </div>
          </ScrollReveal>
        )}

        {/* Certification trust badges — reuse the CMS-managed footer logos.
            Placed below the supporting paragraph and above the floating CTA
            bar, centred to match the hero's existing lockup. */}
        {trustBadges.length > 0 && (
          <ScrollReveal delay={0.3} className="mt-10 md:mt-14 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {trustBadges.map((logo) => (
                <span
                  key={`${logo.accessibleName}-${logo.order}`}
                  className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center overflow-hidden"
                  style={{ borderRadius: "9999px" }}
                >
                  <OptimizedImage
                    src={logo.imageUrl}
                    preset="certificationLogo"
                    alt={logo.accessibleName}
                    sizes="(min-width: 768px) 96px, 80px"
                    className="h-full w-full opacity-90"
                  />
                </span>
              ))}
            </div>
            <p className="text-white/55 text-[10px] md:text-[11px] tracking-[0.14em] max-w-sm text-center">
              Sedex Compliant • RBA Member • ISO 9001:2015 Certified
            </p>
          </ScrollReveal>
        )}
      </div>

      {/* Floating Glassmorphic CTA Bar */}
      {(hero.primaryCta || hero.secondaryCta) && (
        <div className="absolute bottom-0 left-0 w-full z-30 pb-8 px-6 lg:px-12">
          <div className="container-wide mx-auto">
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col md:flex-row items-center justify-between p-2 pl-6 bg-brand-white/5 backdrop-blur-md border border-brand-white/10 rounded-full max-w-3xl mx-auto">
                {hero.secondaryCta && (
                  <span className="text-brand-white/80 text-xs tracking-widest uppercase font-medium hidden md:block">
                    {hero.secondaryCta.text}
                  </span>
                )}
                
                <div className="flex gap-2 w-full md:w-auto">
                  {hero.primaryCta && (
                    <Link href={hero.primaryCta.href.startsWith("/") ? hero.primaryCta.href : `/${hero.primaryCta.href}`} className="w-full md:w-auto">
                      <Button variant="gold" className="w-full rounded-full h-12 px-8 text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                        {hero.primaryCta.text}
                      </Button>
                    </Link>
                  )}
                  {hero.secondaryCta && (
                    <Link href={hero.secondaryCta.href.startsWith("/") ? hero.secondaryCta.href : `/${hero.secondaryCta.href}`} aria-label={hero.secondaryCta.text} className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-white/20 hover:bg-brand-white hover:text-brand-black transition-colors group">
                      <ArrowRight className="w-4 h-4 text-brand-white group-hover:text-brand-black group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}
    </section>
  );
}

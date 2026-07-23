// ============================================================
// Dynamic Hero Component
// ============================================================
// CMS-driven hero section supporting images, videos,
// rich text headings, and flexible CTA buttons.
// ============================================================

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsHeroSection, CmsMediaAsset, CmsFooterCertificationLogo } from "@/types/content";
import { resolveMediaUrl } from "@/lib/media-resolver";
import { RichTextRenderer } from "./RichTextRenderer";
import { ManagedVideo } from "./ManagedVideo";

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

function getPlayableVideo(hero: CmsHeroSection) {
  if (hero.video?.resourceType !== "video") return undefined;

  // The verified Cloudinary secureUrl is authoritative and is played directly.
  // Cloudinary on-the-fly video format derivatives (f_mp4/f_webm) can be
  // disabled, rejected, or slow to generate, which leaves the hero permanently
  // black — so we never route delivery through a generated derivative.
  // ponytail: use the verified upload URL; add derivatives back only if a real
  // encoding/optimization need is proven against the live Cloudinary account.
  const src = hero.video.secureUrl || hero.video.localPath;
  return src ? { src } : undefined;
}

// Cloudinary first-frame poster (so_0 image derivative). Image-from-video
// transforms are reliable even where video format derivatives are restricted,
// so this guarantees the hero shows the video's own first frame instead of a
// black area while the video loads, is blocked by autoplay policy, or is
// hidden for reduced-motion users.
function deriveCloudinaryVideoPoster(video?: CmsMediaAsset) {
  if (video?.source !== "CLOUDINARY" || video.resourceType !== "video" || !video.secureUrl) {
    return undefined;
  }

  try {
    const url = new URL(video.secureUrl);
    if (!url.pathname.includes("/video/upload/")) return undefined;
    const path = url.pathname
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(/\.[^/.]+$/, ".jpg");
    return `${url.origin}${path}`;
  } catch {
    return undefined;
  }
}

function getFallbackImageUrl(hero: CmsHeroSection) {
  const asset = hero.videoPoster || hero.image;
  if (asset) return resolveMediaUrl(asset);
  return deriveCloudinaryVideoPoster(hero.video);
}

function getMobileFallbackImageUrl(hero: CmsHeroSection) {
  return hero.mobileImage ? resolveMediaUrl(hero.mobileImage) : undefined;
}

export function DynamicHero({ hero, certificationLogos, lang = "en" }: DynamicHeroProps) {
  void lang;
  const imageUrl = resolveMediaUrl(hero.image);
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
            posterSrc={posterUrl}
            mobileFallbackSrc={mobileFallbackUrl}
            alt={hero.accessibilityDescription || "Hero background video"}
            autoPlay
            muted
            loop
            preload="metadata"
            priority
            decorative={!hero.accessibilityDescription}
            showPlaybackToggle
            containerClassName="absolute inset-0"
            videoClassName="absolute inset-0 h-full w-full object-cover opacity-60"
            fallbackClassName="scale-110 opacity-60 transition-transform duration-[10s] ease-out"
          />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={hero.accessibilityDescription || "Hero background"}
            fill
            className="object-cover scale-110 opacity-40 transition-transform duration-[10s] ease-out hover:scale-125"
            priority
          />
        ) : null}
        {hero.overlayEnabled && (
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent, rgba(0,0,0,${(hero.overlayOpacity || 60) / 100}), #000000)`
            }}
          />
        )}
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
        <ScrollReveal>
          {hero.eyebrow && (
            <div className="flex flex-col items-center mb-6">
              <span className="text-brand-gold text-[9px] font-semibold tracking-[0.3em] uppercase mb-4">
                {hero.eyebrow}
              </span>
            </div>
          )}

          {/* Render Rich Text Heading using Tiptap content */}
          <div className="text-brand-white font-bold tracking-tighter text-6xl md:text-8xl lg:text-[7rem] xl:text-[8rem] leading-[0.9] [&_h1]:m-0 [&_h2]:m-0 [&_h1]:font-inherit [&_h2]:font-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h1]:tracking-inherit [&_h2]:tracking-inherit">
             <RichTextRenderer content={hero.richHeading} />
          </div>
        </ScrollReveal>

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
                  <Image
                    src={logo.imageUrl}
                    alt={logo.accessibleName}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-contain opacity-90"
                  />
                </span>
              ))}
            </div>
            <p className="text-white/55 text-[10px] md:text-[11px] tracking-[0.14em] max-w-sm text-center">
              RBA Member • Sedex Compliant • ISO 9001:2015 Certified
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
                    <Link href={hero.secondaryCta.href.startsWith("/") ? hero.secondaryCta.href : `/${hero.secondaryCta.href}`} className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-white/20 hover:bg-brand-white hover:text-brand-black transition-colors group">
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

"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedVideo } from "@/components/cms/ManagedVideo";
import { MediaOverlay } from "@/components/cms/MediaOverlay";

interface HeroInternalProps {
  title: React.ReactNode;
  richTitle?: React.ReactNode;
  subtitle: string;
  imageSrc: string;
  videoSrc?: string;
  posterSrc?: string;
  mobileFallbackSrc?: string;
  overlayEnabled?: boolean;
  overlayOpacity?: number | null;
}

export function HeroInternal({
  title,
  richTitle,
  subtitle,
  imageSrc,
  videoSrc,
  posterSrc,
  mobileFallbackSrc,
  overlayEnabled = true,
  overlayOpacity,
}: HeroInternalProps) {
  return (
    <section className="relative h-[70dvh] min-h-[600px] w-full bg-brand-black overflow-hidden flex flex-col justify-center mt-[var(--site-header-height)] group">
      {/* Background Image with Slow Pan Effect */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {videoSrc ? (
          <ManagedVideo
            src={videoSrc}
            posterSrc={posterSrc || imageSrc}
            mobileFallbackSrc={mobileFallbackSrc || posterSrc || imageSrc}
            alt="Header background video"
            autoPlay
            muted
            loop
            preload="metadata"
            priority
            decorative
            showPlaybackToggle
            containerClassName="absolute inset-0"
            videoClassName="absolute inset-0 h-full w-full object-cover scale-110 opacity-70 grayscale-[20%]"
            fallbackClassName="scale-110 transition-transform duration-[20000ms] group-hover:scale-125 opacity-70 grayscale-[20%]"
          />
        ) : (
          <Image
            src={imageSrc}
            alt="Header Background"
            fill
            className="object-cover scale-110 transition-transform duration-[20000ms] group-hover:scale-125 opacity-70 grayscale-[20%]"
            priority
          />
        )}
        {/* Configurable CMS overlay drives the darkening (0–100 → 0–1). */}
        <MediaOverlay enabled={overlayEnabled} opacity={overlayOpacity} />
        {/* Decorative edge vignette (kept light so the photo stays visible; the
            configurable MediaOverlay above supplies the primary darkening) and a
            short structural fade into the page background — confined to the final
            ~20% so the lower hero no longer washes out to a white fog. */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_80%,var(--color-brand-off-white)_100%)]" />
        {/* Cinematic Film Grain */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-15 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 z-10 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12">
        <div className="w-px h-full bg-brand-white/[0.04]" />
        <div className="w-px h-full bg-brand-white/[0.04]" />
        <div className="w-px h-full bg-brand-white/[0.04]" />
        <div className="w-px h-full bg-brand-white/[0.04]" />
      </div>

      <div className="relative z-20 container-wide px-6 lg:px-12 mx-auto mt-24 text-center flex flex-col items-center">
        <ScrollReveal>
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-brand-gold/50" />
              <span className="font-brand text-brand-gold text-[10px] font-semibold tracking-[0.4em] uppercase">
                Seven Seas Intercontinental
              </span>
              <div className="w-8 h-px bg-brand-gold/50" />
            </div>
          </div>
          {richTitle ? (
            <div className="font-heading text-brand-white font-light tracking-tighter leading-[0.9] max-w-5xl mx-auto drop-shadow-2xl [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0 [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit">
              {richTitle}
            </div>
          ) : (
            <h1 className="font-heading text-brand-white font-light tracking-tighter text-5xl md:text-6xl lg:text-[6rem] leading-[0.9] max-w-5xl mx-auto drop-shadow-2xl">
              {title}
            </h1>
          )}
        </ScrollReveal>
        
        <ScrollReveal delay={0.2} className="mt-12 flex flex-col items-center">
          {/* Glowing Line */}
          <div className="relative mb-8">
            <div className="h-16 w-px bg-gradient-to-b from-brand-gold to-transparent relative z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-4 bg-brand-gold blur-xl opacity-30" />
          </div>
          <p className="text-brand-white/80 max-w-lg text-center uppercase tracking-[0.2em] text-xs font-semibold">
            {subtitle}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

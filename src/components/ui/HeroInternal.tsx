"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedVideo } from "@/components/cms/ManagedVideo";

interface HeroInternalProps {
  title: React.ReactNode;
  subtitle: string;
  imageSrc: string;
  videoSrc?: string;
  posterSrc?: string;
  mobileFallbackSrc?: string;
}

export function HeroInternal({
  title,
  subtitle,
  imageSrc,
  videoSrc,
  posterSrc,
  mobileFallbackSrc,
}: HeroInternalProps) {
  return (
    <section className="relative h-[70dvh] min-h-[600px] w-full bg-brand-black overflow-hidden flex flex-col justify-center mt-20 group">
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
            videoClassName="absolute inset-0 h-full w-full object-cover scale-110 opacity-40 grayscale-[20%]"
            fallbackClassName="scale-110 transition-transform duration-[20000ms] group-hover:scale-125 opacity-40 grayscale-[20%]"
          />
        ) : (
          <Image
            src={imageSrc}
            alt="Header Background"
            fill
            className="object-cover scale-110 transition-transform duration-[20000ms] group-hover:scale-125 opacity-40 grayscale-[20%]"
            priority
          />
        )}
        {/* Dark Vignette and Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-black/40 to-brand-off-white" />
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
          <h1 className="font-heading text-brand-white font-light tracking-tighter text-5xl md:text-6xl lg:text-[6rem] leading-[0.9] max-w-5xl mx-auto drop-shadow-2xl">
            {title}
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2} className="mt-12 flex flex-col items-center">
          {/* Glowing Line */}
          <div className="relative mb-8">
            <div className="h-16 w-px bg-gradient-to-b from-brand-gold to-transparent relative z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-4 bg-brand-gold blur-xl opacity-30" />
          </div>
          <p className="text-brand-charcoal opacity-90 max-w-lg text-center uppercase tracking-[0.2em] text-xs font-semibold">
            {subtitle}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

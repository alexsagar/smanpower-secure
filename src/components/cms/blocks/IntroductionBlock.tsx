import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { resolveMediaUrl } from "@/lib/media-resolver";
import { RichTextRenderer } from "../RichTextRenderer";
import { ManagedVideo } from "../ManagedVideo";

export function IntroductionBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  const content = block.content as any;
  const mediaUrl = resolveMediaUrl(block.image);
  const videoUrl = resolveMediaUrl(block.video);
  const posterUrl = resolveMediaUrl(block.videoPoster || block.image);
  const mobileFallbackUrl = resolveMediaUrl(block.mobileImage || block.videoPoster || block.image);

  return (
    <section className="py-16 lg:py-24 relative bg-brand-off-white overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12">
        <div className="w-px h-full bg-brand-charcoal/[0.04]" />
        <div className="w-px h-full bg-brand-charcoal/[0.04]" />
        <div className="w-px h-full bg-brand-charcoal/[0.04]" />
        <div className="w-px h-full bg-brand-charcoal/[0.04]" />
      </div>

      <div className="container-wide relative z-10 px-6 lg:px-12 mx-auto">
        <ScrollReveal>
          {content.eyebrow && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-brand-gold" />
              <span className="text-brand-charcoal/50 text-[10px] font-semibold tracking-[0.3em] uppercase">
                {content.eyebrow}
              </span>
            </div>
          )}

          <div className="text-brand-charcoal font-bold tracking-tighter text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] max-w-5xl mb-24 [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
            <RichTextRenderer content={block.richHeading} />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-end">
          <div className="lg:col-span-7 relative">
            <ScrollReveal delay={0.2} className="relative aspect-[4/3] lg:aspect-[16/10] w-full max-w-3xl overflow-hidden group">
              {videoUrl ? (
                <ManagedVideo
                  src={videoUrl}
                  posterSrc={posterUrl}
                  mobileFallbackSrc={mobileFallbackUrl}
                  alt={block.video?.altText || block.image?.altText || "Introduction video"}
                  controls
                  muted
                  preload="metadata"
                  containerClassName="absolute inset-0"
                  videoClassName="absolute inset-0 h-full w-full object-cover"
                  fallbackClassName="grayscale opacity-90"
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={block.image?.altText || "Introduction image"}
                  fill
                  className="object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-out"
                />
              )}
              <div className="absolute inset-0 bg-brand-charcoal/10 group-hover:bg-transparent transition-colors duration-1000" />
              
              {content.imageTag && (
                <div className="absolute bottom-0 right-0 lg:bottom-6 lg:right-6">
                  <div className="bg-brand-white/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-brand-charcoal">
                      {content.imageTag}
                    </span>
                  </div>
                </div>
              )}
            </ScrollReveal>
            <div className="hidden lg:block absolute -top-8 -left-8 w-1/2 h-full border-t border-l border-brand-gold/30 -z-10" />
          </div>

          <div className="lg:col-span-5 lg:pl-16 flex flex-col justify-end">
            <ScrollReveal delay={0.4}>
              <div className="relative">
                <div className="absolute -left-6 top-2 h-full w-px bg-brand-charcoal/10 hidden lg:block" />
                <div className="absolute -left-6 top-2 h-1/3 w-px bg-brand-gold hidden lg:block" />

                <div className="space-y-8 text-brand-charcoal/75 text-base lg:text-lg leading-relaxed font-medium">
                  {content.paragraphs?.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {content.ctaText && content.ctaHref && (
                <div className="mt-16">
                  <Link href={`${prefix}${content.ctaHref.startsWith('/') ? '' : '/'}${content.ctaHref}`}>
                    <div className="group flex items-center gap-6 cursor-pointer">
                      <span className="text-brand-charcoal text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-brand-gold transition-colors">
                        {content.ctaText}
                      </span>
                      <div className="h-px w-12 bg-brand-charcoal/20 group-hover:w-24 group-hover:bg-brand-gold transition-all duration-500 relative flex items-center justify-end">
                        <ArrowRight className="absolute w-4 h-4 text-brand-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100" />
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

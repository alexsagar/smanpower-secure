import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";
import { OptimizedImage } from "@/components/media/OptimizedImage";

export function TrainingBentoBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;
  const mainFacility = content.facilities?.[0];
  const trFacility = content.facilities?.[1];
  const brFacility = content.facilities?.[2];
  
  return (
    <>
      {/* SECTION 8: TRAINING AND FACILITIES (ARCHITECTURAL BENTO GRID) */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative">
        <div className="container-wide px-6 lg:px-12 mx-auto">

          <div className="mb-20 lg:mb-32">
            {content.eyebrow && (
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-16 bg-brand-gold" />
                  <span className="text-brand-black/50 text-[10px] font-semibold tracking-[0.3em] uppercase">
                    {content.eyebrow}
                  </span>
                </div>
              </ScrollReveal>
            )}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
              <ScrollReveal className="max-w-4xl">
                <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter text-brand-black leading-[0.9] uppercase [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
                  <RichTextRenderer content={block.richHeading} />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="max-w-sm pb-2">
                {content.description && (
                  <p className="text-brand-black/70 text-base md:text-lg leading-relaxed mb-8">
                    {content.description}
                  </p>
                )}
                {content.ctaText && content.ctaHref && (
                  <Link href={`${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`}>
                    <div className="group flex items-center gap-4 cursor-pointer">
                      <div className="w-12 h-12 rounded-full border border-brand-charcoal/20 group-hover:border-brand-gold flex items-center justify-center transition-all duration-500">
                        <ArrowRight className="w-4 h-4 text-brand-black group-hover:text-brand-gold -rotate-45 group-hover:rotate-0 transition-all duration-500" />
                      </div>
                      <span className="text-brand-black text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-brand-gold transition-colors">
                        {content.ctaText}
                      </span>
                    </div>
                  </Link>
                )}
              </ScrollReveal>
            </div>
          </div>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 lg:h-[800px]">

            {/* Massive Main Image (Spans 8 cols) */}
            {mainFacility && (
              <ScrollReveal delay={0.1} className="lg:col-span-8 h-[400px] lg:h-full relative group overflow-hidden bg-brand-off-white">
                <OptimizedImage
                  src={mainFacility.imageSrc || '/placeholder.png'}
                  preset="sectionBanner"
                  alt={mainFacility.imageAlt || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 67vw"
                  className="group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute bottom-8 left-8 right-8 lg:bottom-12 lg:left-12 lg:right-12 flex justify-between items-start">
                  <div>
                    <div className="text-brand-gold text-[10px] tracking-[0.3em] uppercase font-bold mb-3">{mainFacility.label}</div>
                    <h3 className="text-3xl lg:text-5xl font-semibold text-white">{mainFacility.title}</h3>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-brand-charcoal/10 backdrop-blur-sm border border-brand-charcoal/20 flex items-center justify-center group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-500 shrink-0">
                    <ArrowRight className="w-5 h-5 text-brand-black group-hover:text-brand-charcoal transition-colors" />
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Right Stack (Spans 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-8 h-[600px] lg:h-full">

              {/* Top Right Image */}
              {trFacility && (
                <ScrollReveal delay={0.2} className="h-1/2 relative group overflow-hidden bg-brand-off-white">
                  <OptimizedImage
                    src={trFacility.imageSrc || '/placeholder.png'}
                    preset="contentImage"
                    alt={trFacility.imageAlt || ''}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute bottom-8 left-8">
                    <div className="text-brand-gold text-[10px] tracking-[0.3em] uppercase font-bold mb-2">{trFacility.label}</div>
                    <h3 className="card-title text-white">{trFacility.title}</h3>
                  </div>
                </ScrollReveal>
              )}

              {/* Bottom Right Image */}
              {brFacility && (
                <ScrollReveal delay={0.3} className="h-1/2 relative group overflow-hidden bg-brand-off-white">
                  <OptimizedImage
                    src={brFacility.imageSrc || '/placeholder.png'}
                    preset="contentImage"
                    alt={brFacility.imageAlt || ''}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute bottom-8 left-8">
                    <div className="text-brand-gold text-[10px] tracking-[0.3em] uppercase font-bold mb-2">{brFacility.label}</div>
                    <h3 className="card-title text-white">{brFacility.title}</h3>
                  </div>
                </ScrollReveal>
              )}

            </div>

          </div>

        </div>
      </section>

      
    </>
  );
}

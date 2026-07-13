import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

export function PillarGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 6: ETHICAL RECRUITMENT / RBA (STAGGERED PILLAR PIPELINE) */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative overflow-hidden">

        {/* Engineering Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        <div className="container-wide px-6 lg:px-12 mx-auto relative z-10">

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
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
              <ScrollReveal className="max-w-4xl">
                <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter text-brand-black leading-[0.9] [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
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
                  <Link href={`${prefix}${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`}>
                    <div className="group flex items-center gap-4 cursor-pointer">
                      <span className="text-brand-black text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-brand-gold transition-colors">
                        {content.ctaText}
                      </span>
                      <div className="h-px w-12 bg-brand-charcoal/20 group-hover:w-24 group-hover:bg-brand-gold transition-all duration-500 relative flex items-center justify-end">
                        <ArrowRight className="absolute w-4 h-4 text-brand-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100" />
                      </div>
                    </div>
                  </Link>
                )}
              </ScrollReveal>
            </div>
          </div>

          {/* Staggered Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {content.pillars?.map((step: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.1} className={`w-full ${step.offset || ''}`}>
                <div className="h-[300px] lg:h-[450px] bg-brand-off-white/40 border border-brand-charcoal/10 hover:border-brand-gold/50 hover:bg-brand-off-white p-8 flex flex-col justify-between group transition-all duration-500 cursor-default relative overflow-hidden">

                  {/* Internal Ambient Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="text-brand-black/20 group-hover:text-brand-gold text-6xl lg:text-7xl font-serif italic font-light transition-colors duration-500 relative z-10">
                    0{i + 1}
                  </div>

                  <div className="relative z-10">
                    <div className="h-px w-8 bg-brand-charcoal/20 group-hover:bg-brand-gold group-hover:w-16 transition-all duration-500 mb-6" />
                    <h3 className="text-xl lg:text-2xl font-semibold text-brand-black group-hover:text-brand-gold transition-colors duration-500 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      
    </>
  );
}

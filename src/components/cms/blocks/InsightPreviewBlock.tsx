import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";

export function InsightPreviewBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 13: INSIGHTS AND NEWSROOM */}
      <section className="py-16 lg:py-24 bg-brand-off-white text-brand-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/15 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container-wide px-6 lg:px-12 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
            <ScrollReveal>
              {content.eyebrow && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-2 h-2 bg-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-semibold tracking-[0.4em] uppercase">
                    {content.eyebrow}
                  </span>
                </div>
              )}
              {content.heading && (
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase text-brand-black whitespace-pre-line">
                  {content.heading}
                </h2>
              )}
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              {content.ctaText && content.ctaHref && (
                <Link href={`${prefix}${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`} className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors">
                  <span>{content.ctaText}</span>
                  <div className="w-12 h-12 rounded-full border border-brand-charcoal/20 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              )}
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {content.articles?.map((news: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.1} className="group cursor-pointer block relative">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4 group-hover:text-brand-gold/70 transition-colors">
                  <span>{news.category}</span>
                  <span className="w-1 h-1 rounded-full bg-brand-charcoal/20 group-hover:bg-brand-gold/50 transition-colors" />
                  <span>{news.date}</span>
                </div>
                <h3 className="text-2xl font-light text-brand-black mb-8 group-hover:text-brand-gold transition-colors leading-snug">{news.title}</h3>

                <div className="w-full h-px bg-brand-charcoal/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-full bg-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                </div>

                {/* View article text that slides in */}
                <div className="mt-6 flex items-center gap-3 text-brand-gold text-[10px] font-bold uppercase tracking-widest opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

export function CommunityBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 11: COMMUNITY AND CANDIDATE WELFARE */}
      <section className="py-16 lg:py-24 bg-brand-white relative overflow-hidden">
        <div className="container-wide relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: Typography & Editorial Content */}
            <div className="relative">
              <ScrollReveal>
                {content.eyebrow && (
                  <div className="flex items-center gap-3 mb-8">
                    <HeartHandshake className="w-5 h-5 text-brand-gold" />
                    <span className="text-brand-charcoal text-xs font-bold tracking-[0.2em] uppercase">{content.eyebrow}</span>
                  </div>
                )}
                {content.heading && (
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-brand-black mb-8 leading-[1.1] tracking-tight">
                    {content.heading.replace(content.headingHighlight || '', '')} 
                    {content.headingHighlight && (
                      <span className="font-serif italic text-brand-gold font-light">{content.headingHighlight}</span>
                    )}
                  </h2>
                )}
                {content.description && (
                  <p className="text-brand-charcoal/70 text-lg leading-relaxed mb-12 max-w-xl">
                    {content.description}
                  </p>
                )}
                {content.ctaText && content.ctaHref && (
                  <Link href={`${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`} className="inline-flex items-center gap-4 group">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-charcoal group-hover:text-brand-gold transition-colors">{content.ctaText}</span>
                    <div className="w-12 h-12 rounded-full border border-brand-charcoal/10 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-brand-charcoal group-hover:text-brand-gold" />
                    </div>
                  </Link>
                )}
              </ScrollReveal>

              {/* Decorative Accent */}
              <div className="absolute -left-12 -bottom-24 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* Right: Value Prop Cards */}
            <div className="relative">
              {/* Offset grid layout for cards */}
              <div className="flex flex-col gap-6 relative z-10">

                {content.features?.map((feature: any, i: number) => (
                  <ScrollReveal key={i} delay={0.1 * (i + 1)}>
                    <div className={`bg-brand-off-white/80 backdrop-blur-sm border border-brand-charcoal/5 p-8 lg:p-10 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-brand-charcoal/5 transition-all duration-500 group ${i === 0 ? 'ml-0 lg:-ml-12' : ''} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-[40px] -mt-16 -mr-16 transition-all duration-500 group-hover:bg-brand-gold/10 group-hover:scale-150" />
                      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-brand-charcoal/5 flex items-center justify-center shrink-0 group-hover:bg-brand-gold/10 transition-colors">
                          {i === 0 ? (
                            <Users className="w-6 h-6 text-brand-charcoal group-hover:text-brand-gold transition-colors" />
                          ) : (
                            <Shield className="w-6 h-6 text-brand-charcoal group-hover:text-brand-gold transition-colors" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-brand-black mb-3">{feature.title}</h3>
                          <p className="text-sm text-brand-charcoal/60 leading-relaxed">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}

              </div>
            </div>

          </div>
        </div>
      </section>

      
    </>
  );
}

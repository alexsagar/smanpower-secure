"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function ManifestoBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-off-white relative">
      <div className="container-wide px-6 lg:px-12 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
          
          <div className="lg:col-span-4 relative">
            <ScrollReveal className="lg:sticky lg:top-40">
              {content.eyebrow && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-2 h-2 bg-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-semibold tracking-[0.4em] uppercase">
                    {content.eyebrow}
                  </span>
                </div>
              )}
              <h2 className="text-brand-black text-5xl lg:text-[4rem] font-bold tracking-tighter uppercase leading-[0.9] whitespace-pre-line">
                {content.sectionTitle}
              </h2>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-8">
            <ScrollReveal delay={0.2} className="space-y-0">
              {content.statements?.map((stmt: any, i: number) => (
                <div key={i} className={`group ${i === 0 ? 'border-t' : 'border-y'} border-brand-charcoal/10 py-12 lg:py-16 hover:border-brand-gold transition-colors duration-700 cursor-default`}>
                  <p className="text-3xl md:text-4xl lg:text-5xl text-brand-black/30 font-light leading-tight group-hover:text-brand-black transition-colors duration-500">
                    {stmt.text}
                    {stmt.highlight && (
                      <span className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors duration-500">
                        {stmt.highlight}
                      </span>
                    )}
                    {stmt.suffix}
                  </p>
                </div>
              ))}

              {content.ctaText && content.ctaHref && (
                <div className="pt-16 flex justify-end">
                  <Link href={`${content.ctaHref.startsWith('/') ? '' : '/'}${content.ctaHref}`}>
                    <div className="inline-flex items-center gap-6 bg-brand-black text-brand-white px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-all duration-300">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{content.ctaText}</span>
                      <ArrowRight className="w-5 h-5" />
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

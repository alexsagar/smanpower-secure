"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { getStatistics } from "@/repositories/content-resolver";

export function ManifestoBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
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
                  <Link href={`${prefix}${content.ctaHref.startsWith('/') ? '' : '/'}${content.ctaHref}`}>
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

export function StatisticsBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    getStatistics().then(setStats);
  }, []);

  return (
    <section className="bg-brand-off-white w-full border-y border-brand-charcoal/10">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={stat.id} className="relative p-10 lg:p-14 border-b border-brand-charcoal/10 md:border-r lg:[&:nth-child(3n)]:border-r-0 group overflow-hidden flex flex-col justify-between min-h-[300px] lg:min-h-[350px]">
              <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-brand-black/40 text-[10px] font-semibold tracking-[0.3em] uppercase group-hover:text-brand-black transition-colors duration-500">
                  {stat.label}
                </span>
                <span className="text-brand-black/20 text-[10px] font-mono">0{i + 1}</span>
              </div>
              <div className="relative z-10 flex flex-col items-end mt-12">
                <span className="text-brand-black text-7xl lg:text-[8rem] leading-none font-serif italic font-light tracking-tighter group-hover:scale-110 transition-transform duration-[1s] ease-out origin-bottom-right">
                  {stat.value}
                  {stat.suffix && <span className="text-5xl lg:text-7xl text-brand-gold ml-1">{stat.suffix}</span>}
                </span>
              </div>
              <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <span className="text-brand-gold text-[10px] tracking-[0.2em] uppercase font-bold">{stat.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

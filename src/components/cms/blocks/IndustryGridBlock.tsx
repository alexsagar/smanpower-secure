import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

export function IndustryGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 7: INDUSTRIES WE SERVE (HIGH-CONTRAST MONOLITHIC GRID) */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative">
        <div className="container-wide px-6 lg:px-12 mx-auto">

          <div className="mb-20 lg:mb-32">
            {content.eyebrow && (
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-16 bg-brand-gold" />
                  <span className="text-brand-charcoal/50 text-[10px] font-semibold tracking-[0.3em] uppercase">
                    {content.eyebrow}
                  </span>
                </div>
              </ScrollReveal>
            )}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
              <ScrollReveal className="max-w-4xl">
                <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter text-brand-charcoal leading-[0.9] uppercase [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
                  <RichTextRenderer content={block.richHeading} />
                </div>
              </ScrollReveal>

              {content.description && (
                <ScrollReveal delay={0.2} className="max-w-sm pb-2">
                  <p className="text-brand-charcoal/70 text-base md:text-lg leading-relaxed font-medium">
                    {content.description}
                  </p>
                </ScrollReveal>
              )}
            </div>
          </div>

          {/* Seamless Monolithic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-brand-charcoal/10">
            {content.industries?.map((industry: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.05} className="w-full h-full">
                <Link href={`${industry.href?.startsWith('/') ? '' : '/'}${industry.href}`} className="group relative block h-[300px] lg:h-[350px] border-b border-r border-brand-charcoal/10 overflow-hidden bg-brand-white cursor-pointer">

                  {/* Hover Slide Background. When the industry has a photo it
                      rides up with the panel, so the reveal shows the sector at
                      work; without one the original solid panel is unchanged. */}
                  <div className="absolute inset-0 overflow-hidden bg-brand-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-[0.8s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                    {industry.image && (
                      <>
                        <Image
                          src={industry.image}
                          alt={industry.imageAlt || industry.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover opacity-70 scale-105 group-hover:scale-100 transition-transform duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)]"
                        />
                        {/* Scrim keeps the overlaid figures legible on any photo. */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/70 to-brand-charcoal/30" />
                      </>
                    )}
                  </div>

                  {/* Huge Background Number on Hover */}
                  <div className="absolute -bottom-10 -right-10 text-[12rem] leading-none font-serif italic text-brand-white/[0.03] group-hover:text-brand-white/[0.05] transition-colors duration-700 pointer-events-none">
                    0{i + 1}
                  </div>

                  <div className="relative z-10 h-full p-8 lg:p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-brand-charcoal/30 group-hover:text-brand-gold font-mono text-xs transition-colors duration-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="w-10 h-10 rounded-full border border-brand-charcoal/10 group-hover:border-brand-gold/30 flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 bg-brand-white group-hover:bg-brand-charcoal">
                        <ArrowRight className="w-4 h-4 text-brand-charcoal/30 group-hover:text-brand-gold transition-colors duration-500" />
                      </div>
                    </div>

                    <div>
                      <h3 className="card-title text-brand-charcoal group-hover:text-brand-white transition-colors duration-500 max-w-[200px]">
                        {industry.title}
                      </h3>
                      {/* Optional: entries without a count keep the original layout. */}
                      {industry.deploymentCount && (
                        <div className="mt-3">
                          <p className="font-serif italic text-xl text-brand-charcoal/60 group-hover:text-brand-gold group-hover:text-3xl transition-all duration-500">
                            {industry.deploymentCount}
                          </p>
                          {content.deploymentLabel && (
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-white/0 group-hover:text-brand-white/70 transition-colors duration-500">
                              {content.deploymentLabel}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </Link>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      
    </>
  );
}

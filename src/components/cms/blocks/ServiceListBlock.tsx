import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

export function ServiceListBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 5: WORKFORCE SOLUTIONS (HIGH-END AGENCY MENU) */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative">
        <div className="container-wide px-6 lg:px-12 mx-auto">

          {/* Top Heading Split */}
          <div className="mb-24">
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
                <div className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter text-brand-charcoal leading-[0.9] uppercase [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
                  <RichTextRenderer content={block.richHeading} />
                </div>
              </ScrollReveal>

              {content.description && (
                <ScrollReveal delay={0.2} className="max-w-sm pb-4">
                  <p className="text-brand-charcoal/60 text-lg leading-relaxed font-medium">
                    {content.description}
                  </p>
                </ScrollReveal>
              )}
            </div>
          </div>

          {/* Interactive Full-Width List */}
          <div className="border-t border-brand-charcoal/20">
            {content.services?.map((service: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Link href={`${service.href?.startsWith('/') ? '' : '/'}${service.href}`}>
                  <div className="group flex flex-col xl:flex-row xl:items-center justify-between py-12 lg:py-16 border-b border-brand-charcoal/20 hover:bg-brand-charcoal transition-colors duration-700 px-6 lg:px-12 -mx-6 lg:-mx-12 cursor-pointer">

                    {/* Number and Title */}
                    <div className="flex items-center gap-8 lg:gap-16 w-full xl:w-auto mb-8 xl:mb-0">
                      <span className="text-brand-charcoal/20 group-hover:text-brand-white/20 text-5xl lg:text-7xl font-serif italic font-light transition-colors duration-500 w-16 lg:w-24">
                        0{i + 1}
                      </span>
                      <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-brand-charcoal group-hover:text-brand-white transition-colors duration-500">
                        {service.title}
                      </h3>
                    </div>

                    {/* Description and Arrow Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-8 lg:gap-16 w-full xl:w-auto pl-24 lg:pl-40 xl:pl-0">
                      <p className="text-brand-charcoal/60 group-hover:text-brand-white/70 max-w-sm text-base lg:text-lg transition-colors duration-500 leading-relaxed font-medium">
                        {service.desc}
                      </p>

                      <div className="w-16 h-16 rounded-full border border-brand-charcoal/20 group-hover:border-brand-gold flex items-center justify-center transition-all duration-700 shrink-0">
                        <ArrowRight className="w-6 h-6 text-brand-charcoal/30 group-hover:text-brand-gold -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                      </div>
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

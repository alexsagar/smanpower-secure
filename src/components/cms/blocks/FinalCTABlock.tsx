import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

export function FinalCTABlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 14: FINAL CORPORATE STATEMENT */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative overflow-hidden flex items-center justify-center min-h-[70vh]">
        {/* Abstract Glowing Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-[800px] h-[800px] bg-brand-gold/15 rounded-full blur-[150px]" />
        </div>

        <div className="container-narrative relative z-10 text-center">
          <ScrollReveal>
            {content.eyebrow && (
              <div className="inline-flex items-center gap-4 mb-12">
                <div className="w-12 h-px bg-brand-gold/50" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">{content.eyebrow}</span>
                <div className="w-12 h-px bg-brand-gold/50" />
              </div>
            )}

            <div className="text-4xl md:text-5xl lg:text-7xl font-light leading-[1.15] mb-16 text-brand-black tracking-tight [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
              <RichTextRenderer content={block.richHeading} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              {content.primaryCta?.text && content.primaryCta?.href && (
                <Link href={`${content.primaryCta.href?.startsWith('/') ? '' : '/'}${content.primaryCta.href}`} className="group relative inline-flex items-center justify-center px-10 py-5 overflow-hidden rounded-full bg-brand-gold text-brand-black font-bold text-xs uppercase tracking-widest transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(181,145,63,0.4)]">
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-brand-black">{content.primaryCta.text}</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                </Link>
              )}

              {content.secondaryCta?.text && content.secondaryCta?.href && (
                <Link href={`${content.secondaryCta.href?.startsWith('/') ? '' : '/'}${content.secondaryCta.href}`} className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors">
                  <div className="w-12 h-12 rounded-full border border-brand-charcoal/20 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span>{content.secondaryCta.text}</span>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    
    </>
  );
}

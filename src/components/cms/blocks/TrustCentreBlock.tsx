import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";

export function TrustCentreBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 10: TRUST CENTRE */}
      <section className="section-padding bg-brand-off-white text-brand-black relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-white/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-wide relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-16 lg:mb-24">
            <ScrollReveal className="max-w-2xl">
              {content.eyebrow && (
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-brand-gold" />
                  <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">{content.eyebrow}</span>
                </div>
              )}
              {content.heading && (
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight">
                  {content.heading.replace(content.headingHighlight || '', '')} 
                  {content.headingHighlight && (
                    <span className="font-serif italic text-brand-gold">{content.headingHighlight}</span>
                  )}
                </h2>
              )}
              {content.description && (
                <p className="text-brand-black/50 text-lg md:text-xl leading-relaxed">
                  {content.description}
                </p>
              )}
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              {content.ctaText && content.ctaHref && (
                <Link href={`${prefix}${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`} className="inline-flex items-center gap-4 group">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70 group-hover:text-brand-gold transition-colors">{content.ctaText}</span>
                  <div className="w-12 h-12 rounded-full border border-brand-charcoal/10 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-brand-black group-hover:text-brand-gold" />
                  </div>
                </Link>
              )}
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.documents?.map((doc: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.1} className="group relative">
                {/* Glowing border effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />

                <div className="relative h-full bg-brand-off-white/40 border border-brand-charcoal/5 group-hover:border-brand-gold/30 rounded-2xl p-8 transition-all duration-500 overflow-hidden flex flex-col">
                  {/* Decorative background watermark */}
                  <FileText className="absolute -right-8 -bottom-8 w-48 h-48 text-brand-black/[0.02] transform -rotate-12 group-hover:text-brand-gold/[0.05] group-hover:scale-110 transition-all duration-700" />

                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-brand-charcoal/5 flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors duration-500">
                      <FileText className="w-5 h-5 text-brand-gold" />
                    </div>
                    <span className="text-[9px] font-mono text-brand-black/30 tracking-widest">{doc.id}</span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-light text-brand-black mb-2 group-hover:text-brand-gold transition-colors">{doc.title}</h3>
                    <p className="text-xs uppercase tracking-widest text-brand-black/40 mb-12">{doc.type}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-charcoal/10 relative z-10">
                    <div className="flex items-center gap-2 text-brand-black/50">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] tracking-wider uppercase">{doc.date}</span>
                    </div>

                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-charcoal/5 group-hover:bg-brand-gold hover:scale-110 transition-all duration-300 group/btn">
                      <Download className="w-3 h-3 text-brand-black group-hover/btn:text-brand-black" />
                    </button>
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

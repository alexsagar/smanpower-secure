import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";

export type TrustDoc = { id: string; title: string; type: string; date: string; href?: string };

export function TrustCentreBlock({
  block,
  lang,
  documents: liveDocuments,
}: { block: CmsContentBlock; lang: string; documents?: TrustDoc[] }) {
  void lang;
  const content = block.content as any;
  // Live compliance documents drive the cards; the CMS block supplies the
  // heading/eyebrow/cta. Fall back to the block's demo list when none exist.
  const documents: any[] = liveDocuments && liveDocuments.length > 0
    ? liveDocuments
    : (content.documents as any[] | undefined) ?? [];

  return (
    <>
      {/* SECTION 10: TRUST CENTRE */}
      <section className="py-24 md:py-32 bg-brand-off-white text-brand-black relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-black/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          {/* Centered Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
            <ScrollReveal>
              {content.eyebrow && (
                <div className="inline-flex items-center justify-center gap-3 mb-6 bg-brand-black text-brand-gold text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 border border-brand-gold/30">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>{content.eyebrow}</span>
                </div>
              )}
              {content.heading && (
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                  {content.heading.replace(content.headingHighlight || '', '')} 
                  {content.headingHighlight && (
                    <span className="font-serif italic text-brand-gold">{content.headingHighlight}</span>
                  )}
                </h2>
              )}
              {content.description && (
                <p className="text-brand-charcoal/70 text-lg md:text-xl font-sans leading-relaxed max-w-2xl mx-auto mb-8">
                  {content.description}
                </p>
              )}
              {content.ctaText && content.ctaHref && (
                <Link
                  href={`${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`}
                  className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors border-b-2 border-brand-black hover:border-brand-gold pb-1"
                >
                  <span>{content.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </ScrollReveal>
          </div>

          {/* Centered Document Cards Layout */}
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {documents.map((doc: any, i: number) => (
              <ScrollReveal key={doc.id || i} delay={i * 0.1} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm group">
                <div className="relative h-full bg-brand-white border border-brand-black/15 hover:border-brand-gold hover:shadow-2xl transition-all duration-500 p-8 flex flex-col justify-between overflow-hidden">
                  {/* Background Watermark Icon */}
                  <FileText className="absolute -right-6 -bottom-6 w-40 h-40 text-brand-black/[0.03] transform -rotate-12 group-hover:text-brand-gold/[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none" />

                  <div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-12 h-12 bg-brand-black text-brand-gold flex items-center justify-center border border-brand-gold/30">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-brand-muted tracking-widest uppercase">
                        Doc #{i + 1 < 10 ? `00${i + 1}` : `0${i + 1}`}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="font-serif text-2xl font-normal text-brand-black group-hover:text-brand-gold transition-colors mb-3 leading-snug">
                        {doc.title}
                      </h3>
                      <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold bg-brand-black px-2.5 py-1 mb-8">
                        {doc.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-black/10 relative z-10 font-sans">
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs tracking-wider uppercase font-mono">{doc.date}</span>
                    </div>

                    {doc.href ? (
                      <a
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${doc.title}`}
                        className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-brand-black group-hover:text-brand-gold transition-colors"
                      >
                        <span>Download</span>
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Download ${doc.title}`}
                        className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-brand-black group-hover:text-brand-gold transition-colors"
                      >
                        <span>Download</span>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
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

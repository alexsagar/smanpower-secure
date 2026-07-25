"use client";

import React from "react";
import { Quote, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface EthicalEditorialOverviewProps {
  title: string;
  subtitle?: string;
  paragraphs?: string[];
}

export function EthicalEditorialOverview({
  title,
  subtitle = "Executive Overview",
  paragraphs = [],
}: EthicalEditorialOverviewProps) {
  if (!paragraphs || paragraphs.length === 0) return null;

  const leadParagraph = paragraphs[0];
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <section className="py-20 lg:py-28 bg-brand-off-white text-brand-black relative overflow-hidden border-b border-brand-charcoal/10">
      {/* Soft background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Centered Top Heading Header */}
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-gold/40 text-brand-gold-dark text-[10px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
              {subtitle}
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.08] text-brand-black mb-6">
              {title}
            </h2>

            <div className="w-20 h-1 bg-brand-gold mx-auto" />
          </div>
        </ScrollReveal>

        {/* Lead Heroic Statement Card - Centered Full Width */}
        {leadParagraph && (
          <ScrollReveal delay={0.1}>
            <div className="max-w-5xl mx-auto mb-16 bg-white border-t-4 border-brand-gold border-x border-b border-brand-charcoal/10 p-8 sm:p-12 lg:p-14 shadow-md relative text-center">
              <Quote className="w-12 h-12 text-brand-gold/30 mx-auto mb-6" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-serif text-brand-black leading-tight font-normal mb-8 max-w-4xl mx-auto">
                {leadParagraph}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark px-4 py-2 bg-brand-gold/10 border border-brand-gold/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Core Operating Commitment</span>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Structured Grid Cards for Remaining Paragraphs */}
        {remainingParagraphs.length > 0 && (
          <div className={`grid grid-cols-1 ${remainingParagraphs.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "max-w-3xl mx-auto"} gap-8`}>
            {remainingParagraphs.map((para, i) => (
              <ScrollReveal key={i} delay={0.15 + i * 0.05}>
                <div className="h-full bg-white border border-brand-charcoal/10 p-8 hover:border-brand-gold hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-brand-gold-dark text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 bg-brand-gold/10 border border-brand-gold/30">
                        Section 0{i + 2}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-brand-gold-dark opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <p className="text-base text-brand-charcoal leading-relaxed font-light">
                      {para}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-brand-charcoal/10 flex items-center justify-between text-xs text-brand-muted font-light">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-brand-gold-dark" />
                      Policy Standard
                    </span>
                    <span className="font-semibold text-brand-gold-dark uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

"use client";

import React from "react";
import { Quote, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
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
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-stone/60 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12 opacity-30">
        <div className="w-px h-full bg-brand-charcoal/5" />
        <div className="w-px h-full bg-brand-charcoal/5" />
        <div className="w-px h-full bg-brand-charcoal/5" />
        <div className="w-px h-full bg-brand-charcoal/5" />
      </div>

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Heading & Key Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-36">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-brand-gold/40 text-brand-gold-dark text-[10px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
                <Sparkles className="w-3 h-3 text-brand-gold-dark" />
                {subtitle}
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-6">
                {title}
              </h2>

              <div className="w-16 h-1 bg-brand-gold mb-8" />

              <div className="p-6 bg-white border border-brand-charcoal/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-brand-gold-dark font-semibold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Key Operating Commitment
                </div>
                <p className="text-xs text-brand-muted leading-relaxed font-light">
                  Every policy in our ethical framework is enforced through pre-departure verification, transparent agreements, and 24/7 multi-channel worker redressal mechanisms.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column - Luxury Editorial Statement & Scannable Paragraph Cards */}
          <div className="lg:col-span-7 space-y-8">
            {/* Lead Statement Quote Card */}
            {leadParagraph && (
              <ScrollReveal delay={0.1}>
                <div className="relative bg-white border-l-4 border-brand-gold border-y border-r border-brand-charcoal/10 p-8 lg:p-10 shadow-md">
                  <Quote className="w-10 h-10 text-brand-gold/30 mb-4" />
                  <p className="text-xl sm:text-2xl font-serif text-brand-black leading-snug font-normal mb-4">
                    {leadParagraph}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark pt-4 border-t border-brand-charcoal/10">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Non-Negotiable Core Principle</span>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Remaining Detailed Insight Cards */}
            {remainingParagraphs.map((para, i) => (
              <ScrollReveal key={i} delay={0.15 + i * 0.05}>
                <div className="group bg-white border border-brand-charcoal/10 p-7 lg:p-8 hover:border-brand-gold/60 hover:shadow-md transition-all duration-300 relative">
                  <div className="flex items-start gap-4">
                    <span className="text-brand-gold-dark text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 shrink-0 mt-0.5">
                      0{i + 2}
                    </span>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg text-brand-charcoal leading-relaxed font-light">
                        {para}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

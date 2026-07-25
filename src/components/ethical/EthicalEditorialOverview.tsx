"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface EthicalEditorialOverviewProps {
  title: string;
  subtitle?: string;
  paragraphs?: string[];
}

export function EthicalEditorialOverview({
  title,
  subtitle = "Overview",
  paragraphs = [],
}: EthicalEditorialOverviewProps) {
  if (!paragraphs || paragraphs.length === 0) return null;

  const leadParagraph = paragraphs[0];
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <section className="py-20 lg:py-28 bg-brand-off-white text-brand-black relative overflow-hidden border-b border-brand-charcoal/10">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Centered Top Heading Header */}
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-12">
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

        {/* Single Unified Editorial Reading Container (NO CARDS, NO SEPARATION) */}
        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Lead Paragraph */}
            {leadParagraph && (
              <p className="text-2xl sm:text-3xl lg:text-4xl font-serif text-brand-black leading-snug font-normal mb-10 pb-10 border-b border-brand-charcoal/15">
                "{leadParagraph}"
              </p>
            )}

            {/* Remaining Paragraphs flowing naturally in a single container */}
            {remainingParagraphs.length > 0 && (
              <div className="space-y-6 text-lg sm:text-xl text-brand-charcoal/90 font-light leading-relaxed">
                {remainingParagraphs.map((para, i) => (
                  <p key={i}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Bottom Assurance Tag */}
            <div className="mt-12 pt-8 border-t border-brand-charcoal/10 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
              <ShieldCheck className="w-4 h-4 text-brand-gold-dark" />
              <span>Seven Seas Governance &amp; Ethical Operating Policy</span>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}

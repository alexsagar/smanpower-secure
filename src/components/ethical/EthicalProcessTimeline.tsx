"use client";

import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface ProcessStep {
  title: string;
  desc: string;
}

interface EthicalProcessTimelineProps {
  eyebrow?: string;
  heading?: string;
  steps: ProcessStep[];
}

export function EthicalProcessTimeline({
  eyebrow = "Due Diligence Operational Cycle",
  heading = "Enforcement Stage by Stage.",
  steps = [],
}: EthicalProcessTimelineProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-brand-off-white text-brand-black relative overflow-hidden border-t border-brand-charcoal/10">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-brand-gold/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Centered Top Heading */}
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-gold/40 text-brand-gold-dark text-[10px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
              {eyebrow}
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.08] text-brand-black mb-6">
              {heading}
            </h2>

            <div className="w-20 h-1 bg-brand-gold mx-auto" />
          </div>
        </ScrollReveal>

        {/* 4-Step Process Grid Flow */}
        <div className={`grid grid-cols-1 ${steps.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"} gap-6 lg:gap-8`}>
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={idx * 0.08}>
              <div className="group h-full bg-white border border-brand-charcoal/15 p-8 hover:border-brand-gold hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between rounded-none overflow-hidden">
                
                {/* Top gold step indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gold opacity-30 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Step Badge & Arrow */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono font-bold tracking-widest text-brand-black bg-brand-gold/20 border border-brand-gold/40 px-3.5 py-1.5">
                      STAGE 0{idx + 1}
                    </span>
                    {idx < steps.length - 1 ? (
                      <ArrowRight className="w-5 h-5 text-brand-gold-dark opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all hidden lg:block" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-brand-gold-dark opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-brand-black mb-4 tracking-tight group-hover:text-brand-gold-dark transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-brand-muted leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Assurance Tag */}
                <div className="mt-8 pt-6 border-t border-brand-charcoal/10 flex items-center justify-between text-xs text-brand-muted font-light">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-gold-dark" />
                    Verified Control
                  </span>
                  <span className="font-semibold text-brand-gold-dark uppercase tracking-wider">Active</span>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}

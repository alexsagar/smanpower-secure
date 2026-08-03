"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, Award, HeartHandshake, ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const COMPLIANCE_BADGES = [
  { icon: ShieldCheck, label: "RBA Code Aligned", detail: "Labour Provisions 7.0" },
  { icon: Scale, label: "ILO Fair Recruitment", detail: "General Principles" },
  { icon: Award, label: "IOM IRIS Standards", detail: "Ethical Sourcing" },
  { icon: HeartHandshake, label: "Dhaka Principles", detail: "Migration with Dignity" },
];

const METRICS = [
  { value: "100%", label: "Employer Pays Principle", desc: "Zero placement fees to candidates" },
  { value: "24/7", label: "Grievance Redressal", desc: "Multilingual, retaliation-free channel" },
  { value: "100%", label: "Contract Transparency", desc: "Native language pre-departure agreements" },
  { value: "0", label: "Document Retention", desc: "Workers retain full passport possession" },
];

interface EthicalHeroProps {
  title?: string;
  subtitle?: string;
}

export function EthicalHero({
  title = "Doing What Is Right. Always.",
  subtitle = "At Seven Seas Intercontinental, ethical recruitment is our foundation—not an afterthought. We enforce zero recruitment fees, total contract transparency, and RBA-compliant worker protections across every deployment.",
}: EthicalHeroProps) {
  return (
    <section className="relative bg-brand-off-white text-brand-black pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden border-b border-brand-charcoal/10">
      {/* Soft background accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-brand-stone blur-[100px] rounded-full pointer-events-none" />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12 opacity-40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-px h-full bg-brand-charcoal/5" />
        ))}
      </div>

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <ScrollReveal>
          <div className="max-w-4xl">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-brand-gold/40 text-brand-gold-dark text-xs font-semibold uppercase tracking-[0.25em] mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              Institutional Ethics & Human Rights Policy
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] text-brand-black mb-8">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-brand-muted font-light leading-relaxed max-w-3xl mb-12">
              {subtitle}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link
                href="/ethical-recruitment/rba-aligned-practices"
                className="inline-flex items-center gap-3 bg-brand-black text-brand-white px-8 py-4 font-semibold text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-all duration-300 group shadow-md"
              >
                <span>Explore RBA Framework</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/worker-grievance"
                className="inline-flex items-center gap-3 border border-brand-charcoal/20 bg-white text-brand-black px-8 py-4 font-semibold text-xs uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold-dark transition-all duration-300 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-gold-dark" />
                <span>Report / Grievance Channel</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Global Compliance Frameworks Cards */}
        <div className="pt-10 border-t border-brand-charcoal/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {COMPLIANCE_BADGES.map((b, idx) => {
            const IconComponent = b.icon;
            return (
              <div
                key={idx}
                className="p-5 border border-brand-charcoal/10 bg-white hover:border-brand-gold hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className="w-5 h-5 text-brand-gold-dark group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-brand-black group-hover:text-brand-gold-dark transition-colors">
                    {b.label}
                  </span>
                </div>
                <p className="text-xs text-brand-muted font-light tracking-wide">{b.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Highlight Key Metrics Band */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m, idx) => (
            <div
              key={idx}
              className="relative p-6 border-l-2 border-brand-gold bg-white border border-brand-charcoal/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl lg:text-4xl font-serif font-bold text-brand-gold-dark mb-1 tracking-tight">
                {m.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-1">
                {m.label}
              </div>
              <div className="text-xs text-brand-muted font-light">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

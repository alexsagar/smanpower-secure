"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, FileCheck, HeartHandshake, Lock, BookOpen, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface EthicalPillarItem {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  href: string;
  tag: string;
}

export const ETHICAL_PILLARS: EthicalPillarItem[] = [
  {
    slug: "rba-aligned-practices",
    title: "RBA-Aligned Practices",
    subtitle: "Supply Chain Standard",
    description: "Aligning recruitment procedures with the RBA Code of Conduct for freely chosen employment and zero forced labor.",
    iconName: "ShieldCheck",
    href: "/ethical-recruitment/rba-aligned-practices",
    tag: "Audit Compliance",
  },
  {
    slug: "worker-rights",
    title: "Protecting Worker Rights",
    subtitle: "Human Dignity",
    description: "Guaranteeing full possession of passports, fair working hours, safe conditions, and freedom from contract substitution.",
    iconName: "Scale",
    href: "/ethical-recruitment/worker-rights",
    tag: "Dhaka Principles",
  },
  {
    slug: "recruitment-fees",
    title: "Zero Recruitment Fees Policy",
    subtitle: "Employer-Pays Principle",
    description: "Enforcing the Employer-Pays Principle so candidates pay zero placement, processing, visa, or flight fees.",
    iconName: "FileCheck",
    href: "/ethical-recruitment/recruitment-fees",
    tag: "ILO Fair Recruitment",
  },
  {
    slug: "grievance-process",
    title: "Transparent Grievance Mechanism",
    subtitle: "24/7 Multilingual Support",
    description: "Accessible, confidential, and retaliation-free channels for deployed workers and families to resolve concerns.",
    iconName: "HeartHandshake",
    href: "/ethical-recruitment/grievance-process",
    tag: "UNGP Standard",
  },
  {
    slug: "policies",
    title: "Ethical Policies & Governance",
    subtitle: "Binding Operations",
    description: "Complete legal and operational policy suite governing staff, sub-agents, anti-corruption, and worker welfare.",
    iconName: "BookOpen",
    href: "/ethical-recruitment/policies",
    tag: "DoFE Nepal Act 2007",
  },
  {
    slug: "privacy-policy",
    title: "Privacy & Data Protection",
    subtitle: "Secure Candidate Records",
    description: "Strict protocols protecting candidate identity, passports, medical records, and pre-departure data.",
    iconName: "Lock",
    href: "/privacy-policy",
    tag: "Data Security",
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Scale,
  FileCheck,
  HeartHandshake,
  BookOpen,
  Lock,
};

export function EthicalPillarsHub({ pillars = ETHICAL_PILLARS }: { pillars?: EthicalPillarItem[] }) {
  return (
    <section className="py-24 lg:py-32 bg-brand-black text-brand-white relative overflow-hidden border-b border-brand-white/10">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mb-20">
            <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
              Core Pillars of Ethical Deployment
            </span>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
              Institutional Frameworks Built On Human Dignity.
            </h2>
            <p className="text-lg text-brand-white/60 font-light leading-relaxed mt-6">
              Explore our six pillars of responsible workforce mobilization. Each policy is enforced through continuous due diligence and independent third-party audits.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const IconComponent = ICON_MAP[pillar.iconName] || ShieldCheck;
            return (
              <ScrollReveal key={pillar.slug} delay={idx * 0.05}>
                <Link
                  href={pillar.href}
                  className="group relative flex flex-col h-full border border-brand-white/10 bg-brand-white/[0.02] p-8 lg:p-10 hover:border-brand-gold/50 hover:bg-brand-white/[0.05] transition-all duration-500 rounded-none overflow-hidden"
                >
                  {/* Top gold bar animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Corner Accent */}
                  <div className="absolute top-4 right-4 text-brand-white/20 group-hover:text-brand-gold transition-colors duration-300">
                    <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>

                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-all duration-300">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-brand-gold/70 bg-brand-gold/5 border border-brand-gold/20 px-3 py-1">
                      {pillar.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <span className="text-xs text-brand-white/40 uppercase tracking-widest block mb-1">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-2xl font-semibold tracking-tight text-brand-white group-hover:text-brand-gold transition-colors">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-brand-white/60 leading-relaxed font-light mb-8 flex-grow">
                    {pillar.description}
                  </p>

                  {/* Read More Link */}
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold border-b border-brand-gold/30 pb-1 group-hover:border-brand-gold w-fit transition-all">
                    <span>View Policy Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

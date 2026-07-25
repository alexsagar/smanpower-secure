import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EthicalFaqAccordion } from "./EthicalFaqAccordion";
import { GrievanceActionWidget, FeeMatrixWidget, PolicyDownloadWidget } from "./EthicalInteractiveWidgets";
import type { PageContent } from "@/lib/content";

/** International frameworks aligned across ethical recruitment */
const STANDARDS = [
  { abbr: "RBA", name: "Code of Conduct 7.0" },
  { abbr: "ILO", name: "Fair Recruitment Principles" },
  { abbr: "IOM IRIS", name: "Ethical Sourcing Framework" },
  { abbr: "Dhaka", name: "Migration with Dignity" },
  { abbr: "DoFE", name: "Foreign Employment Act 2007" },
];

export function EthicalPageTemplate({ content }: { content: PageContent }) {
  return (
    <article className="min-h-screen bg-brand-black text-brand-white">
      {/* Dynamic Hero */}
      <HeroInternal title={content.title} subtitle={content.subtitle} imageSrc={content.heroImage} />

      {/* Standards Bar */}
      <section className="bg-brand-black border-y border-brand-white/10 relative z-20">
        <div className="container-wide mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase block">
                Aligned Frameworks
              </span>
              <span className="text-xs text-brand-white/60 font-light">Global Compliance Standards</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {STANDARDS.map((s) => (
              <div key={s.abbr} className="flex items-center gap-2 group">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
                <span className="text-sm font-semibold tracking-tight text-brand-white group-hover:text-brand-gold transition-colors">
                  {s.abbr}
                </span>
                <span className="text-[11px] text-brand-white/40 font-light uppercase tracking-wider">
                  ({s.name})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Editorial Content */}
      <section className="py-20 lg:py-28 bg-brand-black text-brand-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-12">
            <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-white/50">
              <li>
                <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold" /></li>
              <li>
                <Link href="/ethical-recruitment" className="hover:text-brand-gold transition-colors">Ethical Recruitment</Link>
              </li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold" /></li>
              <li className="text-brand-gold">{content.subtitle || content.title}</li>
            </ol>
          </nav>

          <EditorialSection
            title={content.missionHeading || `Explore ${content.title}`}
            subtitle={content.overviewSubtitle || "Operational Context"}
          >
            {content.missionText?.map((text, idx) => (
              <p
                key={idx}
                className={`leading-relaxed mb-8 font-light tracking-tight ${
                  idx === 0
                    ? "text-2xl md:text-3xl text-brand-white border-l-2 border-brand-gold pl-6 py-2"
                    : "text-lg text-brand-white/70"
                }`}
              >
                {text}
              </p>
            ))}
          </EditorialSection>
        </div>
      </section>

      {/* Key Highlights / Features Grid */}
      {content.features && content.features.length > 0 && (
        <section className="py-24 lg:py-32 bg-brand-black text-brand-white relative border-t border-brand-white/10">
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none" />

          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.featuresEyebrow || "The Seven Seas Standard"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
                {content.featuresHeading || "Core Institutional Commitments."}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.features.map((feature, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="group h-full border border-brand-white/10 bg-brand-white/[0.02] p-8 lg:p-10 hover:border-brand-gold/50 hover:bg-brand-white/[0.05] transition-all duration-500 relative flex flex-col justify-between">
                    <div>
                      <div className="text-brand-gold text-4xl font-serif italic mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-2xl font-semibold text-brand-white mb-4 group-hover:text-brand-gold transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-brand-white/60 leading-relaxed font-light text-sm">
                        {feature.desc}
                      </p>
                    </div>
                    <div className="w-12 h-px bg-brand-gold/30 mt-8 group-hover:w-full group-hover:bg-brand-gold transition-all duration-700" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Sub-Page Interactive Widget */}
      {content.slug === "grievance-process" && <GrievanceActionWidget />}
      {content.slug === "recruitment-fees" && <FeeMatrixWidget />}
      {content.slug === "policies" && <PolicyDownloadWidget />}

      {/* Due Diligence Process Timeline */}
      {content.process && content.process.length > 0 && (
        <section className="py-24 lg:py-32 bg-brand-black text-brand-white relative border-t border-brand-white/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.processEyebrow || "Due Diligence Operational Cycle"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
                {content.processHeading || "Enforcement Stage by Stage."}
              </h2>
            </div>

            <ol className="relative max-w-4xl border-l border-brand-gold/30 ml-4 space-y-12">
              {content.process.map((step, i) => (
                <ScrollReveal key={step.title} delay={i * 0.05}>
                  <li className="relative pl-10 md:pl-14 group">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 bg-brand-black border border-brand-gold flex items-center justify-center group-hover:bg-brand-gold transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-brand-gold group-hover:bg-brand-black transition-colors" />
                    </span>
                    <span className="text-brand-gold text-xs font-mono font-semibold tracking-widest block uppercase mb-1">
                      Stage {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl font-semibold tracking-tight text-brand-white mb-3 group-hover:text-brand-gold transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-brand-white/70 leading-relaxed font-light text-base max-w-3xl">
                      {step.desc}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="py-24 lg:py-32 bg-brand-black text-brand-white relative border-t border-brand-white/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.faqsEyebrow || "Honest Answers"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
                {content.faqsHeading || "Ethical Recruitment Explained."}
              </h2>
            </div>
            <EthicalFaqAccordion faqs={content.faqs} />
          </div>
        </section>
      )}

      {/* High Impact Closing CTA */}
      <section className="py-24 bg-brand-gold text-brand-black relative overflow-hidden">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-3xl">
            <span className="text-brand-black/60 text-xs font-semibold tracking-widest uppercase mb-3 block">
              Ethical Recruitment Guarantee
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4">
              {content.cta?.heading || "Partner with an agency that prioritises human dignity."}
            </h2>
            <p className="text-lg text-brand-black/80 font-light leading-relaxed">
              {content.cta?.body || "Learn how our transparent recruitment model protects workers and strengthens employer supply chain compliance."}
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              href={content.cta?.buttonHref || "/contact"}
              className="inline-flex items-center gap-3 bg-brand-black text-brand-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-charcoal transition-colors shadow-xl"
            >
              <span>{content.cta?.buttonLabel || "Contact Ethical Team"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ethical-recruitment"
              className="inline-flex items-center gap-3 border border-brand-black/30 text-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-black/10 transition-colors"
            >
              <span>All Ethical Policies</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

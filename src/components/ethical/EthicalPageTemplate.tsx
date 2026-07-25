import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EthicalFaqAccordion } from "./EthicalFaqAccordion";
import type { PageContent } from "@/lib/content";

/** The frameworks every ethical-recruitment page aligns with. Shared across the
 *  five pages, so it lives here rather than in per-page CMS content. */
const STANDARDS = [
  { abbr: "RBA", name: "Code of Conduct" },
  { abbr: "ILO", name: "Fair Recruitment" },
  { abbr: "IOM IRIS", name: "Ethical Recruitment" },
  { abbr: "Dhaka", name: "Migration with Dignity" },
  { abbr: "DoFE", name: "Foreign Employment Act 2007" },
];

/**
 * Dedicated template for the /ethical-recruitment/[slug] pages. Uses the same
 * brand system as DynamicPageTemplate (HeroInternal, EditorialSection, gold
 * eyebrows, architectural grid, ScrollReveal) but adds a standards band, a gold
 * process timeline, and an FAQ accordion. Other categories keep DynamicPageTemplate.
 */
export function EthicalPageTemplate({ content }: { content: PageContent }) {
  return (
    <>
      <HeroInternal title={content.title} subtitle={content.subtitle} imageSrc={content.heroImage} />

      {/* Standards band — the frameworks we align with */}
      <section className="bg-brand-black text-brand-white border-t border-brand-white/5">
        <div className="container-wide mx-auto px-6 lg:px-12 py-10 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase">
              Aligned With
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {STANDARDS.map((s) => (
              <div key={s.abbr} className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tracking-tight text-brand-white">{s.abbr}</span>
                <span className="text-xs text-brand-white/40 uppercase tracking-wider">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <EditorialSection
        title={content.missionHeading || `Explore ${content.title}`}
        subtitle={content.overviewSubtitle || "Overview"}
      >
        {content.missionText?.map((text, idx) => (
          <p
            key={idx}
            className={`leading-relaxed mb-8 font-light tracking-tight ${
              idx === 0 ? "text-2xl md:text-3xl text-brand-black" : "text-lg text-brand-muted"
            }`}
          >
            {text}
          </p>
        ))}
      </EditorialSection>

      {/* Features — dark numbered grid (matches the rest of the site) */}
      {content.features && content.features.length > 0 && (
        <section className="py-24 md:py-32 bg-brand-black text-brand-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-20 text-center">
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.featuresEyebrow || "Key Highlights"}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
                {content.featuresHeading || "The Seven Seas Standard."}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.features.map((feature, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="group h-full border border-brand-white/10 bg-brand-white/[0.02] p-10 hover:border-brand-gold/30 hover:bg-brand-white/[0.04] transition-all duration-500">
                    <div className="text-brand-gold text-4xl font-serif italic mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                      0{i + 1}
                    </div>
                    <h3 className="card-title text-brand-white mb-4 group-hover:text-brand-gold transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-brand-white/60 leading-relaxed font-light">{feature.desc}</p>
                    <div className="w-12 h-px bg-brand-gold/30 mt-8 group-hover:w-full group-hover:bg-brand-gold transition-all duration-700" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process — vertical gold timeline */}
      {content.process && content.process.length > 0 && (
        <section className="py-24 md:py-32 bg-brand-off-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12 opacity-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-px h-full bg-brand-charcoal/[0.04]" />
            ))}
          </div>
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.processEyebrow || "How We Work"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.processHeading || "Our Process."}
              </h2>
            </div>
            <ol className="relative max-w-3xl border-l border-brand-charcoal/15 ml-3">
              {content.process.map((step, i) => (
                <ScrollReveal key={step.title} delay={i * 0.05}>
                  <li className="relative pl-10 md:pl-14 pb-14 last:pb-0 group">
                    <span className="absolute -left-3 top-0 w-6 h-6 bg-brand-off-white border border-brand-gold/40 flex items-center justify-center group-hover:bg-brand-gold transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-brand-gold group-hover:bg-brand-black transition-colors" />
                    </span>
                    <span className="text-brand-gold/60 text-sm font-semibold tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl md:text-2xl font-light tracking-tight text-brand-black mt-2 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-brand-charcoal/70 leading-relaxed font-light">{step.desc}</p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ — accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="py-24 md:py-32 bg-brand-black text-brand-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.faqsEyebrow || "Common Questions"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-white">
                {content.faqsHeading || "Frequently Asked Questions."}
              </h2>
            </div>
            <EthicalFaqAccordion faqs={content.faqs} />
          </div>
        </section>
      )}

      {/* Closing CTA band */}
      {content.cta && (
        <section className="py-24 md:py-32 bg-brand-gold relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] text-brand-black max-w-3xl mb-6">
              {content.cta.heading}
            </h2>
            <p className="text-lg md:text-xl text-brand-black/80 max-w-2xl leading-relaxed mb-10">
              {content.cta.body}
            </p>
            {content.cta.buttonLabel && content.cta.buttonHref && (
              <Link
                href={content.cta.buttonHref}
                className="inline-flex items-center gap-2 bg-brand-black text-brand-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-charcoal transition-colors"
              >
                {content.cta.buttonLabel}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}

import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EthicalEditorialOverview } from "./EthicalEditorialOverview";
import { EthicalProcessTimeline } from "./EthicalProcessTimeline";
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
    <article className="min-h-screen bg-brand-off-white text-brand-black">
      {/* Dynamic Hero */}
      <HeroInternal title={content.title} subtitle={content.subtitle} imageSrc={content.heroImage} />

      {/* Standards Bar */}
      <section className="bg-white border-y border-brand-charcoal/10 relative z-20 shadow-sm">
        <div className="container-wide mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-brand-gold/10 border border-brand-gold/40 flex items-center justify-center text-brand-gold-dark">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-brand-gold-dark text-[10px] font-semibold tracking-[0.3em] uppercase block">
                Aligned Frameworks
              </span>
              <span className="text-xs text-brand-muted font-light">Global Compliance Standards</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {STANDARDS.map((s) => (
              <div key={s.abbr} className="flex items-center gap-2 group">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span className="text-sm font-semibold tracking-tight text-brand-black group-hover:text-brand-gold-dark transition-colors">
                  {s.abbr}
                </span>
                <span className="text-[11px] text-brand-muted font-light uppercase tracking-wider">
                  ({s.name})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation Container */}
      <div className="bg-brand-off-white pt-10 pb-2">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <li>
                <Link href="/" className="hover:text-brand-gold-dark transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold-dark" /></li>
              <li>
                <Link href="/ethical-recruitment" className="hover:text-brand-gold-dark transition-colors">Ethical Recruitment</Link>
              </li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold-dark" /></li>
              <li className="text-brand-gold-dark">{content.subtitle || content.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Redesigned Luxury Editorial Overview Section */}
      <EthicalEditorialOverview
        title={content.missionHeading || `Explore ${content.title}`}
        subtitle={content.overviewSubtitle || "Overview"}
        paragraphs={content.missionText}
      />

      {/* Key Highlights / Features Grid */}
      {content.features && content.features.length > 0 && (
        <section className="py-24 lg:py-32 bg-white text-brand-black relative border-t border-brand-charcoal/10 shadow-inner">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.featuresEyebrow || "The Seven Seas Standard"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.featuresHeading || "Core Institutional Commitments."}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.features.map((feature, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="group h-full border border-brand-charcoal/10 bg-brand-off-white p-8 lg:p-10 hover:border-brand-gold hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between">
                    <div>
                      <div className="text-brand-gold-dark text-4xl font-serif italic mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-2xl font-semibold text-brand-black mb-4 group-hover:text-brand-gold-dark transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-brand-muted leading-relaxed font-light text-sm">
                        {feature.desc}
                      </p>
                    </div>
                    <div className="w-12 h-px bg-brand-gold/40 mt-8 group-hover:w-full group-hover:bg-brand-gold-dark transition-all duration-500" />
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

      {/* Due Diligence Process Timeline Grid */}
      {content.process && content.process.length > 0 && (
        <EthicalProcessTimeline
          eyebrow={content.processEyebrow}
          heading={content.processHeading}
          steps={content.process}
        />
      )}

      {/* FAQ Accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="py-24 lg:py-32 bg-white text-brand-black relative border-t border-brand-charcoal/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.faqsEyebrow || "Honest Answers"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.faqsHeading || "Ethical Recruitment Explained."}
              </h2>
            </div>
            <EthicalFaqAccordion faqs={content.faqs} />
          </div>
        </section>
      )}

      {/* High Impact Closing CTA */}
      <section className="py-24 bg-brand-black text-brand-white relative overflow-hidden">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3 block">
              Ethical Recruitment Guarantee
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4 text-brand-white">
              {content.cta?.heading || "Partner with an agency that prioritises human dignity."}
            </h2>
            <p className="text-lg text-brand-white/80 font-light leading-relaxed">
              {content.cta?.body || "Learn how our transparent recruitment model protects workers and strengthens employer supply chain compliance."}
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              href={content.cta?.buttonHref || "/contact"}
              className="inline-flex items-center gap-3 bg-brand-gold text-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-white transition-colors shadow-xl"
            >
              <span>{content.cta?.buttonLabel || "Contact Ethical Team"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ethical-recruitment"
              className="inline-flex items-center gap-3 border border-brand-white/30 text-brand-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-colors"
            >
              <span>All Ethical Policies</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EthicalEditorialOverview } from "@/components/ethical/EthicalEditorialOverview";
import { EthicalProcessTimeline } from "@/components/ethical/EthicalProcessTimeline";
import { EthicalFaqAccordion } from "@/components/ethical/EthicalFaqAccordion";
import type { PageContent } from "@/lib/content";

export function DynamicPageTemplate({ content }: { content: PageContent }) {
  return (
    <article className="min-h-screen bg-brand-off-white text-brand-black">
      {/* Dynamic Hero */}
      <HeroInternal
        title={content.title}
        subtitle={content.subtitle}
        imageSrc={content.heroImage}
      />

      {/* Overview Section - Centered Layout */}
      <EthicalEditorialOverview
        title={content.missionHeading || `Explore ${content.title}`}
        subtitle={content.overviewSubtitle || "Overview"}
        paragraphs={content.missionText}
      />

      {/* Key Highlights / Features Section */}
      {content.features && content.features.length > 0 && (
        <section className="py-24 lg:py-32 bg-white text-brand-black relative border-t border-brand-charcoal/10 shadow-inner">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.featuresEyebrow || "Key Highlights"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.featuresHeading || "The Seven Seas Standard."}
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

      {/* Dynamic Documents Section */}
      {content.documents && content.documents.length > 0 && (
        <section className="py-24 lg:py-32 bg-brand-off-white relative border-t border-brand-charcoal/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.documentsEyebrow || "Official Records"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.documentsHeading || "Licenses & Certifications."}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.documents.map((doc, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="group cursor-pointer bg-white border border-brand-charcoal/10 p-4 shadow-sm hover:shadow-xl hover:border-brand-gold transition-all duration-300">
                    <div className="relative overflow-hidden mb-4 bg-brand-off-white">
                      <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                        <span className="bg-brand-gold text-brand-black px-6 py-3 text-xs font-semibold tracking-widest uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {content.documentsCtaLabel || "View Document"}
                        </span>
                      </div>
                      <img
                        src={doc.image}
                        alt={doc.title}
                        className="w-full aspect-[3/4] object-cover filter grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-black group-hover:text-brand-gold-dark transition-colors text-center border-t border-brand-charcoal/10 pt-4">
                      {doc.title}
                    </h3>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Section - Centered 4-Step Grid Flow */}
      {content.process && content.process.length > 0 && (
        <EthicalProcessTimeline
          eyebrow={content.processEyebrow || "How We Mobilise Workforce"}
          heading={content.processHeading || "From Requirement to Deployment."}
          steps={content.process}
        />
      )}

      {/* FAQ Section */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="py-24 lg:py-32 bg-white text-brand-black relative border-t border-brand-charcoal/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.faqsEyebrow || "Common Questions"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-6">
                {content.faqsHeading || "Frequently Asked Questions."}
              </h2>
              <div className="w-20 h-1 bg-brand-gold mx-auto" />
            </div>

            <EthicalFaqAccordion faqs={content.faqs} />
          </div>
        </section>
      )}

      {/* Closing CTA Band */}
      {content.cta && (
        <section className="py-24 bg-brand-black text-brand-white relative overflow-hidden">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="max-w-3xl">
              <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3 block">
                Workforce Deployment Proposal
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4 text-brand-white">
                {content.cta.heading}
              </h2>
              <p className="text-lg text-brand-white/80 font-light leading-relaxed">
                {content.cta.body}
              </p>
            </div>
            {content.cta.buttonLabel && content.cta.buttonHref && (
              <div className="shrink-0">
                <Link
                  href={content.cta.buttonHref}
                  className="inline-flex items-center gap-3 bg-brand-gold text-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-white transition-colors shadow-xl"
                >
                  <span>{content.cta.buttonLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}

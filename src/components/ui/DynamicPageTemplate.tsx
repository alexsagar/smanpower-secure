import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EthicalEditorialOverview } from "@/components/ethical/EthicalEditorialOverview";
import { EthicalProcessTimeline } from "@/components/ethical/EthicalProcessTimeline";
import { EthicalFaqAccordion } from "@/components/ethical/EthicalFaqAccordion";
import type { PageContent } from "@/lib/content";
import { PageBreadcrumbs, type Crumb } from "@/components/seo/PageBreadcrumbs";
import { buildFaqSchema } from "@/lib/seo/schema";

export function DynamicPageTemplate({
  content,
  breadcrumbs,
  extraSection,
}: {
  content: PageContent;
  breadcrumbs?: Crumb[];
  /** Optional server-rendered section (e.g. live demands) placed before the process timeline. */
  extraSection?: React.ReactNode;
}) {
  const faqSchema = content.faqs && content.faqs.length > 0 ? buildFaqSchema(content.faqs) : null;
  return (
    <article className="min-h-screen bg-brand-off-white text-brand-black">
      {/* Dynamic Hero */}
      <HeroInternal
        title={content.title}
        subtitle={content.subtitle}
        imageSrc={content.heroImage}
      />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="container-wide mx-auto px-6 lg:px-12 pt-6">
          <PageBreadcrumbs items={breadcrumbs} description={content.subtitle} />
        </div>
      )}

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
              {content.features.map((feature, i) => {
                // Same square card either way; a linked card adds a pointer
                // cursor and a visible keyboard focus ring for accessibility.
                const cardClass =
                  "group h-full border border-brand-charcoal/10 bg-brand-off-white p-8 lg:p-10 hover:border-brand-gold hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between";
                const inner = (
                  <>
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
                  </>
                );
                return (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    {feature.href ? (
                      <Link
                        href={feature.href}
                        className={`${cardClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-brand-off-white`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className={cardClass}>{inner}</div>
                    )}
                  </ScrollReveal>
                );
              })}
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
              {content.documents.map((doc, i) => {
                const href = doc.fileUrl || doc.image || "#";
                return (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    <a
                      href={href}
                      target={href.startsWith("/") || href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group h-full bg-white border border-brand-charcoal/15 p-8 hover:border-brand-gold hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden block"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-xs font-mono font-bold tracking-widest text-brand-gold-dark bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1.5">
                            DOC 0{i + 1}
                          </span>
                          <div className="w-10 h-10 border border-brand-charcoal/10 rounded-full flex items-center justify-center bg-brand-off-white group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-300">
                            <FileText className="w-4 h-4 text-brand-black transition-colors" />
                          </div>
                        </div>

                        <h3 className="text-2xl font-semibold text-brand-black group-hover:text-brand-gold-dark transition-colors leading-snug">
                          {doc.title}
                        </h3>
                      </div>

                      <div className="mt-8 pt-6 border-t border-brand-charcoal/10 flex items-center justify-between text-xs text-brand-muted font-light">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-brand-gold-dark" />
                          Official Record
                        </span>
                        <span className="font-semibold text-brand-gold-dark uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                          View Document <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </a>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contextual Internal Links */}
      {content.links && content.links.length > 0 && (
        <section className="py-24 lg:py-32 bg-white text-brand-black relative border-t border-brand-charcoal/10">
          <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.linksEyebrow || "Explore Further"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.linksHeading || "Related Pages."}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.links.map((link, i) => (
                <ScrollReveal key={i} delay={i * 0.04}>
                  <Link
                    href={link.href}
                    className="group h-full flex flex-col justify-between border border-brand-charcoal/10 bg-brand-off-white p-8 hover:border-brand-gold hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-brand-black mb-3 group-hover:text-brand-gold-dark transition-colors">
                        {link.title}
                      </h3>
                      {link.desc && (
                        <p className="text-brand-muted leading-relaxed font-light text-sm">{link.desc}</p>
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {extraSection}

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
          {/* FAQPage JSON-LD from the exact questions/answers rendered below. */}
          {faqSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
            />
          )}
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
                {content.cta.eyebrow || "Workforce Deployment Proposal"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4 text-brand-white">
                {content.cta.heading}
              </h2>
              <p className="text-lg text-brand-white/80 font-light leading-relaxed">
                {content.cta.body}
              </p>
            </div>
            {content.cta.buttonLabel && content.cta.buttonHref && (
              <div className="shrink-0 flex flex-col sm:flex-row gap-4">
                <Link
                  href={content.cta.buttonHref}
                  className="inline-flex items-center justify-center gap-3 bg-brand-gold text-brand-black px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-white transition-colors shadow-xl"
                >
                  <span>{content.cta.buttonLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {content.cta.secondaryLabel && content.cta.secondaryHref && (
                  <Link
                    href={content.cta.secondaryHref}
                    className="inline-flex items-center justify-center gap-3 border border-brand-white/40 text-brand-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-white hover:text-brand-black transition-colors"
                  >
                    <span>{content.cta.secondaryLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}

import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import Link from "next/link";
import type { PageContent } from "@/lib/content";

export function DynamicPageTemplate({ content }: { content: PageContent }) {
  return (
    <>
      <HeroInternal 
        title={content.title}
        subtitle={content.subtitle}
        imageSrc={content.heroImage}
      />

      <EditorialSection 
        title={content.missionHeading || `Explore ${content.title}`}
        subtitle={content.overviewSubtitle || "Overview"}
      >
        {content.missionText ? (
          content.missionText.map((text, idx) => (
            <p key={idx} className={`leading-relaxed mb-8 font-light tracking-tight ${idx === 0 ? "text-2xl md:text-3xl text-brand-black" : "text-lg text-brand-muted"}`}>
              {text}
            </p>
          ))
        ) : (
          <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
            Detailed information regarding {content.title} will be populated shortly. Seven Seas Intercontinental remains committed to delivering exceptional quality in this area.
          </p>
        )}
      </EditorialSection>

      {/* Dynamic Features Section - Only renders if features exist */}
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
                <div key={i} className="group border border-brand-white/10 bg-brand-white/[0.02] p-10 hover:border-brand-gold/30 hover:bg-brand-white/[0.04] transition-all duration-500">
                  <div className="text-brand-gold text-4xl font-serif italic mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    0{i + 1}
                  </div>
                  <h3 className="card-title text-brand-white mb-4 group-hover:text-brand-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-brand-white/60 leading-relaxed font-light">
                    {feature.desc}
                  </p>
                  <div className="w-12 h-px bg-brand-gold/30 mt-8 group-hover:w-full group-hover:bg-brand-gold transition-all duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Documents Section - Only renders if documents exist */}
      {content.documents && content.documents.length > 0 && (
        <section className="py-24 md:py-32 bg-brand-off-white relative">
          <div className="container-wide mx-auto px-6 lg:px-12">
            <div className="mb-16">
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.documentsEyebrow || "Official Records"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.documentsHeading || "Licenses & Certifications."}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.documents.map((doc, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden border border-brand-charcoal/10 bg-white mb-6 p-2">
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                      <span className="bg-brand-gold text-brand-black px-6 py-3 text-xs font-semibold tracking-widest uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {content.documentsCtaLabel || "View Document"}
                      </span>
                    </div>
                    <img 
                      src={doc.image} 
                      alt={doc.title}
                      className="w-full aspect-[3/4] object-cover filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <h3 className="card-title text-brand-black group-hover:text-brand-gold transition-colors text-center border-b border-brand-charcoal/10 pb-4">
                    {doc.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Section - "Our Process" numbered steps */}
      {content.process && content.process.length > 0 && (
        <section className="py-24 md:py-32 bg-brand-off-white relative">
          <div className="container-wide mx-auto px-6 lg:px-12">
            <div className="mb-16 max-w-3xl">
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.processEyebrow || "How We Work"}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {content.processHeading || "Our Process."}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-charcoal/10 border border-brand-charcoal/10">
              {content.process.map((step, i) => (
                <div key={step.title} className="bg-brand-off-white p-8 md:p-10 group">
                  <span className="text-brand-gold/50 text-sm font-semibold tabular-nums group-hover:text-brand-gold transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl md:text-2xl font-light tracking-tight text-brand-black mt-3 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-brand-charcoal/70 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
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

            <dl className="max-w-4xl divide-y divide-brand-white/10 border-t border-brand-white/10">
              {content.faqs.map((faq) => (
                <div key={faq.q} className="py-8 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 md:gap-12">
                  <dt className="text-lg md:text-xl font-light text-brand-white leading-snug">
                    {faq.q}
                  </dt>
                  <dd className="text-brand-white/60 leading-relaxed font-light">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Closing CTA Band */}
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

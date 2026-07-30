import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Story | Seven Seas Intercontinental",
  description: "The history and journey of Seven Seas Intercontinental.",
};

export default async function OurStoryPage() {
  const copy = await getPageCopy("about/our-story");

  return (
    <>
      <HeroInternal 
        title={copy.hero.title} 
        subtitle={copy.hero.subtitle}
        imageSrc={copy.hero.imageSrc}
      />

      {!copy.hiddenSections.beginning && (
      <EditorialSection
        title={copy.beginning.title}
        subtitle={copy.beginning.subtitle}
      >
        <div className="relative mb-12">
          <div className="absolute -top-10 -left-6 text-brand-gold/10 text-9xl font-serif pointer-events-none leading-none">
            &ldquo;
          </div>
          <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight relative z-10">
            {copy.beginning.lead}
          </p>
        </div>
        <p className="text-lg text-brand-muted leading-relaxed mb-8">
          {copy.beginning.paragraphs[0]}
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          {copy.beginning.paragraphs[1]}
        </p>
      </EditorialSection>
      )}

      {/* Full Bleed Image Break */}
      {!copy.hiddenSections.quote && (
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/trade_test_centre_1782920400836.png')] bg-cover bg-center bg-fixed bg-no-repeat" />
        <div className="absolute inset-0 bg-brand-black/60" />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-white tracking-tighter max-w-4xl mx-auto leading-tight">
              {copy.quote.text}
            </h2>
            <div className="w-24 h-px bg-brand-gold mx-auto mt-12" />
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* The Timeline Section */}
      {!copy.hiddenSections.timeline && (
      <section className="py-24 md:py-32 bg-brand-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                {copy.timeline.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {copy.timeline.heading}
              </h2>
            </ScrollReveal>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-charcoal/10 -translate-x-1/2 hidden md:block" />

            <div className="space-y-16 md:space-y-32">
              {copy.timeline.milestones.map((item, i) => (
                <ScrollReveal key={item.year} delay={0.2} className="relative z-10">
                  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    
                    {/* Content Half */}
                    <div className={`w-full md:w-1/2 flex flex-col ${i % 2 === 0 ? "md:items-start md:text-left" : "md:items-end md:text-right"}`}>
                      <div className="text-6xl lg:text-8xl font-bold text-brand-charcoal/5 tracking-tighter -mb-6 relative z-0">
                        {item.year}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-semibold text-brand-black mb-4 relative z-10">
                        {item.title}
                      </h3>
                      <p className="text-lg text-brand-muted leading-relaxed max-w-md relative z-10">
                        {item.desc}
                      </p>
                    </div>

                    {/* Center Dot */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-white border-2 border-brand-gold rounded-full items-center justify-center z-20">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                    </div>

                    {/* Empty Half */}
                    <div className="hidden md:block w-1/2" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Dark Philosophy Section */}
      {!copy.hiddenSections.philosophy && (
      <section className="py-24 md:py-32 bg-brand-black text-brand-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 blur-[100px] pointer-events-none" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] mb-8">
                {copy.philosophy.headingLead} <br/>
                <span className="text-brand-gold text-3xl md:text-5xl italic font-serif">{copy.philosophy.headingHighlight}</span>
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-brand-gold to-transparent mb-8" />
            </ScrollReveal>
          </div>
          <div className="md:w-1/2">
            <ScrollReveal delay={0.2}>
              <p className="text-xl leading-relaxed text-brand-white/80 font-light mb-6">
                {copy.philosophy.lead}
              </p>
              <p className="text-lg leading-relaxed text-brand-white/60">
                {copy.philosophy.body}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
      )}
    </>
  );
}

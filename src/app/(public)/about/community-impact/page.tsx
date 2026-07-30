import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Heart, BookOpen, Home, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Impact | Seven Seas Intercontinental",
  description: "Learn how Seven Seas Intercontinental positively impacts local communities across Nepal.",
};

const PILLAR_ICONS = [
  <TrendingUp className="w-10 h-10" key="trending" />,
  <BookOpen className="w-10 h-10" key="book" />,
  <Heart className="w-10 h-10" key="heart" />,
  <Home className="w-10 h-10" key="home" />,
];

export default async function CommunityImpactPage() {
  const copy = await getPageCopy("about/community-impact");

  return (
    <>
      <HeroInternal 
        title={copy.hero.title} 
        subtitle={copy.hero.subtitle}
        imageSrc={copy.hero.imageSrc}
      />

      {!copy.hiddenSections.intro && (
      <EditorialSection
        title={copy.intro.title}
        subtitle={copy.intro.subtitle}
      >
        <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
          {copy.intro.lead}
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          {copy.intro.paragraphs[0]}
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          {copy.intro.paragraphs[1]}
        </p>
      </EditorialSection>
      )}

      {/* Stats Banner */}
      {!copy.hiddenSections.stats && (
      <section className="py-16 md:py-24 bg-brand-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-brand-black/10">
            {copy.stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-6xl font-bold text-brand-black tracking-tighter mb-4">
                    {stat.number}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-widest text-brand-black/80">
                    {stat.label}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Pillars Grid */}
      {!copy.hiddenSections.pillars && (
      <section className="py-24 md:py-32 bg-brand-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20 text-center">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                {copy.pillars.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {copy.pillars.headingLine1}<br/>{copy.pillars.headingLine2}
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 lg:gap-y-24">
            {copy.pillars.items.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 0.15}>
                <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="w-20 h-20 shrink-0 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-white transition-colors duration-500">
                    {PILLAR_ICONS[i] ?? PILLAR_ICONS[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-brand-black mb-4 group-hover:text-brand-gold transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-brand-muted leading-relaxed text-lg">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Full Bleed Dark Break */}
      {!copy.hiddenSections.returning && (
      <section className="relative h-[70vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/corporate_office_interview_1782920412325.png')] bg-cover bg-center bg-fixed bg-no-repeat grayscale opacity-30" />
        <div className="absolute inset-0 bg-brand-black/80" />
        
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16">
          <div className="md:w-1/2">
            <ScrollReveal>
              <div className="w-16 h-px bg-brand-gold mb-8" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter leading-tight mb-8">
                {copy.returning.headingLead}<br/>
                <span className="text-brand-gold font-serif italic">{copy.returning.headingHighlight}</span>
              </h2>
              <p className="text-xl text-brand-white/80 leading-relaxed font-light">
                {copy.returning.lead}
              </p>
            </ScrollReveal>
          </div>
          <div className="md:w-1/2 flex items-center">
            <ScrollReveal delay={0.2}>
              <p className="text-lg text-brand-white/60 leading-relaxed pl-0 md:pl-12 md:border-l border-brand-white/10">
                {copy.returning.body}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Quote, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTeamMembers } from "@/repositories/content-resolver";
import { listLeadershipMembers } from "@/lib/team-members";
import { getPageCopy, getPageCopyImage } from "@/services/page-copy.service";
import { LeadershipSection } from "@/components/leadership/LeadershipSection";

export const metadata: Metadata = buildPageMetadata({
  title: "Leadership | Seven Seas Intercontinental",
  description: "Meet the executive leadership team behind Seven Seas Intercontinental.",
  path: "/about/leadership",
});

export default async function LeadershipPage() {
  const leaders = listLeadershipMembers(await getTeamMembers());
  const copy = await getPageCopy("about/leadership");
  const accountabilityImage = await getPageCopyImage("about/leadership");

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
          {copy.intro.body}
        </p>
      </EditorialSection>
      )}

      {/* Chairman's Message - Full Bleed Quote */}
      {!copy.hiddenSections.chairmanQuote && (
      <section className="py-24 md:py-32 bg-brand-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-black/40 z-0" />
        <div className="absolute -top-32 -right-32 text-brand-gold/10 z-0 rotate-12">
          <Quote size={400} />
        </div>
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
          <ScrollReveal>
            <Quote className="w-16 h-16 text-brand-white mb-10 mx-auto" />
            <h2 className="text-3xl md:text-5xl text-brand-white lg:text-6xl font-light tracking-tight leading-tight max-w-5xl mx-auto mb-12">
              {copy.chairmanQuote.quote}
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-brand-gold mb-6" />
              <p className="text-xl font-semibold uppercase tracking-widest text-brand-gold">{copy.chairmanQuote.attribution}</p>
              <p className="text-brand-white/60 mt-2">{copy.chairmanQuote.organisation}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* Board of Directors / Leadership Section */}
      {!copy.hiddenSections.board && (
        <LeadershipSection
          leaders={leaders}
          eyebrow={copy.board.eyebrow}
          heading={copy.board.heading}
          description={copy.board.description}
          emptyState={copy.board.emptyState}
        />
      )}

      {/* Leadership Philosophy */}
      {!copy.hiddenSections.accountability && (
      <section className="py-24 md:py-32 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16 lg:gap-24 items-center">
          <div className="md:w-1/2">
            <ScrollReveal>
              <div className="relative h-[500px] w-full">
                <div className="absolute inset-4 border border-brand-gold/30 z-20 pointer-events-none" />
                <Image
                  src={accountabilityImage?.secureUrl ?? "/images/hero_training_orientation_1782920391505.png"}
                  alt={accountabilityImage?.altText || "Leadership Philosophy"}
                  fill
                  className="object-cover z-10 grayscale"
                />
              </div>
            </ScrollReveal>
          </div>
          <div className="md:w-1/2">
            <ScrollReveal delay={0.2}>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-6 block">
                {copy.accountability.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl text-brand-white font-semibold tracking-tighter leading-[1.1] mb-8">
                {copy.accountability.heading}
              </h2>
              <p className="text-xl text-brand-white/80 leading-relaxed font-light mb-6">
                {copy.accountability.lead}
              </p>
              <p className="text-lg text-brand-white/60 leading-relaxed mb-10">
                {copy.accountability.body}
              </p>

              <div className="flex items-center gap-4 border-l-2 border-brand-gold pl-6">
                <div className="w-12 h-12 rounded-full border border-brand-gold flex items-center justify-center text-brand-gold font-serif italic text-xl">
                  R
                </div>
                <div>
                  <p className="text-sm font-bold tracking-widest uppercase">{copy.accountability.badgeTitle}</p>
                  <p className="text-xs text-brand-white/50">{copy.accountability.badgeSubtitle}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      )}

      {/* Team & People Callout */}
      <section className="py-16 bg-brand-sand border-t border-brand-charcoal/10">
        <div className="container-wide mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-2 block">
              The Dedicated Team
            </span>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-black tracking-tight">
              Meet the specialists delivering on our commitments.
            </h3>
            <p className="text-brand-muted mt-2 max-w-xl">
              From recruitment officers and trade test evaluators to welfare coordinators, our wider team brings our leadership vision to life.
            </p>
          </div>
          <Link
            href="/about/our-people"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-brand-charcoal text-white hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-xs font-semibold uppercase tracking-widest shrink-0"
          >
            <span>Meet Our People</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Quote } from "lucide-react";
import Image from "next/image";
import { getTeamMembers } from "@/repositories/content-resolver";
import { listLeadershipMembers } from "@/lib/team-members";
import { getPageCopy, getPageCopyImage } from "@/services/page-copy.service";

export const metadata: Metadata = {
  title: "Leadership | Seven Seas Intercontinental",
  description: "Meet the executive leadership team behind Seven Seas Intercontinental.",
};

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

      {/* Chairman's Message - Full Bleed Quote */}
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

      {/* Board of Directors Grid */}
      <section className="py-24 md:py-32 bg-brand-white">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {/* Centered Board Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
            <ScrollReveal>
              <div className="inline-flex items-center justify-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 mb-6 border border-brand-gold/30">
                <span>{copy.board.eyebrow}</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black">
                {copy.board.heading}
              </h2>
            </ScrollReveal>
          </div>

          {leaders.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
              {leaders.map((leader, i) => (
                <ScrollReveal key={leader.id} delay={i * 0.15} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm group">
                  <div className="bg-brand-off-white border border-brand-black/15 p-6 hover:shadow-2xl hover:border-brand-gold transition-all duration-500 flex flex-col justify-between h-full">
                    <div>
                      <div className="relative aspect-[3/4] overflow-hidden bg-brand-charcoal border-2 border-brand-black mb-6 shadow-md">
                        {leader.photo?.secureUrl ? (
                          <Image
                            src={leader.photo.secureUrl}
                            alt={leader.photoAltText || leader.photo.altText || leader.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-charcoal flex items-center justify-center text-brand-muted text-xs uppercase font-mono">
                            No Photo
                          </div>
                        )}
                        <div className="absolute inset-0 border border-brand-gold/0 group-hover:border-brand-gold/40 transition-colors duration-500 pointer-events-none" />
                      </div>

                      <div className="text-center">
                        <h3 className="font-serif text-2xl font-normal text-brand-black group-hover:text-brand-gold transition-colors duration-300 mb-1">
                          {leader.name}
                        </h3>
                        <p className="text-xs font-mono font-bold tracking-widest uppercase text-brand-gold mb-4">
                          {leader.designation}
                        </p>
                        {leader.bio ? (
                          <p className="text-xs leading-relaxed text-brand-charcoal/80 font-sans border-t border-brand-black/10 pt-4">
                            {leader.bio}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="h-0.5 w-0 bg-brand-gold mt-6 group-hover:w-full transition-all duration-500 ease-out mx-auto" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-muted font-sans">{copy.board.emptyState}</p>
          )}
        </div>
      </section>

      {/* Leadership Philosophy */}
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
    </>
  );
}

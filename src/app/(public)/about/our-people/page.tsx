import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Image from "next/image";
import { getTeamMembers } from "@/repositories/content-resolver";
import { listPeopleMembers } from "@/lib/team-members";

export const metadata: Metadata = {
  title: "Our People | Seven Seas Intercontinental",
  description: "Meet the dedicated team that drives ethical recruitment at Seven Seas Intercontinental.",
};

export default async function OurPeoplePage() {
  const copy = await getPageCopy("about/our-people");
  const people = listPeopleMembers(await getTeamMembers());

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

      {/* Departments Grid */}
      {!copy.hiddenSections.departments && (
      <section className="py-24 md:py-32 bg-brand-charcoal/5 relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20 text-center">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                {copy.departments.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                {copy.departments.heading}
              </h2>
              <div className="w-20 h-px bg-brand-gold mx-auto mt-8" />
            </ScrollReveal>
          </div>

          {people.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {people.map((member, i) => (
                <ScrollReveal key={member.id} delay={i * 0.1}>
                  <div className="group bg-brand-white border border-brand-charcoal/10 p-8 h-full hover:border-brand-gold/50 transition-colors duration-500 flex gap-6 items-start">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-brand-charcoal/5">
                      {member.photo?.secureUrl ? (
                        <Image
                          src={member.photo.secureUrl}
                          alt={member.photoAltText || member.photo.altText || member.name}
                          fill
                          className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-brand-black mb-2">{member.name}</h3>
                      <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">{member.designation}</p>
                      {member.department ? <p className="mt-2 text-sm text-brand-muted">{member.department}</p> : null}
                      {member.bio ? <p className="mt-4 text-brand-muted leading-relaxed">{member.bio}</p> : null}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-muted">{copy.departments.emptyState}</p>
          )}
        </div>
      </section>
      )}

      {/* Full Bleed Image Break */}
      {!copy.hiddenSections.band && (
      <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/trade_test_centre_1782920400836.png')] bg-cover bg-center bg-fixed bg-no-repeat grayscale" />
        <div className="absolute inset-0 bg-brand-gold/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-brand-black/70" />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-widest uppercase max-w-4xl mx-auto leading-tight">
              {copy.bandHeadingLead}<span className="font-semibold text-brand-gold">{copy.bandHeadingHighlight}</span>
            </h2>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* Culture of Excellence - Dark */}
      {!copy.hiddenSections.culture && (
      <section className="py-24 md:py-32 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-gold/10 to-transparent pointer-events-none" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
            <div className="md:w-5/12">
              <ScrollReveal>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] mb-8 text-brand-white">
                  {copy.culture.headingLead}<br/>
                  <span className="text-brand-gold italic font-serif">{copy.culture.headingHighlight}</span>
                </h2>
                <div className="w-24 h-px bg-brand-gold mb-8" />
                <p className="text-xl leading-relaxed text-brand-white/80 font-light">
                  {copy.culture.lead}
                </p>
              </ScrollReveal>
            </div>
            
            <div className="md:w-7/12 flex flex-col justify-center space-y-12">
              <ScrollReveal delay={0.2}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">01</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">{copy.culture.items[0].title}</h4>
                    <p className="text-brand-white/60 leading-relaxed">{copy.culture.items[0].desc}</p>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">02</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">{copy.culture.items[1].title}</h4>
                    <p className="text-brand-white/60 leading-relaxed">{copy.culture.items[1].desc}</p>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.4}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">03</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">{copy.culture.items[2].title}</h4>
                    <p className="text-brand-white/60 leading-relaxed">{copy.culture.items[2].desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  );
}

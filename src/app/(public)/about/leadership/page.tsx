import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Quote } from "lucide-react";
import Image from "next/image";
import { getTeamMembers } from "@/repositories/content-resolver";
import { listLeadershipMembers } from "@/lib/team-members";

export const metadata: Metadata = {
  title: "Leadership | Seven Seas Intercontinental",
  description: "Meet the executive leadership team behind Seven Seas Intercontinental.",
};

export default async function LeadershipPage() {
  const leaders = listLeadershipMembers(await getTeamMembers());

  return (
    <>
      <HeroInternal
        title="Guided by Experience."
        subtitle="Our Leadership"
        imageSrc="/images/corporate_office_interview_1782920412325.png"
      />

      <EditorialSection
        title="Commitment from the Top Down."
        subtitle="Executive Team"
      >
        <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
          Ethical recruitment is not just a policy; it requires active leadership, continuous oversight, and an unwavering commitment to doing the right thing.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Our executive team brings decades of combined experience in international labor laws, cross-border deployment logistics, and human rights advocacy. They lead by example, ensuring that our zero-tolerance policy against exploitation is enforced at every level of the organization, from our sourcing partners in remote villages to our corporate offices in Kathmandu.
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
              "We have built Seven Seas on a foundation of transparency. When an employer partners with us, they should be able to expect clear processes and accountable conduct."
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-brand-gold mb-6" />
              <p className="text-xl font-semibold uppercase tracking-widest text-brand-gold">Chairman & Founder</p>
              <p className="text-brand-white/60 mt-2">Seven Seas Intercontinental</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Board of Directors Grid */}
      <section className="py-24 md:py-32 bg-brand-white">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20 md:mb-32">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                The Board
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] text-brand-black max-w-2xl">
                Meet the Directors.
              </h2>
            </ScrollReveal>
          </div>

          {leaders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {leaders.map((leader, i) => (
                <ScrollReveal key={leader.id} delay={i * 0.15}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-charcoal/5 mb-6">
                      {leader.photo?.secureUrl ? (
                        <Image
                          src={leader.photo.secureUrl}
                          alt={leader.photoAltText || leader.photo.altText || leader.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80 grayscale group-hover:grayscale-0"
                        />
                      ) : null}
                      <div className="absolute inset-0 border border-brand-gold/0 group-hover:border-brand-gold/30 transition-colors duration-500 z-10" />
                    </div>

                    <div className="relative">
                      <h3 className="text-2xl font-semibold text-brand-black tracking-tight mb-1 group-hover:text-brand-gold transition-colors duration-300">
                        {leader.name}
                      </h3>
                      <p className="text-sm font-semibold tracking-widest uppercase text-brand-muted">
                        {leader.designation}
                      </p>
                      {leader.bio ? <p className="mt-4 text-sm leading-relaxed text-brand-muted">{leader.bio}</p> : null}
                      <div className="h-px w-0 bg-brand-gold mt-4 group-hover:w-full transition-all duration-700 ease-out" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted">Leadership profiles are being updated.</p>
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
                  src="/images/hero_training_orientation_1782920391505.png"
                  alt="Leadership Philosophy"
                  fill
                  className="object-cover z-10 grayscale"
                />
              </div>
            </ScrollReveal>
          </div>
          <div className="md:w-1/2">
            <ScrollReveal delay={0.2}>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-6 block">
                Our Core Belief
              </span>
              <h2 className="text-4xl md:text-5xl text-brand-white font-semibold tracking-tighter leading-[1.1] mb-8">
                Accountability at the highest level.
              </h2>
              <p className="text-xl text-brand-white/80 leading-relaxed font-light mb-6">
                We believe that ethical compliance cannot be outsourced or delegated. It must be woven into the fabric of the organization starting from the board room.
              </p>
              <p className="text-lg text-brand-white/60 leading-relaxed mb-10">
                Our directors are deeply involved in the daily operations of our sourcing networks, training centers, and deployment pipelines. By maintaining a hands-on approach, we ensure that our promises of transparency and zero-fees are not just marketing slogans, but operational realities.
              </p>

              <div className="flex items-center gap-4 border-l-2 border-brand-gold pl-6">
                <div className="w-12 h-12 rounded-full border border-brand-gold flex items-center justify-center text-brand-gold font-serif italic text-xl">
                  R
                </div>
                <div>
                  <p className="text-sm font-bold tracking-widest uppercase">RBA-Aligned</p>
                  <p className="text-xs text-brand-white/50">Executive leadership training context</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

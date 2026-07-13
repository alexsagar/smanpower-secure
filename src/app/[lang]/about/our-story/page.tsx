import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Story | Seven Seas Intercontinental",
  description: "The history and journey of Seven Seas Intercontinental.",
};

export default async function OurStoryPage() {
  const milestones = [
    { year: "2008", title: "The Foundation", desc: "Seven Seas Intercontinental is established in Kathmandu with a vision to revolutionize the recruitment landscape by removing exploitative fees." },
    { year: "2013", title: "Middle East Expansion", desc: "Opened our first coordination offices in Dubai and Doha to ensure on-the-ground support and grievance handling for our deployed workers." },
    { year: "2018", title: "RBA Alignment", desc: "Expanded internal processes around Responsible Business Alliance (RBA) guidance and employer-paid recruitment practices." },
    { year: "2023", title: "Operational Expansion", desc: "Continued investing in training capacity, documentation workflows, and worker-support processes." },
  ];

  return (
    <>
      <HeroInternal 
        title="From Nepal to the World." 
        subtitle="Our Story"
        imageSrc="/images/hero_training_orientation_1782920391505.png"
      />

      <EditorialSection 
        title="A Journey of Integrity."
        subtitle="The Beginning"
      >
        <div className="relative mb-12">
          <div className="absolute -top-10 -left-6 text-brand-gold/10 text-9xl font-serif pointer-events-none leading-none">
            &ldquo;
          </div>
          <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight relative z-10">
            Seven Seas Intercontinental was founded on a singular belief: international recruitment does not have to be exploitative. 
          </p>
        </div>
        <p className="text-lg text-brand-muted leading-relaxed mb-8">
          Over the past 15+ years, we have grown from a small local agency into an ethical recruitment business focused on transparent processes. We recognized early on that the traditional recruitment model was broken — candidates were often burdened with debt, and employers were receiving underprepared workers.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          We rebuilt the model from the ground up. By pioneering the employer-paid model in Nepal and establishing world-class trade testing facilities, we proved that ethical recruitment is not just the right thing to do — it is the best way to do business.
        </p>
      </EditorialSection>

      {/* Full Bleed Image Break */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/trade_test_centre_1782920400836.png')] bg-cover bg-center bg-fixed bg-no-repeat" />
        <div className="absolute inset-0 bg-brand-black/60" />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-white tracking-tighter max-w-4xl mx-auto leading-tight">
              "We don't just find workers. We build global careers."
            </h2>
            <div className="w-24 h-px bg-brand-gold mx-auto mt-12" />
          </ScrollReveal>
        </div>
      </section>

      {/* The Timeline Section */}
      <section className="py-24 md:py-32 bg-brand-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                The History
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                Our Evolution.
              </h2>
            </ScrollReveal>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-charcoal/10 -translate-x-1/2 hidden md:block" />

            <div className="space-y-16 md:space-y-32">
              {milestones.map((item, i) => (
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

      {/* Dark Philosophy Section */}
      <section className="py-24 md:py-32 bg-brand-black text-brand-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 blur-[100px] pointer-events-none" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] mb-8">
                The Philosophy <br/>
                <span className="text-brand-gold text-3xl md:text-5xl italic font-serif">That Drives Us.</span>
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-brand-gold to-transparent mb-8" />
            </ScrollReveal>
          </div>
          <div className="md:w-1/2">
            <ScrollReveal delay={0.2}>
              <p className="text-xl leading-relaxed text-brand-white/80 font-light mb-6">
                We measure our success not just by the number of workers we deploy, but by the generational impact those deployments have on their families back home.
              </p>
              <p className="text-lg leading-relaxed text-brand-white/60">
                Ethical recruitment is the cornerstone of sustainable business. When candidates are treated fairly and employers receive trained, motivated talent, the entire global economy benefits. This philosophy is deeply ingrained in every operation at Seven Seas.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

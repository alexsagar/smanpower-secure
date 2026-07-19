import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Image from "next/image";
import { Users, GraduationCap, PlaneTakeoff, HeartPulse } from "lucide-react";

export const metadata: Metadata = {
  title: "Our People | Seven Seas Intercontinental",
  description: "Meet the dedicated team that drives ethical recruitment at Seven Seas Intercontinental.",
};

export default async function OurPeoplePage() {
  const departments = [
    { title: "Sourcing & Outreach", desc: "Our field experts operate deep within local communities across Nepal, ensuring talent is identified ethically and without intermediaries.", icon: <Users className="w-8 h-8" /> },
    { title: "Trade & Training", desc: "Industry veterans and master trainers who ensure every candidate is technically and culturally prepared for their overseas role.", icon: <GraduationCap className="w-8 h-8" /> },
    { title: "Deployment Logistics", desc: "Meticulous coordinators managing visas, flights, and documentation to support a smooth transition for workers.", icon: <PlaneTakeoff className="w-8 h-8" /> },
    { title: "Welfare & Grievance", desc: "A dedicated support team operating 24/7 to ensure deployed workers have an immediate lifeline in case of any issues.", icon: <HeartPulse className="w-8 h-8" /> },
  ];

  return (
    <>
      <HeroInternal 
        title="The Heart of Seven Seas." 
        subtitle="Our People"
        imageSrc="/images/hero_training_orientation_1782920391505.png"
      />

      <EditorialSection 
        title="Powered by Passion."
        subtitle="Our Team"
      >
        <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
          Behind every successful deployment is a team of over 150 dedicated professionals working tirelessly across Nepal and the Middle East.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Ethical recruitment requires more than just good intentions—it requires incredible logistical precision and deep human empathy. Our staff comprises former expatriate workers, legal experts, certified trainers, and logistics specialists who understand the migration journey firsthand.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          We invest heavily in the continuous training of our own people, ensuring that every team member is fully versed in RBA guidelines, international labor laws, and modern human resources practices.
        </p>
      </EditorialSection>

      {/* Departments Grid */}
      <section className="py-24 md:py-32 bg-brand-charcoal/5 relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20 text-center">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                The Engine
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                The People Behind the Process.
              </h2>
              <div className="w-20 h-px bg-brand-gold mx-auto mt-8" />
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept, i) => (
              <ScrollReveal key={dept.title} delay={i * 0.1}>
                <div className="group bg-brand-white border border-brand-charcoal/10 p-12 h-full hover:border-brand-gold/50 transition-colors duration-500 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-gold mb-8 group-hover:bg-brand-gold group-hover:text-brand-white transition-colors duration-500">
                    {dept.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-black mb-4">
                    {dept.title}
                  </h3>
                  <p className="text-brand-muted leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Full Bleed Image Break */}
      <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/trade_test_centre_1782920400836.png')] bg-cover bg-center bg-fixed bg-no-repeat grayscale" />
        <div className="absolute inset-0 bg-brand-gold/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-brand-black/70" />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-widest uppercase max-w-4xl mx-auto leading-tight">
              One Team. <span className="font-semibold text-brand-gold">One Mission.</span>
            </h2>
          </ScrollReveal>
        </div>
      </section>

      {/* Culture of Excellence - Dark */}
      <section className="py-24 md:py-32 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-gold/10 to-transparent pointer-events-none" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
            <div className="md:w-5/12">
              <ScrollReveal>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] mb-8 text-brand-white">
                  A Culture of <br/>
                  <span className="text-brand-gold italic font-serif">Excellence.</span>
                </h2>
                <div className="w-24 h-px bg-brand-gold mb-8" />
                <p className="text-xl leading-relaxed text-brand-white/80 font-light">
                  We don't just demand high standards from the candidates we deploy; we demand it from ourselves.
                </p>
              </ScrollReveal>
            </div>
            
            <div className="md:w-7/12 flex flex-col justify-center space-y-12">
              <ScrollReveal delay={0.2}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">01</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">Continuous Learning</h4>
                    <p className="text-brand-white/60 leading-relaxed">Our staff undergoes rigorous monthly training to stay updated on the latest compliance protocols and international labor laws.</p>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">02</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">Zero-Tolerance Policy</h4>
                    <p className="text-brand-white/60 leading-relaxed">Every employee signs a strict ethical compliance agreement. Any breach of our zero-fee policy results in immediate termination.</p>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.4}>
                <div className="flex gap-6">
                  <div className="text-brand-gold text-4xl font-bold font-serif italic">03</div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-3">Empathy First</h4>
                    <p className="text-brand-white/60 leading-relaxed">We treat every candidate exactly how we would want our own family members treated if they were moving abroad for work.</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

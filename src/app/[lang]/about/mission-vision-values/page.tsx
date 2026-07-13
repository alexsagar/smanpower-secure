import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Target, Globe, Shield, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Mission, Vision & Values | Seven Seas Intercontinental",
  description: "Discover our driving mission and the core values that shape our ethical recruitment practices at Seven Seas Intercontinental.",
};

export default async function MissionVisionPage() {
  return (
    <>
      <HeroInternal 
        title="Purpose-Driven Recruitment." 
        subtitle="Mission & Vision"
        imageSrc="/images/corporate_office_interview_1782920412325.png"
      />

      <EditorialSection 
        title="Our Vision for the Future of Work."
        subtitle="The Vision"
      >
        <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
          To be the most trusted, transparent, and ethical bridge between Nepal's highly capable workforce and global employment opportunities.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          We envision a future where international recruitment is universally safe, employer-paid, and free from exploitation. By setting the gold standard in Nepal for responsible recruitment, we aim to elevate the dignity of Nepali workers on the global stage while providing our international partners with unparalleled talent.
        </p>
      </EditorialSection>

      <section className="py-24 bg-brand-gold relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
          <ScrollReveal>
            <span className="text-brand-black text-[10px] font-semibold tracking-[0.3em] uppercase mb-6 block">
              The Mission
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] text-brand-black max-w-4xl mx-auto mb-10">
              Connecting Potential with Opportunity, Responsibly.
            </h2>
            <p className="text-xl text-brand-black/80 max-w-2xl mx-auto leading-relaxed">
              Our mission is to consistently deliver exceptional, deployment-ready talent to global employers while fiercely protecting the rights, dignity, and financial well-being of every candidate we represent.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Next-Level Core Values Section */}
      <section className="py-24 md:py-32 bg-brand-black relative overflow-hidden text-brand-white">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                The Principles
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] mb-6 text-brand-white">
                Our Foundational Values.
              </h2>
              <div className="h-20 w-px bg-gradient-to-b from-brand-gold to-transparent mx-auto" />
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Ethical Integrity",
                desc: "We strictly adhere to RBA guidelines and employer-paid principles. Zero recruitment fees to candidates, ensuring no one falls into debt bondage.",
                icon: <Shield className="w-10 h-10" />
              },
              {
                step: "02",
                title: "Radical Transparency",
                desc: "Clear communication with both employers and candidates. No hidden fees, no false promises, just documented reality at every single stage.",
                icon: <Globe className="w-10 h-10" />
              },
              {
                step: "03",
                title: "Excellence in Preparation",
                desc: "Through our dedicated trade testing and training centres, we ensure every worker is culturally and technically ready before deployment.",
                icon: <Target className="w-10 h-10" />
              },
              {
                step: "04",
                title: "Human Dignity",
                desc: "We treat every candidate with profound respect. Their success is our success, and their welfare is our absolute highest priority.",
                icon: <HeartHandshake className="w-10 h-10" />
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.15} className="group relative h-full">
                {/* Massive background number */}
                <div className="absolute -right-4 -top-8 text-[180px] font-bold text-white/[0.02] tracking-tighter pointer-events-none group-hover:text-brand-gold/[0.05] transition-colors duration-700">
                  {item.step}
                </div>
                
                <div className="bg-brand-white/[0.02] border border-brand-white/[0.05] hover:border-brand-gold/30 hover:bg-brand-white/[0.04] transition-all duration-500 p-10 md:p-12 h-full flex flex-col relative z-10 overflow-hidden backdrop-blur-sm">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="text-brand-gold mb-12 group-hover:scale-110 transition-transform duration-500 origin-left">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-semibold text-brand-white mb-6 tracking-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-brand-white/60 leading-relaxed font-light text-lg flex-1">
                    {item.desc}
                  </p>
                  
                  <div className="w-12 h-px bg-brand-gold/30 mt-10 group-hover:w-full group-hover:bg-brand-gold transition-all duration-700" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

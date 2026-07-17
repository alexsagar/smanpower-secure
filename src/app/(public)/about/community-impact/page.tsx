import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Heart, BookOpen, Home, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Impact | Seven Seas Intercontinental",
  description: "Learn how Seven Seas Intercontinental positively impacts local communities across Nepal.",
};

export default async function CommunityImpactPage() {
  const impactPillars = [
    { title: "Economic Independence", desc: "By enforcing zero-fee recruitment, workers retain 100% of their earnings, instantly pulling their families into the middle class.", icon: <TrendingUp className="w-10 h-10" /> },
    { title: "Education Access", desc: "Remittances generated through our safe deployment channels fund the education of thousands of children in rural Nepal every year.", icon: <BookOpen className="w-10 h-10" /> },
    { title: "Healthcare Funding", desc: "Families of deployed workers can afford better medical care, significantly improving the life expectancy and health outcomes of their communities.", icon: <Heart className="w-10 h-10" /> },
    { title: "Local Infrastructure", desc: "Returning workers invest their savings into local businesses, housing, and community infrastructure, creating secondary job markets.", icon: <Home className="w-10 h-10" /> },
  ];

  const stats = [
    { number: "50k+", label: "Workers Deployed Safely" },
    { number: "100%", label: "Zero-Fee Compliance" },
    { number: "7", label: "Provinces Reached" },
    { number: "$10M+", label: "Est. Annual Remittance Impact" },
  ];

  return (
    <>
      <HeroInternal 
        title="Uplifting Communities." 
        subtitle="Our Impact"
        imageSrc="/images/hero_training_orientation_1782920391505.png"
      />

      <EditorialSection 
        title="More Than Just Jobs."
        subtitle="Community Empowerment"
      >
        <p className="text-2xl md:text-3xl leading-relaxed text-brand-black mb-12 font-light tracking-tight">
          When we secure a safe, employer-paid international job for a Nepali worker, we are not just changing their life — we are uplifting their entire community.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Remittances are the backbone of Nepal's economy. By ensuring that our workers do not have to pay exorbitant recruitment fees, they are able to send 100% of their savings back home from day one. This money goes directly into local communities, funding education, healthcare, and infrastructure across all seven provinces.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Through ethical recruitment, we turn international labor migration from a cycle of debt into an engine for sustainable national development.
        </p>
      </EditorialSection>

      {/* Stats Banner */}
      <section className="py-16 md:py-24 bg-brand-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-brand-black/10">
            {stats.map((stat, i) => (
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

      {/* Pillars Grid */}
      <section className="py-24 md:py-32 bg-brand-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="mb-20 text-center">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                The Ripple Effect
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black">
                How Ethical Recruitment <br/>Transforms Nepal.
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 lg:gap-y-24">
            {impactPillars.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 0.15}>
                <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="w-20 h-20 shrink-0 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-white transition-colors duration-500">
                    {pillar.icon}
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

      {/* Full Bleed Dark Break */}
      <section className="relative h-[70vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/corporate_office_interview_1782920412325.png')] bg-cover bg-center bg-fixed bg-no-repeat grayscale opacity-30" />
        <div className="absolute inset-0 bg-brand-black/80" />
        
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16">
          <div className="md:w-1/2">
            <ScrollReveal>
              <div className="w-16 h-px bg-brand-gold mb-8" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter leading-tight mb-8">
                Returning with <br/>
                <span className="text-brand-gold font-serif italic">More Than Capital.</span>
              </h2>
              <p className="text-xl text-brand-white/80 leading-relaxed font-light">
                Workers who deploy through our RBA-aligned pipelines don't just return with financial capital; they return with human capital. 
              </p>
            </ScrollReveal>
          </div>
          <div className="md:w-1/2 flex items-center">
            <ScrollReveal delay={0.2}>
              <p className="text-lg text-brand-white/60 leading-relaxed pl-0 md:pl-12 md:border-l border-brand-white/10">
                Having worked in world-class facilities abroad, they bring back international standards of safety, quality, and technical expertise. Many of our returning candidates go on to become entrepreneurs, foremen, and leaders within Nepal's own developing industries. By enabling safe migration, we are accelerating the transfer of global skills back to the local economy.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

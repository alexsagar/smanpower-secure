import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Shield, Award, BookOpen, HeartHandshake, Globe } from "lucide-react";
import type { CmsContentBlock } from "@/types/content";

const getIcon = (name: string, className: string) => {
  switch (name) {
    case "Shield": return <Shield className={className} />;
    case "Award": return <Award className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "HeartHandshake": return <HeartHandshake className={className} />;
    case "Globe": return <Globe className={className} />;
    default: return <Award className={className} />;
  }
};

export function CoreValuesBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;
  const values = content.values || [];

  return (
    <section className="py-16 lg:py-24 bg-brand-black relative overflow-hidden text-brand-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <ScrollReveal>
            <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
              {content.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] mb-6 text-brand-white">
              {content.title}
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {values.map((item: any, i: number) => (
            <ScrollReveal key={item.title || i} delay={i * 0.15} className="group relative h-full">
              {/* Massive background number */}
              <div className="absolute -right-4 -top-8 text-[180px] font-bold text-white/[0.02] tracking-tighter pointer-events-none group-hover:text-brand-gold/[0.05] transition-colors duration-700">
                {item.step}
              </div>
              
              <div className="bg-brand-white/[0.02] border border-brand-white/[0.05] hover:border-brand-gold/30 hover:bg-brand-white/[0.04] transition-all duration-500 p-10 md:p-12 h-full flex flex-col relative z-10 overflow-hidden backdrop-blur-sm">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="text-brand-gold mb-12 group-hover:scale-110 transition-transform duration-500 origin-left">
                  {getIcon(item.icon, "w-10 h-10")}
                </div>
                
                <h3 className="card-title text-brand-white mb-6">
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
  );
}

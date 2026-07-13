import React from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, FileCheck, GraduationCap, FileText, Plane } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

const getIcon = (name: string, className: string) => {
  switch (name) {
    case "Search": return <Search className={className} />;
    case "ShieldCheck": return <ShieldCheck className={className} />;
    case "FileCheck": return <FileCheck className={className} />;
    case "GraduationCap": return <GraduationCap className={className} />;
    case "FileText": return <FileText className={className} />;
    case "Plane": return <Plane className={className} />;
    default: return <ArrowRight className={className} />;
  }
};

export function SolutionsGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-black text-brand-white relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="mb-20 text-center">
          <ScrollReveal>
            <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
              {content.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1]">
              {content.title}
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.solutions?.map((item: any, i: number) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <Link href={`/${lang}${item.href}`} className="group relative block h-full bg-brand-white/[0.02] border border-brand-white/10 p-10 hover:border-brand-gold/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-brand-gold mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 origin-left">
                    {getIcon(item.icon, "w-8 h-8")}
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-white mb-4 group-hover:text-brand-gold transition-colors">{item.title}</h3>
                  <p className="text-brand-white/60 leading-relaxed mb-8">{item.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    {content.ctaText || "Explore Service"} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

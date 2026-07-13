import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function StatsGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;
  const stats = content.stats || [];

  return (
    <section className="py-16 lg:py-24 bg-brand-gold relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-brand-black/10">
          {stats.map((stat: any, i: number) => (
            <ScrollReveal key={stat.label || i} delay={i * 0.1} className="flex flex-col items-center justify-center">
              <div className="text-5xl md:text-6xl font-bold text-brand-black tracking-tighter mb-4">{stat.value}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-black/70">{stat.label}</div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

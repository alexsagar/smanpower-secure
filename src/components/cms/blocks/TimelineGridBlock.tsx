import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function TimelineGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-white relative overflow-hidden">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
            <ScrollReveal>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                {content.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-6">
                {content.title}
              </h2>
              <p className="text-lg text-brand-muted leading-relaxed">
                {content.desc}
              </p>
            </ScrollReveal>
          </div>
          
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {content.steps?.map((item: any, i: number) => (
                <ScrollReveal key={item.step || i} delay={i * 0.15}>
                  <div className="relative">
                    <div className="text-7xl font-bold font-serif text-brand-charcoal/5 absolute -top-8 -left-4 z-0 select-none">
                      {item.step}
                    </div>
                    <div className="relative z-10 pt-4 border-t-2 border-brand-gold/30">
                      <h3 className="card-title text-brand-black mb-3">{item.title}</h3>
                      <p className="text-brand-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function ProcessFlowBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;

  return (
    <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat grayscale" 
        style={{ backgroundImage: `url('${content.imageSrc}')` }}
      />
      <div className="absolute inset-0 bg-brand-charcoal/80" />
      <div className="relative z-10 container-wide px-6 lg:px-12">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-white tracking-tighter leading-tight mb-8">
              {content.titleLine1}<br/>
              <span className="text-brand-gold italic font-serif">{content.titleLine2}</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-brand-white/80 font-semibold tracking-widest uppercase text-sm">
              {content.steps?.map((step: string, i: number) => (
                <React.Fragment key={i}>
                  <span>{step}</span>
                  {i < content.steps.length - 1 && <span className="text-brand-gold">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

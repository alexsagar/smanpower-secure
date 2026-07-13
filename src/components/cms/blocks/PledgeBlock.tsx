import React from "react";
import { AlertOctagon } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function PledgeBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;

  return (
    <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-brand-charcoal" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay" />
      <div className="relative z-10 text-center px-6">
        <ScrollReveal>
          <AlertOctagon className="w-16 h-16 text-brand-gold mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-white tracking-tighter max-w-4xl mx-auto leading-[1.1] mb-8">
            {content.title}
          </h2>
          <div className="w-24 h-px bg-brand-gold mx-auto" />
        </ScrollReveal>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

type FacilityPreviewItem = { id?: string | null; name: string; slug: string };

export function DynamicFacilitiesGridRenderer({ block, facilities }: { block: CmsContentBlock; facilities: FacilityPreviewItem[] }) {
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-black text-brand-white relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mb-24">
          <ScrollReveal>
            {content.eyebrow && (
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.eyebrow}
              </span>
            )}
            <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-white mb-8 [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
              {block.richHeading ? <RichTextRenderer content={block.richHeading} /> : content.title}
            </div>
            {content.body && (
              <div className="text-xl leading-relaxed text-brand-white/60 font-light mb-8 [&>p]:mb-4">
                <RichTextRenderer content={content.body} />
              </div>
            )}
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-brand-white/10">
          {facilities.map((item, i) => (
            <ScrollReveal key={item.id || item.slug} delay={i * 0.1} className="h-full">
              <Link
                href={`/training-facilities/${item.slug}`}
                className="group block h-full min-h-[350px] border-r border-b border-brand-white/10 p-10 relative overflow-hidden transition-all duration-700 hover:bg-brand-white/[0.02]"
              >
                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl" />
                <div className="flex justify-between items-start mb-auto h-full flex-col relative z-10">
                  <div className="w-full flex justify-between items-start">
                    <span className="text-brand-white/20 group-hover:text-brand-gold font-serif italic text-4xl font-light transition-colors duration-500">
                      0{i + 1}
                    </span>
                    <div className="w-12 h-12 border border-brand-white/10 group-hover:border-brand-gold rounded flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 group-hover:bg-brand-gold/10">
                      <ArrowUpRight className="w-5 h-5 text-brand-white/30 group-hover:text-brand-gold transition-colors duration-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-semibold text-brand-white/80 group-hover:text-brand-white mt-12 pr-4 leading-tight tracking-tight transition-colors duration-500 border-t border-brand-white/10 pt-8 w-full group-hover:border-brand-gold/30">
                    {item.name}
                  </h3>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

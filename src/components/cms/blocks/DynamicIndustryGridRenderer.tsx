import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

type IndustryPreviewItem = { name: string; slug: string };

export function DynamicIndustryGridRenderer({ block, industries }: { block: CmsContentBlock; industries: IndustryPreviewItem[] }) {
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-off-white relative">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-24">
          <ScrollReveal>
            {content.eyebrow && (
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-4 block">
                {content.eyebrow}
              </span>
            )}
            <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-8 [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
              {block.richHeading ? <RichTextRenderer content={block.richHeading} /> : content.title}
            </div>
            {content.body && (
              <div className="text-xl leading-relaxed text-brand-muted font-light mb-8 [&>p]:mb-4">
                <RichTextRenderer content={content.body} />
              </div>
            )}
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-brand-charcoal/10">
          {industries.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 0.05} className="h-full">
              <Link
                href={`/industries/${item.slug}`}
                className="group block h-full min-h-[320px] bg-white border-r border-b border-brand-charcoal/10 p-10 relative overflow-hidden transition-colors duration-500 hover:bg-brand-black"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/noise.png')] opacity-0 group-hover:opacity-10 mix-blend-overlay pointer-events-none transition-opacity duration-500" />
                <div className="flex justify-between items-start mb-auto h-full flex-col">
                  <div className="w-full flex justify-between items-start">
                    <span className="text-brand-charcoal/30 group-hover:text-brand-gold text-sm font-semibold tracking-widest transition-colors duration-500">
                      0{i + 1}
                    </span>
                    <div className="w-10 h-10 border border-brand-charcoal/10 group-hover:border-brand-gold/30 rounded flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-500">
                      <ArrowUpRight className="w-4 h-4 text-brand-charcoal/30 group-hover:text-brand-gold transition-colors duration-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-black group-hover:text-brand-white mt-12 pr-4 leading-tight tracking-tight transition-colors duration-500">
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

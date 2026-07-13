import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { getComplianceDocuments } from "@/services/compliance.service";
import { RichTextRenderer } from "../RichTextRenderer";

export async function DynamicVaultGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;
  const complianceDocs = await getComplianceDocuments();

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        
        <div className="max-w-4xl mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <ScrollReveal className="flex-1">
            {content.eyebrow && (
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-brand-gold" />
                <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase block">
                  {content.eyebrow}
                </span>
              </div>
            )}
            <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-8 [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
              {block.richHeading ? (
                <RichTextRenderer content={block.richHeading} />
              ) : (
                content.title
              )}
            </div>
          </ScrollReveal>
          
          {content.body && (
            <ScrollReveal delay={0.2} className="flex-1 max-w-sm pb-2">
              <div className="text-lg leading-relaxed text-brand-muted font-light [&>p]:mb-4">
                <RichTextRenderer content={content.body} />
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Next-Level Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-brand-charcoal/10">
          {complianceDocs.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1} className="h-full">
              <Link
                href={`/${lang}/trust-centre/${item.documentType}`}
                className="group block h-full min-h-[300px] border-r border-b border-brand-charcoal/10 bg-brand-off-white p-10 relative overflow-hidden transition-all duration-700 hover:bg-white hover:shadow-2xl z-10 hover:z-20"
              >
                
                {/* Hover Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex justify-between items-start mb-auto h-full flex-col relative z-10">
                  <div className="w-full flex justify-between items-start">
                    <span className="text-brand-charcoal/20 group-hover:text-brand-charcoal/40 font-mono text-sm tracking-widest transition-colors duration-500">
                      DOC // 0{i + 1}
                    </span>
                    <div className="w-10 h-10 border border-brand-charcoal/10 group-hover:border-brand-gold/50 rounded-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 bg-white group-hover:bg-brand-gold/5">
                      <ArrowUpRight className="w-4 h-4 text-brand-charcoal/40 group-hover:text-brand-gold transition-colors duration-500" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-brand-black mt-12 pr-4 leading-tight tracking-tight transition-colors duration-500 group-hover:text-brand-gold">
                      {item.title}
                    </h3>
                    <div className="w-12 h-px bg-brand-charcoal/10 mt-6 group-hover:w-full group-hover:bg-brand-gold/30 transition-all duration-700" />
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

import React from "react";
import { ArrowRight, Globe, Shield, Users, Target, Award, BookOpen } from "lucide-react";
import Link from "next/link";
import { EditorialSection } from "@/components/ui/EditorialSection";
import type { CmsContentBlock } from "@/types/content";
import { RichTextRenderer } from "../RichTextRenderer";

// Simple icon mapper based on string
const getIcon = (name: string, className: string) => {
  switch (name) {
    case "Users": return <Users className={className} />;
    case "Target": return <Target className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Globe": return <Globe className={className} />;
    case "Award": return <Award className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    default: return <ArrowRight className={className} />;
  }
};

export function EditorialBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;
  const dark = content.dark || false;

  return (
    <EditorialSection title={content.title} subtitle={content.subtitle} dark={dark}>
      
      {content.mainQuote && (
        <div className="relative mb-12">
          {/* Decorative large quote mark */}
          <div className={`absolute -top-10 -left-6 text-9xl font-serif pointer-events-none leading-none ${dark ? 'text-brand-white/10' : 'text-brand-gold/10'}`}>
            &ldquo;
          </div>
          <div className={`text-2xl md:text-3xl leading-relaxed mb-8 font-light tracking-tight relative z-10 ${dark ? 'text-brand-white' : 'text-brand-black'}`}>
            <RichTextRenderer content={content.mainQuote} />
          </div>
        </div>
      )}

      {content.body && (
        <div className={`text-lg md:text-xl leading-relaxed mb-12 ${dark ? 'text-brand-white/70' : 'text-brand-muted'}`}>
          <RichTextRenderer content={content.body} />
        </div>
      )}

      {/* Grid items (e.g. Navigation Links or Feature Cards) */}
      {content.gridItems && content.gridItems.length > 0 && (
        <div className={`grid grid-cols-1 ${content.gridColumns === 2 ? 'md:grid-cols-2' : 'sm:grid-cols-2'} gap-6 ${content.mainQuote || content.body ? 'mt-16' : ''}`}>
          {content.gridItems.map((item: any, i: number) => {
            if (item.href) {
              // It's a link card
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="group relative flex items-center gap-6 py-6 px-8 border border-brand-charcoal/10 bg-white overflow-hidden"
                >
                  <div className="absolute inset-0 bg-brand-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                  
                  {item.icon && (
                    <div className="text-brand-gold relative z-10 group-hover:scale-110 transition-transform duration-500">
                      {getIcon(item.icon, "w-5 h-5")}
                    </div>
                  )}
                  
                  <span className="text-sm font-bold text-brand-black group-hover:text-brand-white uppercase tracking-[0.15em] flex-1 relative z-10 transition-colors duration-300">
                    {item.title}
                  </span>
                  
                  <div className="relative z-10 w-10 h-10 rounded-full border border-brand-charcoal/10 group-hover:border-brand-gold/30 flex items-center justify-center bg-transparent group-hover:bg-brand-gold/10 transition-all duration-500">
                    <ArrowRight className="w-4 h-4 text-brand-charcoal/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              );
            } else {
              // It's a feature text card
              return (
                <div key={i} className={`border p-8 transition-colors ${dark ? 'bg-brand-white/5 border-brand-white/10 hover:bg-brand-white/10' : 'bg-brand-off-white border-brand-charcoal/10 hover:bg-brand-charcoal/5'}`}>
                  <h3 className="card-title text-brand-gold mb-3">{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-brand-muted'}`}>{item.desc}</p>
                </div>
              );
            }
          })}
        </div>
      )}
    </EditorialSection>
  );
}

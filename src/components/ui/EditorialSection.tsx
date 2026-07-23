"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

interface EditorialSectionProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function EditorialSection({ title, subtitle, children, className, dark = false }: EditorialSectionProps) {
  return (
    <section className={cn("py-24 md:py-32 relative overflow-hidden", dark ? "bg-brand-black text-brand-white" : "bg-brand-off-white text-brand-charcoal", className)}>
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-between container-wide mx-auto px-6 lg:px-12 opacity-50">
        <div className={cn("w-px h-full", dark ? "bg-brand-white/[0.04]" : "bg-brand-charcoal/[0.04]")} />
        <div className={cn("w-px h-full", dark ? "bg-brand-white/[0.04]" : "bg-brand-charcoal/[0.04]")} />
        <div className={cn("w-px h-full", dark ? "bg-brand-white/[0.04]" : "bg-brand-charcoal/[0.04]")} />
        <div className={cn("w-px h-full", dark ? "bg-brand-white/[0.04]" : "bg-brand-charcoal/[0.04]")} />
      </div>

      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row gap-16 lg:gap-24 items-start">
        {/* Left Column - Sticky Heading */}
        <div className="md:w-5/12 flex flex-col md:sticky md:top-32">
          <ScrollReveal>
            {subtitle && (
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-6 block">
                {subtitle}
              </span>
            )}
            <h2 className={cn("text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.05]", dark ? "text-brand-white" : "text-brand-black")}>
              {title}
            </h2>
          </ScrollReveal>
        </div>
        
        {/* Right Column - Content */}
        <div className="md:w-7/12 pt-4 md:pt-16 pb-12">
          <ScrollReveal delay={0.2}>
            <div className={cn("prose prose-lg lg:prose-xl max-w-none leading-relaxed", dark ? "prose-invert" : "")}>
              {children}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

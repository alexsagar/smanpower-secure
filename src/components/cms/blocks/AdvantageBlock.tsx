import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";

export function AdvantageBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;

  return (
    <section className="py-16 lg:py-24 bg-brand-white relative overflow-hidden">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center">
          <div className="md:w-1/2">
            <ScrollReveal>
              <div className="relative h-[600px] w-full bg-brand-charcoal/5 p-4">
                <Image
                  src={content.imageSrc || "/placeholder.png"}
                  alt={content.title || "Image"}
                  fill
                  className="object-cover"
                />
                {/* Floating Badge */}
                {content.badgeText && (
                  <div className="absolute -bottom-8 -right-8 bg-brand-charcoal text-brand-white p-8 border-l-4 border-brand-gold hidden md:block">
                    <p className="text-4xl font-bold font-serif mb-2 text-brand-gold">{content.badgeText}</p>
                    <p className="text-sm font-semibold tracking-widest uppercase">{content.badgeLabel}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
          
          <div className="md:w-1/2">
            <ScrollReveal delay={0.2}>
              <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                {content.eyebrow}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-8">
                {content.title}
              </h2>
              
              <div className="space-y-6">
                {content.points?.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                    <p className="text-lg text-brand-muted leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>

              {content.ctaText && content.ctaHref && (
                <div className="mt-12 pt-12 border-t border-brand-charcoal/10">
                  <Link href={`/${lang}${content.ctaHref}`}>
                    <Button variant="outline" className="h-14 px-8 text-xs font-semibold uppercase tracking-widest border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all">
                      {content.ctaText}
                    </Button>
                  </Link>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

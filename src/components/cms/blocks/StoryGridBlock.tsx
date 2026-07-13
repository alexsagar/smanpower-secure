import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";

export function StoryGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const prefix = `/${lang}`;
  const content = block.content as any;
  
  return (
    <>
      {/* SECTION 12: SUCCESS STORIES */}
      <section className="py-16 lg:py-24 bg-brand-off-white relative">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 lg:mb-24 gap-8">
            <ScrollReveal>
              {content.heading && (
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-brand-black">
                  {content.heading.replace(content.headingHighlight || '', '')} 
                  {content.headingHighlight && (
                    <span className="font-serif italic text-brand-gold">{content.headingHighlight}</span>
                  )}
                </h2>
              )}
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              {content.ctaText && content.ctaHref && (
                <Link href={`${prefix}${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`} className="inline-flex items-center gap-4 group">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-charcoal group-hover:text-brand-gold transition-colors">{content.ctaText}</span>
                  <div className="w-12 h-12 rounded-full border border-brand-charcoal/20 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-brand-charcoal group-hover:text-brand-gold" />
                  </div>
                </Link>
              )}
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {content.stories?.map((story: any, i: number) => (
              <ScrollReveal key={i} delay={0.2 * i} className="group cursor-pointer relative h-[450px] lg:h-[650px] rounded-3xl overflow-hidden block">
                <div className="absolute inset-0 z-0">
                  <Image src={story.imageSrc || '/placeholder.png'} alt={story.imageAlt || ''} fill className="object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-12">
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6">
                    <span className={`${story.type === 'candidate' ? 'bg-brand-gold/20 border-brand-gold/30' : 'bg-brand-white/10 border-brand-white/10'} backdrop-blur-md border px-4 py-2 rounded-full text-brand-white shadow-lg`}>
                      {story.type === 'candidate' ? 'Candidate Story' : 'Employer Story'}
                    </span>
                    <span className="text-brand-white/70">{story.country}</span>
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-light text-brand-white mb-4 group-hover:text-brand-gold transition-colors leading-tight">{story.title}</h3>

                  {/* Reveal on hover text container */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className="text-brand-white/70 text-base lg:text-lg line-clamp-2 max-w-md mt-4">
                        {story.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}

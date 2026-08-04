import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, ShieldCheck, Download, HeartHandshake, Users, Shield } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { CmsContentBlock } from "@/types/content";
import { toPublicHref } from "@/lib/public-href";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import type { CmsMediaAsset } from "@/types/content";

export type InsightCard = { category: string; date: string; title: string; slug?: string; image?: CmsMediaAsset; imageAlt?: string };

/**
 * Presentational only — no data fetching, so it stays safe to render from the
 * client-side admin preview. The public site passes live published insights via
 * `articles` (see InsightPreviewBlockServer); the admin preview omits them and
 * the block falls back to the CMS block's demo `articles`.
 */
export function InsightPreviewBlock({
  block,
  lang,
  articles: liveArticles,
}: { block: CmsContentBlock; lang: string; articles?: InsightCard[] }) {
  void lang;
  const content = block.content as any;
  const articles = liveArticles && liveArticles.length > 0
    ? liveArticles
    : (content.articles as any[] | undefined) ?? [];

  return (
    <>
      {/* SECTION 13: INSIGHTS AND NEWSROOM */}
      <section className="py-16 lg:py-24 bg-brand-off-white text-brand-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/15 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container-wide px-6 lg:px-12 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
            <ScrollReveal>
              {content.eyebrow && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-2 h-2 bg-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-semibold tracking-[0.4em] uppercase">
                    {content.eyebrow}
                  </span>
                </div>
              )}
              {content.heading && (
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase text-brand-black whitespace-pre-line">
                  {content.heading}
                </h2>
              )}
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              {content.ctaText && content.ctaHref && (
                <Link href={`${content.ctaHref?.startsWith('/') ? '' : '/'}${content.ctaHref}`} className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-gold transition-colors">
                  <span>{content.ctaText}</span>
                  <div className="w-12 h-12 rounded-full border border-brand-charcoal/20 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              )}
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((news: any, i: number) => {
              const CardTag: any = news.slug ? Link : "div";
              const cardProps = news.slug ? { href: toPublicHref(`/insights/${news.slug}`) } : {};
              return (
              <ScrollReveal key={news.slug ?? i} delay={i * 0.1} className="group cursor-pointer block relative">
                <CardTag {...cardProps} className="block">
                {news.image ? (
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-brand-stone">
                    <OptimizedImage src={news.image} preset="articleCard" alt={news.imageAlt || news.title} fill />
                  </div>
                ) : null}
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4 group-hover:text-brand-gold/70 transition-colors">
                  <span>{news.category}</span>
                  <span className="w-1 h-1 rounded-full bg-brand-charcoal/20 group-hover:bg-brand-gold/50 transition-colors" />
                  <span>{news.date}</span>
                </div>
                <h3 className="text-2xl font-light text-brand-black mb-8 group-hover:text-brand-gold transition-colors leading-snug">{news.title}</h3>

                <div className="w-full h-px bg-brand-charcoal/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-full bg-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                </div>

                {/* View article text that slides in */}
                <div className="mt-6 flex items-center gap-3 text-brand-gold text-[10px] font-bold uppercase tracking-widest opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span>{content.readArticleLabel || "Read Article"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                </CardTag>
              </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      
    </>
  );
}

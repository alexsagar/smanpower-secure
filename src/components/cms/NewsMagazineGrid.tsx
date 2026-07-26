"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, User, Tag, Sparkles, Newspaper, FileText } from "lucide-react";
import { resolveImageMediaUrl, type MediaLike } from "@/lib/media-resolver";
import { toPublicHref } from "@/lib/public-href";
import { readingMinutes } from "@/lib/utils";

export interface NewsArticleItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  publishDate?: Date | null;
  newsType?: string | null;
  author?: { name: string } | null;
  featuredMedia?: MediaLike | null;
  featuredImage?: string | null;
}

interface NewsMagazineGridProps {
  articles: NewsArticleItem[];
  emptyStateHeading?: string;
  emptyStateBody?: string;
  readMoreLabel?: string;
}

export function NewsMagazineGrid({
  articles,
  emptyStateHeading = "No official notices in this edition",
  emptyStateBody = "Check back soon for the latest company dispatches and press announcements.",
  readMoreLabel = "Read Full Press Release",
}: NewsMagazineGridProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Extract unique news types
  const types = Array.from(
    new Set(articles.map((a) => a.newsType).filter((type): type is string => Boolean(type)))
  );

  const filteredArticles = articles.filter((article) => {
    if (selectedType === "ALL") return true;
    return article.newsType === selectedType;
  });

  const leadArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className="w-full">
      {/* Newspaper Top Issue Bar & Filter Navigation */}
      <div className="border-t-2 border-b-2 border-brand-black py-4 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-brand-white/40">
        <div className="flex items-center gap-4 text-xs tracking-widest uppercase font-mono text-brand-charcoal/70">
          <Newspaper className="w-4 h-4 text-brand-gold" />
          <span>Seven Seas Newsroom • Press Dispatches & Notices</span>
          <span className="hidden sm:inline-block text-brand-charcoal/30">•</span>
          <span className="hidden sm:inline-block font-sans font-semibold text-brand-black">
            {articles.length} Official {articles.length === 1 ? "Notice" : "Notices"}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              selectedType === "ALL"
                ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
            }`}
          >
            All Dispatches ({articles.length})
          </button>

          {types.map((type) => {
            const count = articles.filter((a) => a.newsType === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border whitespace-nowrap ${
                  selectedType === type
                    ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                    : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-brand-black/20 bg-brand-off-white/50">
          <p className="text-2xl font-serif text-brand-black mb-2">{emptyStateHeading}</p>
          <p className="text-sm text-brand-muted max-w-md mx-auto">{emptyStateBody}</p>
        </div>
      ) : (
        <div className="space-y-24">
          {/* Cover Feature Lead Press Release */}
          {leadArticle && (
            <article className="group bg-brand-white border border-brand-black/20 shadow-2xl p-8 lg:p-14 relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b-2 border-brand-black pb-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-brand-gold/30 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Official Press Release
                  </span>
                  <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                    {leadArticle.newsType || "Official Notice"}
                  </span>
                </div>
              </div>

              {/* Stacked Title & Headline */}
              <div className="text-center max-w-5xl mx-auto mb-10">
                <Link href={toPublicHref(`/news/${leadArticle.slug}`)}>
                  <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black group-hover:text-brand-gold transition-colors mb-6">
                    {leadArticle.title}
                  </h3>
                </Link>

                {/* Byline Strip */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-brand-charcoal/70 border-y border-brand-black/15 py-3 font-semibold bg-brand-off-white/60 max-w-3xl mx-auto">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-gold" />
                    {leadArticle.author?.name || "Corporate Communications"}
                  </span>
                  <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-6">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    {readingMinutes(leadArticle.content)} min read
                  </span>
                  {leadArticle.publishDate && (
                    <span className="border-l border-brand-black/15 pl-6">
                      {new Date(leadArticle.publishDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Panoramic Photo Frame */}
              <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-brand-charcoal border-4 border-brand-black shadow-xl mb-12">
                <Image
                  src={
                    leadArticle.featuredMedia
                      ? resolveImageMediaUrl(leadArticle.featuredMedia, { width: 1400 })
                      : leadArticle.featuredImage || "/images/trade_test_centre_1782920400836.png"
                  }
                  alt={leadArticle.featuredMedia?.altText || leadArticle.title}
                  fill
                  sizes="100vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Executive Briefing Grid below image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-4 border-t border-brand-black/15">
                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    01 • Summary Brief
                  </span>
                  {leadArticle.summary && (
                    <p className="text-sm md:text-base leading-relaxed text-brand-black font-serif italic border-l-2 border-brand-gold pl-3">
                      {leadArticle.summary}
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    02 • Classification & Issuer
                  </span>
                  <div className="text-xs text-brand-charcoal/80 space-y-2 leading-relaxed">
                    <p>
                      <strong>Category:</strong> {leadArticle.newsType || "Official Notice"}
                    </p>
                    <p>
                      <strong>Issuing Body:</strong> Seven Seas Intercontinental Press Desk
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-start md:items-end">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold block mb-3">
                    03 • Full Dispatch
                  </span>
                  <Link
                    href={toPublicHref(`/news/${leadArticle.slug}`)}
                    className="w-full inline-flex items-center justify-center gap-3 bg-brand-black text-brand-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 group/btn shadow-md"
                  >
                    <span>{readMoreLabel}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Remaining Newsroom Grid */}
          {remainingArticles.length > 0 && (
            <div className="pt-8">
              <div className="border-b-2 border-brand-black pb-4 mb-12 flex items-center justify-between">
                <h4 className="font-serif text-2xl md:text-3xl font-normal text-brand-black uppercase tracking-tight">
                  Additional Dispatches & Announcements
                </h4>
                <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                  {remainingArticles.length} More {remainingArticles.length === 1 ? "Notice" : "Notices"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {remainingArticles.map((article, index) => (
                  <article
                    key={article.id}
                    className="group bg-brand-white border border-brand-black/15 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal border-b border-brand-black/15">
                        <Image
                          src={
                            article.featuredMedia
                              ? resolveImageMediaUrl(article.featuredMedia, { width: 800 })
                              : article.featuredImage || "/images/trade_test_centre_1782920400836.png"
                          }
                          alt={article.featuredMedia?.altText || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-brand-black/90 backdrop-blur-md text-brand-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {article.newsType || "Notice"}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-brand-white/90 text-brand-black font-mono text-[10px] px-2 py-0.5 border border-brand-black/20">
                          Col. 0{index + 2}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted mb-3 font-medium">
                          <span>{readingMinutes(article.content)} min read</span>
                          {article.publishDate && (
                            <span>
                              • {new Date(article.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>

                        <Link href={toPublicHref(`/news/${article.slug}`)}>
                          <h4 className="font-serif text-2xl font-normal leading-snug text-brand-black group-hover:text-brand-gold transition-colors mb-3 line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>

                        {article.summary && (
                          <p className="text-xs text-brand-charcoal/80 line-clamp-3 mb-4 leading-relaxed font-sans">
                            {article.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 border-t border-brand-black/10 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-semibold text-brand-black uppercase tracking-wider">
                        {article.author?.name || "Corporate Press"}
                      </span>

                      <Link
                        href={toPublicHref(`/news/${article.slug}`)}
                        className="text-[11px] uppercase tracking-widest font-bold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-1"
                      >
                        Read Notice
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

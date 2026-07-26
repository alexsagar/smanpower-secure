"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, User, Tag, Sparkles, Newspaper, BookOpen, ShieldCheck, FileText } from "lucide-react";
import { resolveImageMediaUrl } from "@/lib/media-resolver";
import { toPublicHref } from "@/lib/public-href";

export interface InsightArticleItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  publishDate?: Date | null;
  isFeatured?: boolean;
  category?: { name: string } | null;
  author?: { name: string } | null;
  featuredImage?: any | null;
}

interface InsightMagazineGridProps {
  articles: InsightArticleItem[];
  emptyStateHeading?: string;
  emptyStateBody?: string;
  readMoreLabel?: string;
}

function calculateReadingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function InsightMagazineGrid({
  articles,
  emptyStateHeading = "No published insights available",
  emptyStateBody = "Check back soon for latest industry reports, compliance updates, and recruitment guides.",
  readMoreLabel = "Read Feature Article",
}: InsightMagazineGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Extract unique categories from articles
  const categories = Array.from(
    new Set(articles.map((a) => a.category?.name).filter((name): name is string => Boolean(name)))
  );

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory === "ALL") return true;
    return article.category?.name === selectedCategory;
  });

  const leadArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className="w-full">
      {/* Newspaper Top Issue Bar & Category Filter Tabs */}
      <div className="border-t-2 border-b-2 border-brand-black py-4 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-brand-white/40">
        <div className="flex items-center gap-4 text-xs tracking-widest uppercase font-mono text-brand-charcoal/70">
          <Newspaper className="w-4 h-4 text-brand-gold" />
          <span>Vol. XXVIII • Global Workforce Edition</span>
          <span className="hidden sm:inline-block text-brand-charcoal/30">•</span>
          <span className="hidden sm:inline-block font-sans font-semibold text-brand-black">
            {articles.length} Published {articles.length === 1 ? "Report" : "Reports"}
          </span>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              selectedCategory === "ALL"
                ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
            }`}
          >
            All Reports ({articles.length})
          </button>

          {categories.map((cat) => {
            const count = articles.filter((a) => a.category?.name === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                    : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
                }`}
              >
                {cat} ({count})
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
          {/* Cover Feature Article - Stacked Broadsheet Banner Layout */}
          {leadArticle && (
            <article className="group bg-brand-white border border-brand-black/20 shadow-2xl p-8 lg:p-14 relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b-2 border-brand-black pb-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-brand-gold/30 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Cover Story Analysis
                  </span>
                  <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                    {leadArticle.category?.name || "Key Report"}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Intelligence</span>
                </div>
              </div>

              {/* Stacked Title & Headline */}
              <div className="text-center max-w-5xl mx-auto mb-10">
                <Link href={toPublicHref(`/insights/${leadArticle.slug}`)}>
                  <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black group-hover:text-brand-gold transition-colors mb-6">
                    {leadArticle.title}
                  </h3>
                </Link>

                {/* Byline Strip */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-brand-charcoal/70 border-y border-brand-black/15 py-3 font-semibold bg-brand-off-white/60 max-w-3xl mx-auto">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-gold" />
                    {leadArticle.author?.name || "Editorial Board"}
                  </span>
                  <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-6">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    {calculateReadingMinutes(leadArticle.content)} min read
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

              {/* Panoramic Panoramic Photo Frame */}
              <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-brand-charcoal border-4 border-brand-black shadow-xl mb-12">
                <Image
                  src={
                    leadArticle.featuredImage
                      ? resolveImageMediaUrl(leadArticle.featuredImage, { width: 1400 })
                      : "/images/placeholder.png"
                  }
                  alt={leadArticle.featuredImage?.altText || leadArticle.title}
                  fill
                  sizes="100vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              {/* 3-Column Editorial Executive Briefing Grid below Panoramic Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-4 border-t border-brand-black/15">
                {/* Column 1: Executive Overview */}
                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    01 • Executive Overview
                  </span>
                  {leadArticle.summary && (
                    <p className="text-sm md:text-base leading-relaxed text-brand-black font-serif italic border-l-2 border-brand-gold pl-3">
                      {leadArticle.summary}
                    </p>
                  )}
                </div>

                {/* Column 2: Scope & Context */}
                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    02 • Field Scope & Classification
                  </span>
                  <div className="text-xs text-brand-charcoal/80 space-y-2 leading-relaxed">
                    <p>
                      <strong>Classification:</strong> {leadArticle.category?.name || "General Intelligence"}
                    </p>
                    <p>
                      <strong>Authoritative Source:</strong> {leadArticle.author?.name || "Seven Seas Recruitment Research"}
                    </p>
                    <p>
                      <strong>Compliance Status:</strong> Verified & Reviewed
                    </p>
                  </div>
                </div>

                {/* Column 3: Action Button */}
                <div className="flex flex-col justify-between items-start md:items-end">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold block mb-3">
                    03 • Full Report Document
                  </span>
                  <Link
                    href={toPublicHref(`/insights/${leadArticle.slug}`)}
                    className="w-full inline-flex items-center justify-center gap-3 bg-brand-black text-brand-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 group/btn shadow-md"
                  >
                    <span>{readMoreLabel}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Remaining Articles Newspaper Broadsheet Grid */}
          {remainingArticles.length > 0 && (
            <div className="pt-8">
              <div className="border-b-2 border-brand-black pb-4 mb-12 flex items-center justify-between">
                <h4 className="font-serif text-2xl md:text-3xl font-normal text-brand-black uppercase tracking-tight">
                  Additional Reports & Dossiers in this Edition
                </h4>
                <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                  {remainingArticles.length} More {remainingArticles.length === 1 ? "Article" : "Articles"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {remainingArticles.map((article, index) => (
                  <article
                    key={article.id}
                    className="group bg-brand-white border border-brand-black/15 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      {/* Top Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal border-b border-brand-black/15">
                        <Image
                          src={
                            article.featuredImage
                              ? resolveImageMediaUrl(article.featuredImage, { width: 800 })
                              : "/images/placeholder.png"
                          }
                          alt={article.featuredImage?.altText || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-brand-black/90 backdrop-blur-md text-brand-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {article.category?.name || "Report"}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-brand-white/90 text-brand-black font-mono text-[10px] px-2 py-0.5 border border-brand-black/20">
                          Col. 0{index + 2}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted mb-3 font-medium">
                          <span>{calculateReadingMinutes(article.content)} min read</span>
                          {article.publishDate && (
                            <span>
                              • {new Date(article.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>

                        <Link href={toPublicHref(`/insights/${article.slug}`)}>
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

                    {/* Card Footer */}
                    <div className="p-6 pt-0 border-t border-brand-black/10 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-semibold text-brand-black uppercase tracking-wider">
                        {article.author?.name || "Editorial Team"}
                      </span>

                      <Link
                        href={toPublicHref(`/insights/${article.slug}`)}
                        className="text-[11px] uppercase tracking-widest font-bold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-1"
                      >
                        Read Report
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

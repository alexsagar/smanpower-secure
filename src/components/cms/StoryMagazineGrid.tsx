"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Quote, ArrowUpRight, Building2, UserCheck, MapPin, Briefcase, Sparkles, Newspaper } from "lucide-react";
import type { CmsSuccessStory } from "@/types/content";
import { isFilenameLike } from "@/lib/media-resolver";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { stripWrappingQuotes } from "@/lib/utils";

interface StoryMagazineGridProps {
  stories: CmsSuccessStory[];
  emptyStateMessage?: string;
  readMoreLabel?: string;
}

export function StoryMagazineGrid({
  stories,
  emptyStateMessage = "No published stories in this issue.",
  readMoreLabel = "Read Feature Article",
}: StoryMagazineGridProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "EMPLOYER" | "CANDIDATE">("ALL");

  const filteredStories = stories.filter((story) => {
    if (activeFilter === "ALL") return true;
    return story.storyType === activeFilter;
  });

  const leadStory = filteredStories[0];
  const remainingStories = filteredStories.slice(1);

  const employerCount = stories.filter((s) => s.storyType === "EMPLOYER").length;
  const candidateCount = stories.filter((s) => s.storyType === "CANDIDATE").length;

  return (
    <div className="w-full">
      {/* Newspaper Top Issue Bar & Filter Tabs */}
      <div className="border-t-2 border-b-2 border-brand-black py-4 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-xs tracking-widest uppercase font-mono text-brand-charcoal/70">
          <Newspaper className="w-4 h-4 text-brand-gold" />
          <span>Global Recruitment</span>
          <span className="hidden sm:inline-block text-brand-charcoal/30">•</span>
          <span className="hidden sm:inline-block font-sans font-semibold text-brand-black">
            {stories.length} Published {stories.length === 1 ? "Story" : "Stories"}
          </span>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              activeFilter === "ALL"
                ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
            }`}
          >
            All Edition ({stories.length})
          </button>
          <button
            onClick={() => setActiveFilter("EMPLOYER")}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border flex items-center gap-2 ${
              activeFilter === "EMPLOYER"
                ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-brand-gold" />
            Employer Partnerships ({employerCount})
          </button>
          <button
            onClick={() => setActiveFilter("CANDIDATE")}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border flex items-center gap-2 ${
              activeFilter === "CANDIDATE"
                ? "bg-brand-black text-brand-white border-brand-black shadow-sm"
                : "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-brand-gold" />
            Candidate Journeys ({candidateCount})
          </button>
        </div>
      </div>

      {filteredStories.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-brand-black/20 bg-brand-off-white/50">
          <p className="text-xl font-serif text-brand-charcoal/70 mb-2">{emptyStateMessage}</p>
          <p className="text-xs uppercase tracking-widest text-brand-muted">
            Select another category to view features
          </p>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Broadsheet Lead Feature Story */}
          {leadStory && (
            <article className="group bg-brand-white border border-brand-black/15 shadow-xl overflow-hidden relative">
              <div className="bg-brand-black text-brand-white px-6 py-2 flex items-center justify-between text-[11px] uppercase tracking-widest font-mono">
                <span className="flex items-center gap-2 text-brand-gold font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Lead Feature Article
                </span>
                <span>
                  {leadStory.storyType === "EMPLOYER" ? "Corporate Case Study" : "Voices of the Field"}
                </span>
              </div>

              <div className="p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {/* Image Frame */}
                <div className="lg:col-span-6 relative">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-charcoal border-4 border-brand-black shadow-lg">
                    <OptimizedImage
                      src={leadStory.featuredImage ?? "/images/placeholder.png"}
                      preset="successStoryCard"
                      alt={isFilenameLike(leadStory.featuredImage?.altText) ? leadStory.title : leadStory.featuredImage!.altText}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute top-4 left-4 z-10 bg-brand-black/90 backdrop-blur-md text-brand-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 border border-brand-gold/30">
                      {leadStory.storyType === "EMPLOYER" ? "Employer Partner" : "Candidate Story"}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-brand-muted mb-4 font-semibold">
                    {leadStory.industry && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
                        {leadStory.industry}
                      </span>
                    )}
                    {leadStory.country && (
                      <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-3">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                        {leadStory.country}
                      </span>
                    )}
                  </div>

                  <Link href={`/success-stories/${leadStory.slug}`}>
                    <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.1] text-brand-black group-hover:text-brand-gold transition-colors mb-6">
                      {leadStory.title}
                    </h3>
                  </Link>

                  {/* Summary / Lead Paragraph */}
                  {leadStory.summary && (
                    <div className="text-base md:text-lg leading-relaxed text-brand-charcoal/90 mb-6 font-sans border-l-2 border-brand-gold pl-4 italic bg-brand-off-white/70 py-3">
                      {leadStory.summary}
                    </div>
                  )}

                  {/* Pull Quote */}
                  {leadStory.quote && (
                    <blockquote className="mb-8 font-serif text-lg md:text-xl italic text-brand-black/80 flex gap-3 items-start">
                      <Quote className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                      <span>&ldquo;{stripWrappingQuotes(leadStory.quote)}&rdquo;</span>
                    </blockquote>
                  )}

                  {/* Byline and Action */}
                  <div className="border-t border-brand-black/10 pt-6 flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div>
                      {leadStory.personName && (
                        <p className="text-sm font-bold text-brand-black uppercase tracking-wider">
                          {leadStory.personName}
                        </p>
                      )}
                      <p className="text-[11px] uppercase tracking-widest text-brand-muted">
                        {leadStory.storyType === "EMPLOYER" ? "Employer Partnership" : "Candidate Story"}
                      </p>
                    </div>

                    <Link
                      href={`/success-stories/${leadStory.slug}`}
                      className="inline-flex items-center gap-2 bg-brand-black text-brand-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 group/btn"
                    >
                      <span>{readMoreLabel}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Remaining Stories Broadside Newspaper Grid */}
          {remainingStories.length > 0 && (
            <div className="pt-8">
              <div className="border-b border-brand-black pb-3 mb-10 flex items-center justify-between">
                <h4 className="font-serif text-2xl font-normal text-brand-black uppercase tracking-tight">
                  Further Features in this Edition
                </h4>
                <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                  {remainingStories.length} More {remainingStories.length === 1 ? "Story" : "Stories"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {remainingStories.map((story, index) => (
                  <article
                    key={story.id}
                    className="group bg-brand-white border border-brand-black/15 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Story Card Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal border-b border-brand-black/15">
                        <OptimizedImage
                          src={story.featuredImage ?? "/images/placeholder.png"}
                          preset="successStoryCard"
                          alt={isFilenameLike(story.featuredImage?.altText) ? story.title : story.featuredImage!.altText}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-brand-black/90 backdrop-blur-md text-brand-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {story.storyType === "EMPLOYER" ? "Employer" : "Candidate"}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-brand-white/90 text-brand-black font-mono text-[10px] px-2 py-0.5 border border-brand-black/20">
                          Col. 0{index + 2}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted mb-3 font-medium">
                          <span>{story.industry || story.country || "Global Reach"}</span>
                          {story.country && story.industry && <span>• {story.country}</span>}
                        </div>

                        <Link href={`/success-stories/${story.slug}`}>
                          <h4 className="font-serif text-2xl font-normal leading-snug text-brand-black group-hover:text-brand-gold transition-colors mb-3 line-clamp-2">
                            {story.title}
                          </h4>
                        </Link>

                        {story.summary && (
                          <p className="text-xs text-brand-charcoal/80 line-clamp-3 mb-4 leading-relaxed font-sans">
                            {story.summary}
                          </p>
                        )}

                        {story.quote && (
                          <blockquote className="text-xs italic font-serif text-brand-charcoal/90 border-l-2 border-brand-gold pl-3 py-1 mb-4 bg-brand-off-white/50">
                            &ldquo;{stripWrappingQuotes(story.quote)}&rdquo;
                          </blockquote>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 pt-0 border-t border-brand-black/10 flex items-center justify-between mt-auto">
                      <div>
                        {story.personName && (
                          <span className="block text-xs font-semibold text-brand-black uppercase tracking-wider">
                            {story.personName}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/success-stories/${story.slug}`}
                        className="text-[11px] uppercase tracking-widest font-bold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-1"
                      >
                        Read Story
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

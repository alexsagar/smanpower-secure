"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, User, Sparkles, Newspaper } from "lucide-react";
import { resolveImageMediaUrl, isFilenameLike, type MediaLike } from "@/lib/media-resolver";
import { toPublicHref } from "@/lib/public-href";
import { readingMinutes } from "@/lib/utils";

/**
 * Broadsheet layout shared by the insights and newsroom indexes: an issue bar
 * with facet tabs, a stacked cover feature (headline, byline, panoramic photo,
 * three-column briefing) and a card grid for the rest.
 *
 * Both sections rendered byte-identical markup and differed only in labels, the
 * field they filter on, and the URL base — so those are props here rather than a
 * second copy of the layout. Success stories deliberately keep their own
 * component: that layout is genuinely different (side-by-side lead, pull quote,
 * fixed two-value filter), not this one with different words.
 */

/** One item, already flattened by the calling section. */
export interface MagazineItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  publishDate?: Date | null;
  authorName?: string | null;
  /** Value the facet tabs filter on — a category name, a news type, etc. */
  facet?: string | null;
  image?: MediaLike | string | null;
}

export interface MagazineGridLabels {
  /** Left side of the issue bar, e.g. "Global Workforce". */
  issueLabel: string;
  /** Noun for the published count, e.g. ["Report", "Reports"]. */
  countNoun: [string, string];
  /** Prefix for the count, e.g. "Published" -> "3 Published Reports". */
  countVerb: string;
  /** "All" tab label, e.g. "All Reports". */
  allTabLabel: string;
  /** Badge on the cover feature, e.g. "Cover Story Analysis". */
  leadBadge: string;
  /** Shown where an item has no facet value. */
  facetFallback: string;
  /** Shown where an item has no author. */
  authorFallback: string;
  /** Author fallback on the small cards. */
  cardAuthorFallback: string;
  /** Second briefing column: its heading, and the two row labels. */
  briefingHeading: string;
  classificationLabel: string;
  classificationFallback: string;
  sourceLabel: string;
  /** Fixed source text; when omitted the item's author is shown. */
  sourceValue?: string;
  /** Third briefing column's heading. */
  documentHeading: string;
  /** Heading above the card grid. */
  remainingHeading: string;
  /** Noun for the "N more" count, e.g. ["Article", "Articles"]. */
  remainingNoun: [string, string];
  /** Label on each card's link, e.g. "Read Report". */
  cardLinkLabel: string;
  /** Badge on each card image where the item has no facet. */
  cardFacetFallback: string;
  emptyStateHeading: string;
  emptyStateBody: string;
  readMoreLabel: string;
}

interface EditorialMagazineGridProps {
  items: MagazineItem[];
  /** URL base the slugs hang off, e.g. "/insights". */
  basePath: string;
  labels: MagazineGridLabels;
  /** Image used when an item has none. */
  imageFallback?: string;
}

const TAB_CLASSES =
  "px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 border";
const TAB_ACTIVE = "bg-brand-black text-brand-white border-brand-black shadow-sm";
const TAB_IDLE =
  "bg-transparent text-brand-charcoal border-brand-charcoal/20 hover:border-brand-black";

export function EditorialMagazineGrid({
  items,
  basePath,
  labels,
  imageFallback = "/images/placeholder.png",
}: EditorialMagazineGridProps) {
  const [selectedFacet, setSelectedFacet] = useState<string>("ALL");

  const facets = Array.from(
    new Set(items.map((item) => item.facet).filter((facet): facet is string => Boolean(facet)))
  );

  const filtered = selectedFacet === "ALL" ? items : items.filter((i) => i.facet === selectedFacet);
  const lead = filtered[0];
  const remaining = filtered.slice(1);

  const href = (slug: string) => toPublicHref(`${basePath}/${slug}`);
  const imageFor = (item: MagazineItem, width: number) =>
    item.image ? resolveImageMediaUrl(item.image, { width }) : imageFallback;
  // Never fall back to an upload filename ("1.webp") — that is useless to a
  // screen reader and shows through if the image fails to load.
  const altFor = (item: MagazineItem) => {
    const alt = typeof item.image === "object" ? item.image?.altText : undefined;
    return isFilenameLike(alt) ? item.title : alt!;
  };
  const plural = (count: number, [one, many]: [string, string]) => (count === 1 ? one : many);

  return (
    <div className="w-full">
      {/* Issue bar & facet tabs */}
      <div className="border-t-2 border-b-2 border-brand-black py-4 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-brand-white/40">
        <div className="flex items-center gap-4 text-xs tracking-widest uppercase font-mono text-brand-charcoal/70">
          <Newspaper className="w-4 h-4 text-brand-gold" />
          <span>{labels.issueLabel}</span>
          <span className="hidden sm:inline-block text-brand-charcoal/30">•</span>
          <span className="hidden sm:inline-block font-sans font-semibold text-brand-black">
            {items.length} {labels.countVerb} {plural(items.length, labels.countNoun)}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFacet("ALL")}
            className={`${TAB_CLASSES} ${selectedFacet === "ALL" ? TAB_ACTIVE : TAB_IDLE}`}
          >
            {labels.allTabLabel} ({items.length})
          </button>

          {facets.map((facet) => (
            <button
              key={facet}
              onClick={() => setSelectedFacet(facet)}
              className={`${TAB_CLASSES} whitespace-nowrap ${
                selectedFacet === facet ? TAB_ACTIVE : TAB_IDLE
              }`}
            >
              {facet} ({items.filter((i) => i.facet === facet).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-brand-black/20 bg-brand-off-white/50">
          <p className="text-2xl font-serif text-brand-black mb-2">{labels.emptyStateHeading}</p>
          <p className="text-sm text-brand-muted max-w-md mx-auto">{labels.emptyStateBody}</p>
        </div>
      ) : (
        <div className="space-y-24">
          {/* Cover feature */}
          {lead && (
            <article className="group bg-brand-white border border-brand-black/20 shadow-2xl p-8 lg:p-14 relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-brand-black pb-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-brand-gold/30 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {labels.leadBadge}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                    {lead.facet || labels.facetFallback}
                  </span>
                </div>
              </div>

              <div className="text-center max-w-5xl mx-auto mb-10">
                <Link href={href(lead.slug)}>
                  <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black group-hover:text-brand-gold transition-colors mb-6">
                    {lead.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-brand-charcoal/70 border-y border-brand-black/15 py-3 font-semibold bg-brand-off-white/60 max-w-3xl mx-auto">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-gold" />
                    {lead.authorName || labels.authorFallback}
                  </span>
                  <span className="flex items-center gap-1.5 border-l border-brand-black/15 pl-6">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    {readingMinutes(lead.content)} min read
                  </span>
                  {lead.publishDate && (
                    <span className="border-l border-brand-black/15 pl-6">
                      {new Date(lead.publishDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-brand-charcoal border-4 border-brand-black shadow-xl mb-12">
                <Image
                  src={imageFor(lead, 1400)}
                  alt={altFor(lead)}
                  fill
                  sizes="100vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Three-column briefing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-4 border-t border-brand-black/15">
                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    01 • Executive Overview
                  </span>
                  {lead.summary && (
                    <p className="text-sm md:text-base leading-relaxed text-brand-black font-serif italic border-l-2 border-brand-gold pl-3">
                      {lead.summary}
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-r border-brand-black/10 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                    {labels.briefingHeading}
                  </span>
                  <div className="text-xs text-brand-charcoal/80 space-y-2 leading-relaxed">
                    <p>
                      <strong>{labels.classificationLabel}:</strong>{" "}
                      {lead.facet || labels.classificationFallback}
                    </p>
                    <p>
                      <strong>{labels.sourceLabel}:</strong>{" "}
                      {labels.sourceValue ?? lead.authorName ?? "Seven Seas Intercontinental"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-start md:items-end">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold block mb-3">
                    {labels.documentHeading}
                  </span>
                  <Link
                    href={href(lead.slug)}
                    className="w-full inline-flex items-center justify-center gap-3 bg-brand-black text-brand-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 group/btn shadow-md"
                  >
                    <span>{labels.readMoreLabel}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Card grid */}
          {remaining.length > 0 && (
            <div className="pt-8">
              <div className="border-b-2 border-brand-black pb-4 mb-12 flex items-center justify-between">
                <h4 className="font-serif text-2xl md:text-3xl font-normal text-brand-black uppercase tracking-tight">
                  {labels.remainingHeading}
                </h4>
                <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">
                  {remaining.length} More {plural(remaining.length, labels.remainingNoun)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {remaining.map((item, index) => (
                  <article
                    key={item.id}
                    className="group bg-brand-white border border-brand-black/15 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal border-b border-brand-black/15">
                        <Image
                          src={imageFor(item, 800)}
                          alt={altFor(item)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-brand-black/90 backdrop-blur-md text-brand-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {item.facet || labels.cardFacetFallback}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-brand-white/90 text-brand-black font-mono text-[10px] px-2 py-0.5 border border-brand-black/20">
                          Col. 0{index + 2}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted mb-3 font-medium">
                          <span>{readingMinutes(item.content)} min read</span>
                          {item.publishDate && (
                            <span>
                              •{" "}
                              {new Date(item.publishDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <Link href={href(item.slug)}>
                          <h4 className="font-serif text-2xl font-normal leading-snug text-brand-black group-hover:text-brand-gold transition-colors mb-3 line-clamp-2">
                            {item.title}
                          </h4>
                        </Link>

                        {item.summary && (
                          <p className="text-xs text-brand-charcoal/80 line-clamp-3 mb-4 leading-relaxed font-sans">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-brand-black/10 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-semibold text-brand-black uppercase tracking-wider">
                        {item.authorName || labels.cardAuthorFallback}
                      </span>

                      <Link
                        href={href(item.slug)}
                        className="text-[11px] uppercase tracking-widest font-bold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-1"
                      >
                        {labels.cardLinkLabel}
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

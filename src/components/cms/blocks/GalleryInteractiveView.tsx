"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";
import { GalleryLightbox, type GalleryItem } from "./GalleryLightbox";
import { LayoutGrid, Grid, Search, SlidersHorizontal, MapPin, Maximize2, ShieldCheck, Sparkles } from "lucide-react";

interface GalleryInteractiveViewProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: GalleryItem[];
}

export function GalleryInteractiveView({
  eyebrow = "Visual Proof of Excellence",
  title = "Operational Facilities & Global Deployment Gallery",
  subtitle = "Inspect our trade test labs, pre-deployment orientation centers, corporate offices, and certified infrastructure across Nepal.",
  items,
}: GalleryInteractiveViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"grid" | "featured" | "masonry">("grid");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract unique categories & compute counts
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    items.forEach((item) => {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  // Filter items based on category & search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <section className="bg-brand-off-white py-16 lg:py-24 text-brand-charcoal border-t border-stone-200">
      <div className="container-wide mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-gold bg-amber-500/10 px-3 py-1 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                {eyebrow}
              </span>
            )}
            <h2 className="text-3xl font-serif font-bold tracking-tight text-brand-charcoal md:text-5xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-base text-stone-600 md:text-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-2 rounded-none border border-stone-300 bg-white p-1.5 shadow-sm self-start md:self-auto">
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                layoutMode === "grid"
                  ? "bg-brand-charcoal text-white"
                  : "text-stone-600 hover:text-brand-charcoal"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode("featured")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                layoutMode === "featured"
                  ? "bg-brand-charcoal text-white"
                  : "text-stone-600 hover:text-brand-charcoal"
              }`}
              title="Featured Spotlight View"
            >
              <Sparkles className="h-4 w-4" />
              <span>Spotlight</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode("masonry")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                layoutMode === "masonry"
                  ? "bg-brand-charcoal text-white"
                  : "text-stone-600 hover:text-brand-charcoal"
              }`}
              title="Editorial Masonry View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Masonry</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-stone-200 pb-6">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 border px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
                    isSelected
                      ? "border-brand-charcoal bg-brand-charcoal text-white shadow-md"
                      : "border-stone-300 bg-white text-stone-700 hover:border-brand-gold hover:text-brand-charcoal"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      isSelected ? "bg-brand-gold text-brand-black" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gallery media..."
              className="w-full border border-stone-300 bg-white py-2 pl-10 pr-4 text-xs text-brand-charcoal placeholder-stone-400 focus:border-brand-gold focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-brand-charcoal"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Empty Search Results */}
        {filteredItems.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center border border-dashed border-stone-300 bg-white p-12 text-center">
            <SlidersHorizontal className="h-10 w-10 text-stone-300 mb-3" />
            <h3 className="text-lg font-bold text-brand-charcoal">No media found</h3>
            <p className="text-sm text-stone-500 max-w-md mt-1">
              No items match your search &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 border border-brand-gold bg-brand-gold/10 px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-gold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : null}

        {/* Render Layout Mode 1: FEATURED SPOTLIGHT VIEW */}
        {layoutMode === "featured" && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Main Featured Spotlight Card */}
            <div className="lg:col-span-8 group relative overflow-hidden border border-stone-200 bg-white shadow-md cursor-pointer" onClick={() => setLightboxIndex(0)}>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                <Image
                  src={getCloudinaryImageUrl(filteredItems[0].imageUrl || "", { width: 1400, height: 900 })}
                  alt={filteredItems[0].title || "Featured gallery media"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-full border border-white/30 bg-slate-900/60 p-2.5 text-white backdrop-blur-md transition-all hover:bg-brand-gold hover:text-brand-charcoal"
                  aria-label="Expand view"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {filteredItems[0].category && (
                    <span className="inline-block border border-brand-gold bg-brand-gold/20 px-3 py-1 text-[11px] font-bold text-brand-gold uppercase tracking-wider mb-2">
                      {filteredItems[0].category}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold tracking-tight md:text-3xl text-white">
                    {filteredItems[0].title || "Operational Showcase"}
                  </h3>
                  {filteredItems[0].caption && (
                    <p className="mt-2 text-sm text-stone-200 line-clamp-2 max-w-2xl">
                      {filteredItems[0].caption}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Side Grid List */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {filteredItems.slice(1, 4).map((item, idx) => (
                <div
                  key={`feat-side-${idx}`}
                  onClick={() => setLightboxIndex(idx + 1)}
                  className="group flex gap-4 border border-stone-200 bg-white p-3 shadow-sm hover:border-brand-gold transition-all cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden bg-stone-100">
                    <Image
                      src={getCloudinaryImageUrl(item.imageUrl || "", { width: 300, height: 225 })}
                      alt={item.title || "Gallery item thumbnail"}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-1">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                        {item.category}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-brand-charcoal group-hover:text-amber-700 transition-colors line-clamp-1">
                      {item.title || "Facility Operational Detail"}
                    </h4>
                    {item.location && (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <MapPin className="h-3 w-3 text-brand-gold" />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render Layout Mode 2: STANDARD GRID VIEW */}
        {(layoutMode === "grid" || (layoutMode === "featured" && filteredItems.length > 4)) && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(layoutMode === "featured" ? filteredItems.slice(4) : filteredItems).map((item, index) => {
              const actualIndex = layoutMode === "featured" ? index + 4 : index;
              return (
                <article
                  key={`item-${item.imageUrl}-${index}`}
                  onClick={() => setLightboxIndex(actualIndex)}
                  className="group cursor-pointer overflow-hidden border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:shadow-lg flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                    <Image
                      src={getCloudinaryImageUrl(item.imageUrl!, { width: 900, height: 675 })}
                      alt={item.caption || item.title || "Gallery operational media"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/30" />
                    
                    {/* Hover expand icon */}
                    <div className="absolute right-3 top-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-sm hover:bg-brand-gold hover:text-brand-charcoal">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                    </div>

                    {item.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-slate-900/85 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 backdrop-blur-sm">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-brand-charcoal group-hover:text-amber-800 transition-colors">
                        {item.title || "Operational Facility"}
                      </h3>
                      {item.caption && (
                        <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    {item.location && (
                      <div className="mt-4 flex items-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] font-medium text-stone-500">
                        <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Render Layout Mode 3: EDITORIAL MASONRY VIEW */}
        {layoutMode === "masonry" && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item, index) => (
              <div
                key={`masonry-${index}`}
                onClick={() => setLightboxIndex(index)}
                className="break-inside-avoid group cursor-pointer overflow-hidden border border-stone-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:border-brand-gold hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={getCloudinaryImageUrl(item.imageUrl!, { width: 800, height: 600 })}
                    alt={item.title || "Masonry gallery image"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  {item.category && (
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-brand-charcoal mt-0.5">
                    {item.title || "Facility Media"}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal Trigger */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
        />
      )}
    </section>
  );
}

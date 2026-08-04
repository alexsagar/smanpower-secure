"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

export type GalleryViewerItem = { imageUrl: string; title?: string };

export function GalleryViewer({
  items,
  title,
  description,
}: {
  items: GalleryViewerItem[];
  title: string;
  description: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const previews = items.slice(1, 5);
  const remaining = Math.max(0, items.length - 5);

  const previous = useCallback(() => setActiveIndex((index) => index === null ? null : (index - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setActiveIndex((index) => index === null ? null : (index + 1) % items.length), [items.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, next, previous]);

  return (
    <>
      <article className="flex h-full flex-col bg-white">
        <button type="button" onClick={() => setActiveIndex(0)} className="relative block aspect-[16/9] w-full overflow-hidden" aria-label={`View all ${items.length} photos in ${title || "this album"}`}>
          <OptimizedImage src={items[0].imageUrl} preset="galleryThumbnail" alt={items[0].title || title || "Gallery album"} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
          <span className="absolute right-3 top-3 bg-brand-black/90 px-3 py-1.5 text-xs font-semibold text-white">{items.length} {items.length === 1 ? "photo" : "photos"}</span>
        </button>

        {previews.length ? (
          <div className="grid grid-cols-4 gap-0.5 bg-gray-200">
            {previews.map((item, previewIndex) => {
              const itemIndex = previewIndex + 1;
              const showRemaining = previewIndex === previews.length - 1 && remaining > 0;
              return (
                <button key={`${item.imageUrl}-${itemIndex}`} type="button" onClick={() => setActiveIndex(itemIndex)} className="relative aspect-[4/3] overflow-hidden bg-gray-100" aria-label={`Open photo ${itemIndex + 1} of ${items.length}`}>
                  <OptimizedImage src={item.imageUrl} preset="galleryThumbnail" alt={item.title || `Gallery photo ${itemIndex + 1}`} fill sizes="(max-width: 768px) 25vw, 10vw" />
                  {showRemaining ? <span className="absolute inset-0 flex items-center justify-center bg-black/65 text-lg font-semibold text-white">+{remaining}</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6">
          {title.trim() ? <h2 className="card-title text-brand-charcoal">{title}</h2> : null}
          {description.trim() ? <p className={`${title.trim() ? "mt-3" : ""} text-base leading-relaxed text-brand-muted`}>{description}</p> : null}
          <button type="button" onClick={() => setActiveIndex(0)} className="mt-6 flex w-fit items-center gap-3 bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black transition-colors hover:bg-brand-black hover:text-white">
            View All Images <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </article>

      {activeItem && (
        <div role="dialog" aria-modal="true" aria-label={activeItem.title || "Gallery image"} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close enlarged image" className="absolute right-4 top-4 p-3 text-white"><X aria-hidden /></button>
          <button type="button" onClick={previous} aria-label="Previous gallery image" className="absolute left-2 p-3 text-white sm:left-6"><ChevronLeft aria-hidden className="size-8" /></button>
          <figure className="max-h-full max-w-full">
            {/* Rendered only while the lightbox is open, so the full-size
                variant is never fetched during the initial page load. */}
            <OptimizedImage src={activeItem.imageUrl} preset="galleryLightbox" alt={activeItem.title || "Gallery image"} className="max-h-[85vh] w-auto max-w-full" />
            {activeItem.title?.trim() ? <figcaption className="pt-3 text-center text-sm text-white">{activeItem.title}</figcaption> : null}
          </figure>
          <button type="button" onClick={next} aria-label="Next gallery image" className="absolute right-2 p-3 text-white sm:right-6"><ChevronRight aria-hidden className="size-8" /></button>
        </div>
      )}
    </>
  );
}

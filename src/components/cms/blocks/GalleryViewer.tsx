"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

export type GalleryViewerItem = { imageUrl: string; title?: string };

export function GalleryViewer({ items }: { items: GalleryViewerItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

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
      <div className="container-wide mx-auto grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const title = item.title?.trim() || "Gallery image";
          return (
            <figure key={`${item.imageUrl}-${index}`} className="overflow-hidden bg-white">
              <button type="button" onClick={() => setActiveIndex(index)} className="relative block aspect-[4/3] w-full" aria-label={`Enlarge ${title}`}>
                <Image src={getCloudinaryImageUrl(item.imageUrl, { width: 960, height: 720 })} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </button>
              {item.title?.trim() ? <figcaption className="px-3 py-2 text-xs text-brand-charcoal">{item.title}</figcaption> : null}
            </figure>
          );
        })}
      </div>

      {activeItem && (
        <div role="dialog" aria-modal="true" aria-label={activeItem.title || "Gallery image"} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close enlarged image" className="absolute right-4 top-4 p-3 text-white"><X aria-hidden /></button>
          <button type="button" onClick={previous} aria-label="Previous gallery image" className="absolute left-2 p-3 text-white sm:left-6"><ChevronLeft aria-hidden className="size-8" /></button>
          <figure className="max-h-full max-w-full">
            <Image src={getCloudinaryImageUrl(activeItem.imageUrl, { width: 1920, height: 1440 })} alt={activeItem.title || "Gallery image"} width={1920} height={1440} sizes="100vw" className="max-h-[85vh] w-auto max-w-full object-contain" />
            {activeItem.title?.trim() ? <figcaption className="pt-3 text-center text-sm text-white">{activeItem.title}</figcaption> : null}
          </figure>
          <button type="button" onClick={next} aria-label="Next gallery image" className="absolute right-2 p-3 text-white sm:right-6"><ChevronRight aria-hidden className="size-8" /></button>
        </div>
      )}
    </>
  );
}

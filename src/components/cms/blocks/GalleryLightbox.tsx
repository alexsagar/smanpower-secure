"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag, Maximize2, Share2, Download } from "lucide-react";

export type GalleryItem = {
  imageUrl?: string;
  title?: string;
  caption?: string;
  category?: string;
  location?: string;
  date?: string;
  tags?: string[];
};

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function GalleryLightbox({
  items,
  currentIndex,
  onClose,
  onSelectIndex,
}: GalleryLightboxProps) {
  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleNext, handlePrev, onClose]);

  if (!currentItem || !currentItem.imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || "Gallery image detail"}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold">
            {currentItem.category || "Media Gallery"}
          </span>
          <span className="text-xs text-stone-300">
            {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: currentItem.title || "Gallery Image", url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="rounded-full p-2 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <a
            href={currentItem.imageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Download full size"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
            title="Close viewer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
        {/* Navigation Buttons */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/60 p-3 text-white backdrop-blur-sm transition-all hover:border-brand-gold hover:bg-brand-gold hover:text-brand-charcoal"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/60 p-3 text-white backdrop-blur-sm transition-all hover:border-brand-gold hover:bg-brand-gold hover:text-brand-charcoal"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Container */}
        <div className="relative flex max-h-[70vh] w-full max-w-5xl flex-1 items-center justify-center">
          <Image
            src={getCloudinaryImageUrl(currentItem.imageUrl, { width: 1600, height: 1200 })}
            alt={currentItem.caption || currentItem.title || "Gallery detailed view"}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        {/* Captions & Info Drawer */}
        <div className="mt-4 w-full max-w-4xl rounded-none border border-white/15 bg-slate-900/80 p-6 text-white backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              {currentItem.title && (
                <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  {currentItem.title}
                </h3>
              )}
              {currentItem.caption && (
                <p className="text-sm leading-relaxed text-stone-200">
                  {currentItem.caption}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 shrink-0">
              {currentItem.location && (
                <span className="flex items-center gap-1 border border-white/10 bg-white/5 px-2.5 py-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                  {currentItem.location}
                </span>
              )}
              {currentItem.date && (
                <span className="flex items-center gap-1 border border-white/10 bg-white/5 px-2.5 py-1">
                  <Calendar className="h-3.5 w-3.5 text-brand-gold" />
                  {currentItem.date}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {items.length > 1 && (
        <div className="border-t border-white/10 bg-slate-950/90 py-3 px-4 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
            {items.map((item, idx) => {
              if (!item.imageUrl) return null;
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`relative h-14 w-20 overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-brand-gold opacity-100 scale-105"
                      : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={getCloudinaryImageUrl(item.imageUrl, { width: 160, height: 120 })}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

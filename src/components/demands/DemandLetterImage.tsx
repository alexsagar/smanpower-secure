"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

interface DemandLetterImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * Demand letters are scanned, text-heavy documents in any aspect ratio (the
 * common wide form is ~1200x399). They are delivered with `c_limit` and shown
 * with `object-contain`, so nothing is ever cropped and a 1200px source is
 * never upscaled. The lightbox variant is not rendered until the dialog opens,
 * and no raw-original link or download control is offered.
 */
export function DemandLetterImage({ src, alt, width, height }: DemandLetterImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  const close = () => dialogRef.current?.close();

  return (
    <>
      <figure className="mb-8">
        <button
          type="button"
          onClick={show}
          aria-label="Open full demand letter image"
          className="group relative flex w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-sm border border-brand-charcoal/10 bg-brand-charcoal/5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
        >
          <OptimizedImage
            src={src}
            preset="demandLetterDetail"
            alt={alt}
            width={width}
            height={height}
            className="h-auto max-h-[80vh] w-auto max-w-full"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-sm bg-brand-black/80 px-3 py-2 text-xs font-semibold text-white opacity-90">
            <Maximize2 className="size-4" aria-hidden /> View full image
          </span>
        </button>
      </figure>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        aria-label="Full demand letter image"
        className="m-auto max-h-[100dvh] w-full max-w-none overflow-y-auto bg-transparent p-3 backdrop:bg-black/85 open:block sm:p-6"
      >
        <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-[2000px] flex-col items-center sm:min-h-[calc(100dvh-3rem)]">
          <div className="sticky top-0 z-10 flex w-full justify-end pb-2">
            <button
              type="button"
              onClick={close}
              aria-label="Close full demand letter image"
              className="rounded-sm bg-white p-3 text-brand-black shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <X aria-hidden />
            </button>
          </div>
          {/* Only requested once the visitor actually opens the lightbox. */}
          {open ? (
            <OptimizedImage
              src={src}
              preset="demandLetterLightbox"
              alt=""
              width={width}
              height={height}
              className="h-auto w-auto max-w-full"
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
}

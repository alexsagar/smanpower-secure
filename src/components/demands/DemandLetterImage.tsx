"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

interface DemandLetterImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function DemandLetterImage({ src, alt, width = 1200, height = 1600 }: DemandLetterImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const displaySrc = getCloudinaryImageUrl(src, { width: 1200 });
  const enlargedSrc = getCloudinaryImageUrl(src, { width: 2000 });

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
          <Image
            src={displaySrc}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
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
          <Image
            src={enlargedSrc}
            alt=""
            width={width}
            height={height}
            sizes="100vw"
            className="h-auto w-auto max-w-full object-contain"
          />
        </div>
      </dialog>
    </>
  );
}

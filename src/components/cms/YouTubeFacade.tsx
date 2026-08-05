"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube embed.
 *
 * The real iframe pulls ~970KB of player JS and lands a ~200ms long task on the
 * main thread, all before anyone has asked to watch anything. `loading="lazy"`
 * does not prevent this: Chrome's viewport threshold is generous enough that a
 * below-the-fold embed still loads on a desktop viewport, which a Lighthouse
 * trace of this page confirmed.
 *
 * So the player is only mounted on click. Until then this is a poster and a
 * button, and the third party is never contacted.
 */
export function YouTubeFacade({
  videoId,
  title,
  posterSrc,
  className,
}: {
  videoId: string;
  title: string;
  posterSrc?: string;
  className?: string;
}) {
  const [isActivated, setIsActivated] = useState(false);

  if (isActivated) {
    return (
      <iframe
        // autoplay is honoured here because the iframe is created by a click,
        // so the gesture carries over and the viewer does not press play twice.
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsActivated(true)}
      aria-label={`Play video: ${title}`}
      className={`group/yt block w-full cursor-pointer border-0 p-0 ${className ?? ""}`.trim()}
    >
      {/* ponytail: YouTube's own thumbnail when the CMS has no poster. Not
          Cloudinary-optimised, but it is ~30KB against the 970KB it replaces. */}
      <img
        src={posterSrc || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-brand-black/20 transition-colors group-hover/yt:bg-brand-black/35">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-black/70 backdrop-blur-sm transition-transform duration-300 group-hover/yt:scale-110">
          {/* Play triangle. An SVG here avoids pulling an icon for one glyph. */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6 text-brand-white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}

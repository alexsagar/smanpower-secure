"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type ManagedVideoProps = {
  src: string;
  posterSrc?: string;
  mobileFallbackSrc?: string;
  alt: string;
  containerClassName?: string;
  videoClassName?: string;
  fallbackClassName?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  priority?: boolean;
  showPlaybackToggle?: boolean;
  decorative?: boolean;
};

export function ManagedVideo({
  src,
  posterSrc,
  mobileFallbackSrc,
  alt,
  containerClassName,
  videoClassName,
  fallbackClassName,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = false,
  preload = "metadata",
  priority = false,
  showPlaybackToggle = false,
  decorative = false,
}: ManagedVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const fallbackSrc = posterSrc || mobileFallbackSrc;
  const hasMobileFallback = Boolean(mobileFallbackSrc);
  const showVideo = !hasError;

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play().catch(() => undefined);
      setIsPlaying(true);
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  return (
    <div className={containerClassName}>
      {mobileFallbackSrc ? (
        <Image
          src={mobileFallbackSrc}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover md:hidden ${fallbackClassName || ""}`}
        />
      ) : null}

      {fallbackSrc ? (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover ${hasMobileFallback ? "hidden md:block" : ""} ${fallbackClassName || ""}`}
        />
      ) : null}

      {showVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={posterSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={controls}
          preload={preload}
          aria-hidden={decorative || undefined}
          onError={() => setHasError(true)}
          className={`${hasMobileFallback ? "hidden md:block" : ""} motion-reduce:hidden ${videoClassName || ""}`}
        >
          {alt}
        </video>
      ) : null}

      {showPlaybackToggle && autoPlay ? (
        <button
          type="button"
          onClick={togglePlayback}
          className="motion-reduce:hidden absolute bottom-6 right-6 z-20 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-black/75"
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
        >
          {isPlaying ? "Pause video" : "Play video"}
        </button>
      ) : null}
    </div>
  );
}

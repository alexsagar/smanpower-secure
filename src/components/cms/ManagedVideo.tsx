"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
import Image from "next/image";

type ManagedVideoProps = {
  src: string;
  sources?: Array<{ src: string; type: string }>;
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
  sources,
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
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

  const fallbackSrc = posterSrc || mobileFallbackSrc;
  const hasMobileFallback = Boolean(mobileFallbackSrc);
  const showVideo = !hasError;
  // The video is CSS-hidden for reduced-motion users, so keep the fallback
  // image visible for them — otherwise a "ready" video leaves a black area.
  const showFallback = Boolean(fallbackSrc) && (!isReady || hasError || prefersReducedMotion);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React does not reliably set the `muted` DOM *property* from the JSX prop,
    // so browsers see an unmuted autoplay and block it. Force it here, then kick
    // off playback imperatively (respecting reduced-motion, which keeps the
    // poster fallback instead).
    video.muted = muted;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setIsReady(true);
      setIsPlaying(!video.paused);
    }

    if (autoPlay && !prefersReducedMotion) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => undefined);
    }
  }, [src, muted, autoPlay, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) requestAnimationFrame(() => setShouldLoad(true));
  }, [prefersReducedMotion]);

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

      {showFallback && fallbackSrc ? (
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
          src={shouldLoad && !sources?.length ? src : undefined}
          poster={posterSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={controls}
          preload={shouldLoad ? preload : "none"}
          aria-hidden={decorative || undefined}
          onError={() => setHasError(true)}
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onPlaying={() => {
            setIsReady(true);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          className={`${hasMobileFallback ? "hidden md:block" : ""} motion-reduce:hidden ${videoClassName || ""}`}
        >
          {shouldLoad && sources?.map((source) => (
            <source key={`${source.type}:${source.src}`} src={source.src} type={source.type} />
          ))}
          {alt}
        </video>
      ) : null}

      {showPlaybackToggle && autoPlay && showVideo && isReady ? (
        <button
          type="button"
          onClick={togglePlayback}
          className="motion-reduce:hidden absolute bottom-6 right-6 z-20 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-black/75"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? "Pause video" : "Play video"}
        </button>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  buildCloudinarySrcSet,
  getCloudinaryImageUrl,
  isCloudinaryImageUrl,
} from "@/lib/cloudinary-delivery";
import { MEDIA_PRESETS } from "@/lib/media-presets";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMediaQuery(query: string) {
  return (callback: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  };
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeMediaQuery(query),
    () => window.matchMedia(query).matches,
    // Server and first client render agree on `false`, so nothing depending on a
    // media query can leak into the SSR markup.
    () => false
  );
}

/** Data Saver is a static preference for the life of the page. */
const subscribeNever = () => () => {};

/**
 * Data Saver ("Reduce data usage"). Chromium-only; browsers without the API
 * report no preference, which is the correct default.
 *
 * Read synchronously rather than in an effect: an effect would let the video
 * mount for one commit and start fetching before we could unmount it.
 */
function allowsDataHeavyMedia(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData !== true;
}

/**
 * A video is worth its bytes only with motion allowed and data saving off, and
 * — when `minWidth` is set — on a large enough viewport.
 *
 * The viewport test resolves to `false` during SSR, so a gated video (the hero)
 * is absent from the server HTML entirely and a phone never receives it. CSS
 * hiding would still download it. An ungated inline video has no `minWidth`, so
 * it still server-renders normally.
 */
function useVideoEligibility(minWidth?: number): boolean {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isWideEnough = useMediaQuery(minWidth ? `(min-width: ${minWidth}px)` : "all");
  const allowsData = useSyncExternalStore(subscribeNever, allowsDataHeavyMedia, () => true);

  return allowsData && !prefersReducedMotion && (!minWidth || isWideEnough);
}

type PosterImageProps = {
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Art-directed poster. `<picture>` lets the browser fetch exactly one
 * candidate, unlike two CSS-hidden <img> elements, which browsers download both
 * of.
 */
function PosterImage({ src, mobileSrc, alt, className, priority }: PosterImageProps) {
  const preset = MEDIA_PRESETS.heroPoster;
  const transform = { crop: preset.crop, quality: preset.quality, width: preset.width } as const;

  const desktopSrc = isCloudinaryImageUrl(src) ? getCloudinaryImageUrl(src, transform) : src;
  const desktopSrcSet = buildCloudinarySrcSet(src, preset.widths, transform);
  const mobileSrcSet = mobileSrc
    ? buildCloudinarySrcSet(mobileSrc, [480, 640, 768, 1024], transform)
    : undefined;

  return (
    <picture>
      {mobileSrc ? (
        <source media="(max-width: 767px)" srcSet={mobileSrcSet ?? mobileSrc} sizes="100vw" />
      ) : null}
      {/* Cloudinary sizes these already; art direction needs a real <picture>. */}
      <img
        src={desktopSrc}
        srcSet={desktopSrcSet}
        sizes="100vw"
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`.trim()}
      />
    </picture>
  );
}

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
  /**
   * Below this viewport width the video is never mounted and the poster is the
   * whole experience. Omit for inline videos that should play at any size.
   */
  posterOnlyBelowWidth?: number;
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
  posterOnlyBelowWidth,
}: ManagedVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isEligible = useVideoEligibility(posterOnlyBelowWidth);
  // A failed video never retries: one error settles on the poster for good.
  const showVideo = isEligible && !hasError;
  const fallbackSrc = posterSrc || mobileFallbackSrc;
  // Keep the poster painted until the video can actually show a frame, so the
  // hero never flashes a black box.
  const showFallback = Boolean(fallbackSrc) && (!showVideo || !isReady);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    // React does not reliably set the `muted` DOM *property* from the JSX prop,
    // so browsers see an unmuted autoplay and block it. Force it here, then kick
    // off playback imperatively.
    video.muted = muted;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setIsReady(true);
      setIsPlaying(!video.paused);
    }

    if (autoPlay) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => undefined);
    }
  }, [src, muted, autoPlay, showVideo]);

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
      {showFallback && fallbackSrc ? (
        <PosterImage
          src={fallbackSrc}
          mobileSrc={mobileFallbackSrc}
          alt={alt}
          priority={priority}
          className={fallbackClassName}
        />
      ) : null}

      {showVideo ? (
        <video
          ref={videoRef}
          src={sources?.length ? undefined : src}
          poster={posterSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={controls}
          preload={preload}
          // Decorative background footage carries no information and must not be
          // announced or reachable by keyboard.
          aria-hidden={decorative || undefined}
          tabIndex={decorative ? -1 : undefined}
          onError={() => setHasError(true)}
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onPlaying={() => {
            setIsReady(true);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          className={`transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"} ${videoClassName || ""}`}
        >
          {sources?.map((source) => (
            <source key={`${source.type}:${source.src}`} src={source.src} type={source.type} />
          ))}
          {decorative ? null : alt}
        </video>
      ) : null}

      {showPlaybackToggle && autoPlay && showVideo && isReady ? (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute bottom-6 right-6 z-20 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-black/75"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? "Pause video" : "Play video"}
        </button>
      ) : null}
    </div>
  );
}

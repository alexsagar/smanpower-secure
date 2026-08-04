// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { DynamicHero } from "./DynamicHero";
import { ManagedVideo } from "./ManagedVideo";
import type { CmsHeroSection } from "@/types/content";

const VIDEO_URL = "https://res.cloudinary.com/demo/video/upload/v1720000000/seven-seas-cms/cms_video_1.mp4";

/**
 * Drive the environment signals the hero consults: viewport width, motion
 * preference and Data Saver.
 */
function setEnvironment({
  width = 1440,
  reducedMotion = false,
  saveData = false,
}: { width?: number; reducedMotion?: boolean; saveData?: boolean } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const minWidth = query.match(/min-width:\s*(\d+)px/);
      const matches = query.includes("prefers-reduced-motion")
        ? reducedMotion
        : minWidth
          ? width >= Number(minWidth[1])
          : true;
      return {
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    })
  );
  Object.defineProperty(window.navigator, "connection", {
    value: { saveData },
    configurable: true,
  });
  // jsdom does not implement media playback.
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
}

const hero: CmsHeroSection = {
  id: "hero-1",
  pageSlug: "home",
  heroType: "video",
  richHeading: { type: "doc", content: [] },
  overlayEnabled: true,
  textAlignment: "center",
  verticalAlignment: "center",
  video: {
    id: "video-1",
    source: "CLOUDINARY",
    cloudinaryPublicId: "seven-seas-cms/cms_video_1",
    secureUrl: VIDEO_URL,
    resourceType: "video",
    fileName: "cms_video_1.mp4",
    altText: "Hero video",
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("hero video delivery", () => {
  it("plays an optimised derivative, never the raw master", () => {
    setEnvironment();
    render(<DynamicHero hero={hero} />);

    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    const src = video!.getAttribute("src")!;

    expect(src).not.toBe(VIDEO_URL);
    expect(src).toContain("c_limit");
    expect(src).toContain("w_1600");
    expect(src).toContain("fps_24");
    expect(src).toContain("ac_none");
    expect(src).toContain("q_auto:eco");
    expect(src).toContain("f_auto:video");
    // The original CMS asset is still what is addressed.
    expect(src).toContain("/v1720000000/seven-seas-cms/cms_video_1.mp4");
  });

  it("preserves the full duration and keeps playback attributes", () => {
    setEnvironment();
    render(<DynamicHero hero={hero} />);

    const video = document.querySelector("video")!;
    const transform = video.getAttribute("src")!.split("/upload/")[1].split("/")[0];
    expect(transform).not.toMatch(/(^|,)du_/);
    expect(transform).not.toMatch(/(^|,)eo_/);

    expect(video.muted).toBe(true);
    expect(video.hasAttribute("controls")).toBe(false);
    expect(video.getAttribute("playsinline")).not.toBeNull();
    expect(video.loop).toBe(true);
  });

  it("keeps a decorative hero video out of the accessibility tree and tab order", () => {
    setEnvironment();
    render(<DynamicHero hero={hero} />);

    const video = document.querySelector("video")!;
    expect(video.getAttribute("aria-hidden")).toBe("true");
    expect(video.getAttribute("tabindex")).toBe("-1");
  });

  it("generates a poster from the video when the CMS supplies none", () => {
    setEnvironment();
    render(<DynamicHero hero={hero} />);

    const poster = document.querySelector("video")!.getAttribute("poster")!;
    expect(poster).toContain("/image/upload/");
    expect(poster).toContain("so_auto");
    expect(poster).toContain("q_auto:good");
    expect(poster).toContain("cms_video_1.jpg");
  });
});

describe("hero video mounting rules", () => {
  it("never puts the video in the DOM on mobile", () => {
    setEnvironment({ width: 390 });
    render(<DynamicHero hero={hero} />);

    expect(document.querySelector("video")).toBeNull();
    // Not merely hidden — the source must be absent entirely.
    expect(document.body.innerHTML).not.toContain(".mp4");
    expect(document.querySelector("img")).not.toBeNull();
  });

  it("never mounts the video for reduced-motion users", () => {
    setEnvironment({ width: 1440, reducedMotion: true });
    render(<DynamicHero hero={hero} />);

    expect(document.querySelector("video")).toBeNull();
    expect(document.body.innerHTML).not.toContain(".mp4");
  });

  it("never mounts the video when Data Saver is on", () => {
    setEnvironment({ width: 1440, saveData: true });
    render(<DynamicHero hero={hero} />);

    expect(document.querySelector("video")).toBeNull();
    expect(document.body.innerHTML).not.toContain(".mp4");
  });

  it("ships no video markup from the server, so mobile never downloads it", () => {
    const html = renderToStaticMarkup(<DynamicHero hero={hero} />);
    expect(html).not.toContain("<video");
    expect(html).not.toContain(".mp4");
    // The poster still paints immediately in SSR HTML.
    expect(html).toContain("<img");
    expect(html).toContain("so_auto");
  });

  it("keeps the poster visible and shows no broken element when the video fails", () => {
    setEnvironment();
    const { container } = render(
      <ManagedVideo
        src={VIDEO_URL}
        posterSrc="https://res.cloudinary.com/demo/image/upload/v1/poster.jpg"
        alt=""
        autoPlay
        muted
        loop
        decorative
        posterOnlyBelowWidth={768}
      />
    );

    fireEvent.error(container.querySelector("video")!);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).not.toBeNull();
  });
});

describe("hero video is CMS-driven", () => {
  it("follows a changed CMS selection with no code change", () => {
    setEnvironment();
    const swapped: CmsHeroSection = {
      ...hero,
      video: {
        ...hero.video!,
        cloudinaryPublicId: "another-folder/brand_new_clip",
        secureUrl: "https://res.cloudinary.com/demo/video/upload/v9/another-folder/brand_new_clip.webm",
        fileName: "brand_new_clip.webm",
      },
    };

    render(<DynamicHero hero={swapped} />);
    const src = document.querySelector("video")!.getAttribute("src")!;

    expect(src).toContain("/v9/another-folder/brand_new_clip.webm");
    expect(src).toContain("fps_24");
  });

  it("falls back to the poster-only path when no video is selected", () => {
    setEnvironment();
    render(<DynamicHero hero={{ ...hero, video: undefined }} />);
    expect(document.querySelector("video")).toBeNull();
  });

  it("shows a playback toggle with an accessible name once playing", async () => {
    setEnvironment();
    render(<DynamicHero hero={hero} />);

    fireEvent.playing(document.querySelector("video")!);
    expect(await screen.findByRole("button", { name: /pause video/i })).toBeTruthy();
  });
});

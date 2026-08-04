import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ManagedVideo } from "./ManagedVideo";

const POSTER = "https://res.cloudinary.com/demo/image/upload/v1/poster.jpg";
const MOBILE = "https://res.cloudinary.com/demo/image/upload/v1/mobile.jpg";

describe("ManagedVideo", () => {
  it("renders an ungated inline video on the server with its poster", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo
        src="https://cdn.example.com/selected-video.mp4"
        posterSrc={POSTER}
        alt="Section video"
        controls
        muted
        preload="none"
      />
    );

    expect(html).toContain("<video");
    expect(html).toContain("controls");
    expect(html).toContain('preload="none"');
    expect(html).toContain(`poster="${POSTER}"`);
    expect(html).toContain("playsInline");
    expect(html).not.toContain("autoplay");
    // The poster must never become the video's own source.
    expect(html).not.toContain(`<video src="${POSTER}"`);
  });

  it("omits a width-gated video from server markup entirely", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo
        src="https://cdn.example.com/hero.mp4"
        posterSrc={POSTER}
        alt=""
        autoPlay
        muted
        loop
        decorative
        posterOnlyBelowWidth={768}
      />
    );

    expect(html).not.toContain("<video");
    expect(html).not.toContain("hero.mp4");
    // The poster still paints straight away.
    expect(html).toContain("<img");
    expect(html).toContain("poster.jpg");
  });

  it("art-directs the poster with a real <picture> so only one file is fetched", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo
        src="https://cdn.example.com/hero.mp4"
        posterSrc={POSTER}
        mobileFallbackSrc={MOBILE}
        alt=""
        decorative
        posterOnlyBelowWidth={768}
      />
    );

    expect(html).toContain("<picture>");
    expect(html).toContain('media="(max-width: 767px)"');
    expect(html).toContain("mobile.jpg");
    // No pair of CSS-hidden images, which browsers download both of.
    expect(html).not.toContain("hidden md:block");
    expect(html).not.toContain("md:hidden");
  });

  it("optimises the poster rather than serving the master", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo src="https://cdn.example.com/a.mp4" posterSrc={POSTER} alt="" decorative />
    );

    expect(html).toContain("q_auto:good");
    expect(html).toContain("f_auto");
    expect(html).toContain("srcSet=");
    expect(html).not.toContain(`src="${POSTER}"`);
  });

  it("hides a decorative video from assistive tech and the tab order", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo src="https://cdn.example.com/a.mp4" alt="" autoPlay muted loop decorative />
    );

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
  });

  it("shows no playback toggle until the video is actually playing", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo src="https://cdn.example.com/a.mp4" alt="" autoPlay muted showPlaybackToggle />
    );
    expect(html).not.toContain("Pause video");
  });
});

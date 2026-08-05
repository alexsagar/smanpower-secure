import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { YouTubeFacade } from "./YouTubeFacade";

const VIDEO_ID = "2qbkSRWwHx8";
const POSTER = "https://res.cloudinary.com/demo/image/upload/v1/intro-poster.jpg";

describe("YouTubeFacade", () => {
  it("contacts no third party until the viewer asks for the video", () => {
    const html = renderToStaticMarkup(
      <YouTubeFacade videoId={VIDEO_ID} title="The Foundation" posterSrc={POSTER} />
    );

    // The whole point: ~970KB of player JS and a ~200ms long task stay unloaded.
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("youtube-nocookie.com");
    expect(html).toContain(POSTER);
    // Reachable by keyboard, and announced as what it does.
    expect(html).toContain("<button");
    expect(html).toContain('aria-label="Play video: The Foundation"');
  });

  it("falls back to the YouTube thumbnail when the CMS has no poster", () => {
    const html = renderToStaticMarkup(<YouTubeFacade videoId={VIDEO_ID} title="The Foundation" />);

    expect(html).toContain(`i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`);
    expect(html).not.toContain("<iframe");
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ManagedVideo } from "./ManagedVideo";

describe("ManagedVideo", () => {
  it("renders the selected video URL on the video element", () => {
    const html = renderToStaticMarkup(
      <ManagedVideo
        src="https://cdn.example.com/selected-video.mp4"
        posterSrc="https://cdn.example.com/poster.jpg"
        alt="Hero video"
        autoPlay
        muted
        loop
        showPlaybackToggle
      />
    );

    expect(html).toContain("<video");
    expect(html).toContain('src="https://cdn.example.com/selected-video.mp4"');
    expect(html).toContain('poster="https://cdn.example.com/poster.jpg"');
    expect(html).toContain("muted");
    expect(html).toContain("playsInline");
    expect(html).not.toContain('src="https://cdn.example.com/poster.jpg" autoPlay');
    expect(html).not.toContain("Pause background video");
  });
});

import { describe, expect, it } from "vitest";
import {
  isMediaField,
  isMediaValue,
  keyTokens,
  mediaFieldKind,
  mediaFieldPurpose,
} from "./media-fields";

describe("key tokenisation", () => {
  it("splits camelCase, snake_case and kebab-case", () => {
    expect(keyTokens("heroImage")).toEqual(["hero", "image"]);
    expect(keyTokens("poster_image")).toEqual(["poster", "image"]);
    expect(keyTokens("mobile-image-src")).toEqual(["mobile", "image", "src"]);
  });
});

describe("media field detection", () => {
  // Every field path found in the live CMS content audit.
  it.each([
    ["heroImage", "/images/hero.png"],
    ["imageSrc", "/images/x.png"],
    ["image", "/images/doc.png"],
    ["logo", ""],
    ["videoUrl", ""],
    ["posterImage", ""],
    ["backgroundImage", ""],
    ["thumbnail", ""],
  ])("detects %s", (key, value) => {
    expect(isMediaField(key, value)).toBe(true);
  });

  it("detects an empty media field by its key alone", () => {
    expect(isMediaField("heroImage", "")).toBe(true);
    expect(isMediaField("heroImage", null)).toBe(true);
  });

  it("detects an unconventionally named field by its value", () => {
    expect(isMediaField("background", "/images/noise.png")).toBe(true);
    expect(isMediaField("asset", "https://res.cloudinary.com/demo/a.jpg")).toBe(true);
  });

  // Regression guard: stories[].imageAlt exists in real content and is text.
  it.each(["imageAlt", "imageCaption", "videoTitle", "logoText", "imageDescription", "mediaType", "imageTag", "imageBadge"])(
    "does not treat %s as media",
    (key) => {
      expect(isMediaField(key, "A welder at work")).toBe(false);
    }
  );

  it("leaves ordinary copy fields alone", () => {
    expect(isMediaField("title", "Our Story")).toBe(false);
    expect(isMediaField("body", "We recruit across Nepal.")).toBe(false);
    expect(isMediaField("ctaHref", "/employers")).toBe(false);
    expect(isMediaField("eyebrow", "Real Results")).toBe(false);
  });

  it("ignores non-string values so arrays and objects keep their editors", () => {
    expect(isMediaField("images", [{ src: "/a.png" }])).toBe(false);
    expect(isMediaField("image", { url: "/a.png" })).toBe(false);
    expect(isMediaField("imageCount", 3)).toBe(false);
  });
});

describe("media value shape", () => {
  it("recognises file extensions, local paths and Cloudinary URLs", () => {
    expect(isMediaValue("/images/a.png")).toBe(true);
    expect(isMediaValue("https://res.cloudinary.com/x/image/upload/v1/a")).toBe(true);
    expect(isMediaValue("https://cdn.example.com/clip.mp4")).toBe(true);
    expect(isMediaValue("/employers")).toBe(false);
    expect(isMediaValue("Our Story")).toBe(false);
  });
});

describe("resource type and upload purpose", () => {
  it("routes video fields to video", () => {
    expect(mediaFieldKind("videoSrc")).toBe("VIDEO");
    expect(mediaFieldKind("clip", "https://cdn.example.com/a.mp4")).toBe("VIDEO");
    expect(mediaFieldPurpose("videoSrc")).toBe("cms_video");
  });

  it("routes image fields to image, with poster and mobile variants", () => {
    expect(mediaFieldKind("heroImage")).toBe("IMAGE");
    expect(mediaFieldPurpose("heroImage")).toBe("cms_image");
    expect(mediaFieldPurpose("posterImage")).toBe("cms_poster_image");
    expect(mediaFieldPurpose("mobileImage")).toBe("cms_mobile_image");
  });
});

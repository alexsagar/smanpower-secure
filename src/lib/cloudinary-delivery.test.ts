import { describe, expect, it } from "vitest";
import {
  buildCloudinarySrcSet,
  canRewriteCloudinaryUrl,
  getCloudinaryImageUrl,
  getCloudinaryPosterUrl,
  getCloudinaryVideoUrl,
  isAlreadyTransformedCloudinaryUrl,
  isCloudinaryImageUrl,
  isCloudinaryVideoUrl,
  parseCloudinaryUrl,
} from "./cloudinary-delivery";

const IMG = "https://res.cloudinary.com/demo/image/upload/v1720000000/seven-seas-cms/cms_hero_1.png";
const VIDEO = "https://res.cloudinary.com/demo/video/upload/v1720000000/seven-seas-cms/cms_video_1.mp4";

describe("parseCloudinaryUrl", () => {
  it("parses a versioned, foldered public id", () => {
    expect(parseCloudinaryUrl(IMG)).toMatchObject({
      cloudName: "demo",
      resourceType: "image",
      deliveryType: "upload",
      transforms: [],
      version: "v1720000000",
      publicIdPath: "seven-seas-cms/cms_hero_1.png",
    });
  });

  it("parses an unversioned URL without mistaking the public id for a transform", () => {
    // `cms_hero_1` looks like a transform param at a glance; the final segment
    // is always the public id, which is what keeps this correct.
    expect(parseCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/cms_hero_1.png"))
      .toMatchObject({ transforms: [], version: undefined, publicIdPath: "cms_hero_1.png" });
  });

  it("parses a nested folder path and a public id with no extension", () => {
    expect(parseCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/a/b/c/photo"))
      .toMatchObject({ transforms: [], publicIdPath: "a/b/c/photo" });
  });

  it("separates existing transforms from the public id", () => {
    expect(parseCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/w_800,c_fill/v1/f/x.jpg"))
      .toMatchObject({ transforms: ["w_800,c_fill"], version: "v1", publicIdPath: "f/x.jpg" });
  });

  it("returns null for non-Cloudinary, relative and malformed input", () => {
    expect(parseCloudinaryUrl("https://example.com/logo.png")).toBeNull();
    expect(parseCloudinaryUrl("/images/logo.png")).toBeNull();
    expect(parseCloudinaryUrl("not a url")).toBeNull();
    expect(parseCloudinaryUrl("")).toBeNull();
  });

  it("identifies resource types", () => {
    expect(isCloudinaryImageUrl(IMG)).toBe(true);
    expect(isCloudinaryVideoUrl(IMG)).toBe(false);
    expect(isCloudinaryVideoUrl(VIDEO)).toBe(true);
    expect(isCloudinaryImageUrl("https://example.com/a.png")).toBe(false);
    expect(isAlreadyTransformedCloudinaryUrl(IMG)).toBe(false);
    expect(isAlreadyTransformedCloudinaryUrl(getCloudinaryImageUrl(IMG, { width: 640 }))).toBe(true);
  });
});

describe("getCloudinaryImageUrl", () => {
  it("adds automatic delivery transforms, defaulting to a non-cropping c_limit", () => {
    const url = getCloudinaryImageUrl(IMG, { width: 640 });
    expect(url).toContain("/image/upload/c_limit,w_640,q_auto,f_auto/v1720000000/");
    expect(url).toContain("seven-seas-cms/cms_hero_1.png");
    expect(url).not.toContain("c_fill");
  });

  it("keeps PNG, JPG, JPEG and WebP sources on their original public id", () => {
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      const src = `https://res.cloudinary.com/demo/image/upload/v1/logo.${ext}`;
      expect(getCloudinaryImageUrl(src, { width: 320 })).toContain(`/v1/logo.${ext}`);
    }
  });

  it("crops to a box only when explicitly asked, and applies gravity there", () => {
    expect(getCloudinaryImageUrl(IMG, { width: 480, height: 600, crop: "fill", gravity: "face" }))
      .toContain("c_fill,w_480,h_600,g_face,q_auto,f_auto");
  });

  it("prefers stored focal point over gravity when cropping", () => {
    expect(
      getCloudinaryImageUrl(IMG, {
        width: 480,
        height: 600,
        crop: "fill",
        gravity: "face",
        focalPointX: 30,
        focalPointY: 70,
      })
    ).toContain("g_xy_center,x_30p,y_70p");
  });

  it("ignores gravity and focal point for non-cropping presets", () => {
    const url = getCloudinaryImageUrl(IMG, {
      width: 640,
      gravity: "face",
      focalPointX: 10,
      focalPointY: 10,
    });
    expect(url).not.toContain("g_face");
    expect(url).not.toContain("g_xy_center");
  });

  it("does not duplicate transforms already present on the URL", () => {
    const once = getCloudinaryImageUrl(IMG, { width: 640 });
    const twice = getCloudinaryImageUrl(once, { width: 640 });
    expect(twice).toBe(once);
    expect(twice.match(/q_auto/g)).toHaveLength(1);
    expect(twice.match(/f_auto/g)).toHaveLength(1);
    expect(twice.match(/w_640/g)).toHaveLength(1);
  });

  it("respects a quality/format an editor already put on the URL", () => {
    const src = "https://res.cloudinary.com/demo/image/upload/q_auto:best,f_webp/v1/x.png";
    const url = getCloudinaryImageUrl(src, { width: 320 });
    expect(url).toContain("q_auto:best");
    expect(url).not.toContain("f_auto");
  });

  it("preserves query strings, versions, folders and hyphenated/underscored ids", () => {
    const src = "https://res.cloudinary.com/demo/image/upload/v9/a-b/c_d-e/my-file_1.png?sig=abc#frag";
    const url = getCloudinaryImageUrl(src, { width: 320 });
    expect(url).toContain("/v9/a-b/c_d-e/my-file_1.png");
    expect(url).toContain("?sig=abc");
    expect(url).toContain("#frag");
  });

  it("passes through non-Cloudinary, local and malformed URLs unchanged", () => {
    expect(getCloudinaryImageUrl("https://example.com/logo.png", { width: 192 }))
      .toBe("https://example.com/logo.png");
    expect(getCloudinaryImageUrl("/images/seven-seas-logo.png", { width: 192 }))
      .toBe("/images/seven-seas-logo.png");
    expect(getCloudinaryImageUrl("::::", { width: 192 })).toBe("::::");
  });

  it("never rewrites signed, authenticated or private delivery URLs", () => {
    const signed = "https://res.cloudinary.com/demo/image/upload/s--Ab3dEf9x--/v1/secret.png";
    const authenticated = "https://res.cloudinary.com/demo/image/authenticated/v1/secret.png";
    const priv = "https://res.cloudinary.com/demo/image/private/v1/secret.png";

    expect(getCloudinaryImageUrl(signed, { width: 320 })).toBe(signed);
    expect(getCloudinaryImageUrl(authenticated, { width: 320 })).toBe(authenticated);
    expect(getCloudinaryImageUrl(priv, { width: 320 })).toBe(priv);
    expect(canRewriteCloudinaryUrl(parseCloudinaryUrl(signed))).toBe(false);
    expect(canRewriteCloudinaryUrl(parseCloudinaryUrl(authenticated))).toBe(false);
  });

  it("does not treat a video as an image or vice versa", () => {
    expect(getCloudinaryImageUrl(VIDEO, { width: 640 })).toBe(VIDEO);
    expect(getCloudinaryVideoUrl(IMG, { width: 640 })).toBe(IMG);
  });

  it("emits no credential-like material", () => {
    const url = getCloudinaryImageUrl(IMG, { width: 640 });
    expect(url).not.toMatch(/api_key|api_secret|signature=/i);
  });
});

describe("getCloudinaryVideoUrl", () => {
  it("limits width, drops fps, strips audio and negotiates format without trimming", () => {
    const url = getCloudinaryVideoUrl(VIDEO, {
      width: 1600,
      crop: "limit",
      quality: "auto:eco",
      format: "auto:video",
      extra: ["fps_24", "ac_none"],
    });

    expect(url).toContain("c_limit");
    expect(url).toContain("w_1600");
    expect(url).toContain("fps_24");
    expect(url).toContain("ac_none");
    expect(url).toContain("q_auto:eco");
    expect(url).toContain("f_auto:video");

    // Full duration must survive: no clipping params, ever. Checked against the
    // transformation segment alone — the public id itself contains "eo_".
    const transformSegment = parseCloudinaryUrl(url)!.transforms.join(",");
    expect(transformSegment).not.toMatch(/(^|,)du_/);
    expect(transformSegment).not.toMatch(/(^|,)eo_/);
    expect(transformSegment).not.toMatch(/(^|,)so_/);

    // The original master is still the addressed asset.
    expect(url).toContain("/v1720000000/seven-seas-cms/cms_video_1.mp4");
  });

  it("passes non-Cloudinary video URLs through", () => {
    expect(getCloudinaryVideoUrl("https://cdn.example.com/a.mp4", { width: 1600 }))
      .toBe("https://cdn.example.com/a.mp4");
  });
});

describe("getCloudinaryPosterUrl", () => {
  it("derives an optimised image frame from the video", () => {
    const poster = getCloudinaryPosterUrl(VIDEO, { width: 1600, quality: "auto:good" });
    // Served from the video resource type; /image/upload/ would 404.
    expect(poster).toContain("/video/upload/");
    expect(poster).toContain("so_auto");
    expect(poster).toContain("q_auto:good");
    expect(poster).toContain("f_auto");
    expect(poster).toContain("c_limit,w_1600");
    expect(poster).toContain("cms_video_1.jpg");
    expect(poster).not.toContain(".mp4");
  });

  it("supports an explicit early offset instead of so_auto", () => {
    expect(getCloudinaryPosterUrl(VIDEO, { startOffset: "1" })).toContain("so_1");
  });

  it("never rewrites the path to the image resource type", () => {
    // Verified against a live account: /image/upload/<video-public-id>.jpg
    // returns 404, because the public id exists only as a video asset. The
    // frame must be requested from /video/upload/ with a .jpg extension.
    const poster = getCloudinaryPosterUrl(VIDEO)!;
    expect(poster).not.toContain("/image/upload/");
    expect(poster).toContain("/video/upload/");
    expect(poster.endsWith(".jpg")).toBe(true);
  });

  it("returns undefined for images, non-Cloudinary and signed sources", () => {
    expect(getCloudinaryPosterUrl(IMG)).toBeUndefined();
    expect(getCloudinaryPosterUrl("https://cdn.example.com/a.mp4")).toBeUndefined();
    expect(
      getCloudinaryPosterUrl("https://res.cloudinary.com/demo/video/upload/s--Ab3--/v1/a.mp4")
    ).toBeUndefined();
  });
});

describe("buildCloudinarySrcSet", () => {
  it("emits one candidate per width with correct descriptors", () => {
    const srcSet = buildCloudinarySrcSet(IMG, [320, 640, 1200]);
    expect(srcSet).toContain("w_320");
    expect(srcSet).toContain(" 320w");
    expect(srcSet).toContain(" 1200w");
    expect(srcSet?.split(", ")).toHaveLength(3);
  });

  it("never offers a width larger than the source, so nothing is upscaled", () => {
    // The sample demand letter is 1200x399: 1600 and 2000 must not be requested.
    const srcSet = buildCloudinarySrcSet(IMG, [768, 1200, 1600, 2000], {}, 1200);
    expect(srcSet).toContain(" 1200w");
    expect(srcSet).not.toContain(" 1600w");
    expect(srcSet).not.toContain(" 2000w");
  });

  it("falls back to the smallest candidate when the source is tiny", () => {
    const srcSet = buildCloudinarySrcSet(IMG, [768, 1200], {}, 300);
    expect(srcSet?.split(", ")).toHaveLength(1);
    expect(srcSet).toContain(" 768w");
  });

  it("scales a cropped preset's height with each width", () => {
    const srcSet = buildCloudinarySrcSet(IMG, [360, 720], { width: 720, height: 420, crop: "fill" });
    expect(srcSet).toContain("w_360,h_210");
    expect(srcSet).toContain("w_720,h_420");
  });

  it("returns undefined for sources it must not rewrite", () => {
    expect(buildCloudinarySrcSet("https://example.com/a.png", [320])).toBeUndefined();
    expect(buildCloudinarySrcSet(VIDEO, [320])).toBeUndefined();
    expect(buildCloudinarySrcSet(IMG, [])).toBeUndefined();
  });
});

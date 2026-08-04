import { describe, expect, it } from "vitest";
import {
  HERO_VIDEO_PRESET,
  INLINE_VIDEO_PRESET,
  MEDIA_PRESETS,
  type MediaPresetName,
} from "./media-presets";
import {
  buildCloudinarySrcSet,
  getCloudinaryImageUrl,
  getCloudinaryVideoUrl,
  parseCloudinaryUrl,
} from "./cloudinary-delivery";

const IMG = "https://res.cloudinary.com/demo/image/upload/v1/seven-seas-cms/asset.png";
const VIDEO = "https://res.cloudinary.com/demo/video/upload/v1/seven-seas-cms/hero.mp4";

const names = Object.keys(MEDIA_PRESETS) as MediaPresetName[];

/** Delivery URL a preset produces, for assertions below. */
function deliver(name: MediaPresetName, src = IMG) {
  const preset = MEDIA_PRESETS[name];
  return getCloudinaryImageUrl(src, {
    width: preset.width,
    height: "height" in preset ? preset.height : undefined,
    crop: preset.crop,
    gravity: "gravity" in preset ? preset.gravity : undefined,
    quality: preset.quality,
    trim: "trim" in preset ? preset.trim : undefined,
  });
}

/** Presets that must never crop, because cropping destroys their content. */
const NEVER_CROP: MediaPresetName[] = [
  "clientLogo",
  "partnerLogo",
  "certificationLogo",
  "navigationLogo",
  "footerLogo",
  "certificateDocument",
  "licenceDocument",
  "generalDocument",
  "documentThumbnail",
  "demandLetterThumbnail",
  "demandLetterDetail",
  "demandLetterLightbox",
  "articleInline",
  "teamProfile",
  "galleryDetail",
  "galleryLightbox",
  "successStoryGallery",
];

describe("every preset", () => {
  it.each(names)("%s produces a valid, automatic, single delivery chain", (name) => {
    const url = deliver(name);
    const parsed = parseCloudinaryUrl(url)!;

    expect(parsed.transforms).toHaveLength(1);
    expect(parsed.publicIdPath).toBe("seven-seas-cms/asset.png");
    expect(parsed.version).toBe("v1");

    const segment = parsed.transforms[0];
    expect(segment).toMatch(/(^|,)q_auto/);
    expect(segment).toMatch(/(^|,)f_auto/);
    // A malformed chain (empty component, trailing comma) breaks delivery.
    expect(segment.split(",").every(Boolean)).toBe(true);
  });

  it.each(names)("%s declares a sane, ascending width ladder and real sizes", (name) => {
    const preset = MEDIA_PRESETS[name];
    const widths = [...preset.widths];

    expect(widths.length).toBeGreaterThan(0);
    // Ascending, no duplicates — the browser picks the first adequate candidate.
    expect(widths).toEqual([...new Set(widths)].sort((a, b) => a - b));
    // The `src` fallback sits inside the ladder. It may be below the largest
    // candidate: those exist for high-DPR screens, not for 1x layout.
    expect(preset.width).toBeGreaterThanOrEqual(Math.min(...widths));
    expect(Math.max(...widths)).toBeLessThanOrEqual(2400);
    expect(preset.sizes.trim()).not.toBe("");
    // `100vw` is only honest for genuinely full-bleed media.
    if (preset.sizes === "100vw") {
      expect(["heroImage", "heroPoster", "sectionBanner", "galleryLightbox", "demandLetterLightbox"])
        .toContain(name);
    }
  });

  it.each(names)("%s is idempotent — re-applying adds nothing", (name) => {
    expect(deliver(name, deliver(name))).toBe(deliver(name));
  });
});

describe("logos, documents and demand letters", () => {
  it.each(NEVER_CROP)("%s never crops and always contains", (name) => {
    const preset = MEDIA_PRESETS[name];
    expect(preset.crop).toBe("limit");
    expect(preset.fit).toBe("contain");
    expect(deliver(name)).not.toContain("c_fill");
    // Face detection must never touch a document or a logo.
    expect(deliver(name)).not.toContain("g_face");
  });

  it("keeps the hero poster uncropped by Cloudinary even though CSS covers it", () => {
    // The hero is a full-bleed background, so `object-cover` is the intended
    // layout — but Cloudinary must not bake a crop into the delivered frame.
    expect(MEDIA_PRESETS.heroPoster.crop).toBe("limit");
    expect(MEDIA_PRESETS.heroPoster.fit).toBe("cover");
    expect(deliver("heroPoster")).not.toContain("c_fill");
  });

  it("delivers logos at small widths, never at master size", () => {
    for (const name of ["clientLogo", "partnerLogo", "certificationLogo", "footerLogo", "navigationLogo"] as const) {
      expect(MEDIA_PRESETS[name].width).toBeLessThanOrEqual(320);
      expect(Math.max(...MEDIA_PRESETS[name].widths)).toBeLessThanOrEqual(320);
      expect(MEDIA_PRESETS[name].quality).toBe("auto:best");
    }
  });

  it("keeps document text sharp", () => {
    expect(MEDIA_PRESETS.certificateDocument.quality).toBe("auto:best");
    expect(MEDIA_PRESETS.demandLetterDetail.quality).toBe("auto:best");
    expect(MEDIA_PRESETS.demandLetterLightbox.quality).toBe("auto:best");
  });

  it("supports a wide 1200x399 demand letter without cropping or upscaling", () => {
    const detail = MEDIA_PRESETS.demandLetterDetail;
    const url = deliver("demandLetterDetail");
    expect(url).toContain("c_limit");
    expect(url).not.toContain("h_");

    // A 1200px-wide source must never be offered at the lightbox's 2000px.
    const srcSet = buildCloudinarySrcSet(
      IMG,
      MEDIA_PRESETS.demandLetterLightbox.widths,
      { width: MEDIA_PRESETS.demandLetterLightbox.width, crop: "limit" },
      1200
    );
    expect(srcSet).not.toContain(" 1600w");
    expect(srcSet).not.toContain(" 2000w");
    expect(detail.fit).toBe("contain");
  });

  it("supports a tall portrait document just as well", () => {
    // `c_limit` with only a width constraint preserves any aspect ratio.
    const srcSet = buildCloudinarySrcSet(IMG, [480, 640], { crop: "limit" }, 900);
    expect(srcSet).toContain(" 480w");
    expect(srcSet).not.toContain("h_");
  });
});

describe("intentionally cropped presets", () => {
  it("crops only where a fixed editorial box is the design", () => {
    const cropping = names.filter((name) => MEDIA_PRESETS[name].crop === "fill");
    expect(cropping.sort()).toEqual(
      [
        "articleCard",
        "avatar",
        "galleryThumbnail",
        "heroImage",
        "openGraph",
        "sectionBanner",
        "successStoryCard",
        "teamCard",
      ].sort()
    );
  });

  it("uses face gravity only on people", () => {
    const faceCropped = names.filter(
      (name) => "gravity" in MEDIA_PRESETS[name] && MEDIA_PRESETS[name].gravity === "face"
    );
    expect(faceCropped.sort()).toEqual(["avatar", "teamCard"]);
  });

  it("gives team cards a portrait box and profiles a larger uncropped view", () => {
    expect(deliver("teamCard")).toContain("c_fill,w_480,h_600,g_face");
    expect(deliver("teamProfile")).toContain("c_limit,w_1200");
    expect(MEDIA_PRESETS.teamProfile.width).toBeGreaterThan(MEDIA_PRESETS.teamCard.width);
  });

  it("builds a real 1200x630 social card", () => {
    const url = deliver("openGraph");
    expect(url).toContain("c_fill,w_1200,h_630");
    expect(url).toContain("q_auto:good");
  });
});

describe("loading priorities", () => {
  it("marks only genuine above-the-fold candidates eager", () => {
    const eager = names.filter((name) => MEDIA_PRESETS[name].loading === "eager");
    expect(eager.sort()).toEqual(["articleHero", "heroImage", "heroPoster", "navigationLogo"].sort());
  });

  it("lazy-loads every card, thumbnail, logo strip and lightbox variant", () => {
    for (const name of [
      "articleCard",
      "successStoryCard",
      "galleryThumbnail",
      "galleryLightbox",
      "clientLogo",
      "certificationLogo",
      "demandLetterLightbox",
      "teamCard",
    ] as const) {
      expect(MEDIA_PRESETS[name].loading).toBe("lazy");
    }
  });
});

describe("hero video preset", () => {
  const url = getCloudinaryVideoUrl(VIDEO, HERO_VIDEO_PRESET);
  const segment = parseCloudinaryUrl(url)!.transforms.join(",");

  it("limits width without cropping or upscaling", () => {
    expect(segment).toContain("c_limit");
    expect(segment).toContain("w_1600");
    expect(segment).not.toContain("c_fill");
  });

  it("reduces frame rate, removes audio and negotiates format automatically", () => {
    expect(segment).toContain("fps_24");
    expect(segment).toContain("ac_none");
    expect(segment).toContain("q_auto:eco");
    expect(segment).toContain("f_auto:video");
  });

  it("preserves the full duration", () => {
    expect(segment).not.toMatch(/(^|,)du_/);
    expect(segment).not.toMatch(/(^|,)eo_/);
    expect(segment).not.toMatch(/(^|,)so_/);
  });

  it("never renders the raw master and keeps the original asset addressed", () => {
    expect(url).not.toBe(VIDEO);
    expect(url).toContain("/v1/seven-seas-cms/hero.mp4");
  });

  it("carries no hardcoded public id, version, folder or filename", () => {
    const serialized = JSON.stringify(HERO_VIDEO_PRESET);
    expect(serialized).not.toMatch(/res\.cloudinary\.com|\/upload\/|v\d{6,}|\.mp4|\.webm|seven-seas/);
  });

  it("adapts to whatever the CMS currently holds, with no code change", () => {
    // A different cloud, folder, public id, version and container.
    const other = "https://res.cloudinary.com/other/video/upload/v999/new-folder/fresh-clip.webm";
    const next = getCloudinaryVideoUrl(other, HERO_VIDEO_PRESET);
    expect(next).toContain("/other/video/upload/");
    expect(next).toContain("/v999/new-folder/fresh-clip.webm");
    expect(next).toContain("fps_24");
  });

  it("keeps audio and full frame rate for inline content video", () => {
    const inline = parseCloudinaryUrl(getCloudinaryVideoUrl(VIDEO, INLINE_VIDEO_PRESET))!
      .transforms.join(",");
    expect(inline).not.toContain("ac_none");
    expect(inline).not.toContain("fps_");
    expect(inline).toContain("c_limit");
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OptimizedImage } from "./OptimizedImage";
import type { CmsMediaAsset } from "@/types/content";

const CLOUDINARY = "https://res.cloudinary.com/demo/image/upload/v1/seven-seas-cms/asset.png";

function asset(overrides: Partial<CmsMediaAsset> = {}): CmsMediaAsset {
  return {
    id: "m1",
    source: "CLOUDINARY",
    secureUrl: CLOUDINARY,
    resourceType: "image",
    fileName: "asset.png",
    altText: "Asset",
    mediaStatus: "REAL_APPROVED",
    visibility: "PUBLIC",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("OptimizedImage delivery path", () => {
  it("sends Cloudinary images straight to Cloudinary, never through /_next/image", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="contentImage" alt="Content" />
    );

    expect(html).toContain("res.cloudinary.com");
    expect(html).not.toContain("/_next/image");
    expect(html).toContain("srcSet=");
    expect(html).toContain("sizes=");
  });

  it("keeps next/image for local repository assets", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src="/images/seven-seas-logo.png" preset="footerLogo" alt="Seven Seas" />
    );

    expect(html).toContain("/_next/image");
    expect(html).not.toContain("res.cloudinary.com");
  });

  it("passes a non-Cloudinary remote URL through without transforming it", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src="https://example.com/photo.jpg" preset="contentImage" alt="Remote" />
    );
    expect(html).not.toContain("res.cloudinary.com");
  });

  it("applies exactly one transformation chain per image", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="articleCard" alt="Card" />
    );
    expect(html.match(/q_auto/g)?.length).toBeGreaterThan(0);
    // No chained /upload/…/…/ double transform.
    expect(html).not.toMatch(/\/upload\/[^/"]+\/[^/"]+\/v1\//);
  });
});

describe("OptimizedImage presets", () => {
  it("crops a team card to a portrait face box but not a team profile", () => {
    const card = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="teamCard" alt="Person, Role" />
    );
    const profile = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="teamProfile" alt="Person, Role" />
    );

    expect(card).toContain("c_fill");
    expect(card).toContain("g_face");
    expect(card).toContain("object-cover");
    expect(profile).toContain("c_limit");
    expect(profile).not.toContain("g_face");
    expect(profile).toContain("object-contain");
  });

  it("uses stored focal point instead of face detection when the CMS has one", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={asset({ focalPointX: 25, focalPointY: 75 })} preset="teamCard" alt="P" />
    );
    expect(html).toContain("x_25p");
    expect(html).toContain("y_75p");
    expect(html).not.toContain("g_face");
  });

  it("never crops a document or a logo and always contains it", () => {
    for (const preset of ["demandLetterDetail", "certificateDocument", "clientLogo"] as const) {
      const html = renderToStaticMarkup(
        <OptimizedImage src={CLOUDINARY} preset={preset} alt="Doc" />
      );
      expect(html).toContain("c_limit");
      expect(html).not.toContain("c_fill");
      expect(html).toContain("object-contain");
    }
  });

  it("does not upscale a source smaller than the preset ladder", () => {
    // The wide sample demand letter: 1200x399.
    const html = renderToStaticMarkup(
      <OptimizedImage
        src={asset({ width: 1200, height: 399 })}
        preset="demandLetterLightbox"
        alt="Demand letter"
      />
    );
    expect(html).toContain("1200w");
    expect(html).not.toContain("1600w");
    expect(html).not.toContain("2000w");
  });
});

describe("OptimizedImage sizing regressions", () => {
  it("does not crop twice when the layout already crops via fill", () => {
    // A cropping preset plus object-cover in a differently-shaped container cut
    // the image to one ratio and then again to the container's, zooming the
    // subject. With `fill`, Cloudinary must only limit resolution.
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="successStoryCard" alt="Story" fill />
    );

    expect(html).toContain("c_limit");
    expect(html).not.toContain("c_fill");
    expect(html).not.toContain("h_480");
    expect(html).not.toContain("g_auto");
  });

  it("still crops to the preset box when the layout does not", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="successStoryCard" alt="Story" />
    );
    expect(html).toContain("c_fill,w_720,h_480");
  });

  it("reports the delivered size, never the source's, so width-auto cannot blow up", () => {
    // A 2000x2000 logo delivered at 320px must not report width="2000": with
    // `w-auto` the browser would lay it out at full source size.
    const html = renderToStaticMarkup(
      <OptimizedImage
        src={asset({ width: 2000, height: 2000 })}
        preset="clientLogo"
        alt="Client"
        className="max-h-40 w-auto"
      />
    );

    expect(html).not.toContain('width="2000"');
    expect(html).not.toContain('height="2000"');
    expect(html).toContain('width="320"');
  });

  it("bounds logo height so a trimmed tall mark cannot tower over a wide one", () => {
    // e_trim strips a logo's baked-in padding; without a height bound the
    // artwork then fills the frame and renders far larger.
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="clientLogo" alt="Client" className="max-h-40 w-auto" />
    );

    expect(html).toContain("e_trim");
    expect(html).toContain("c_limit,w_320,h_160");
    // c_limit fits inside the box; it never crops the mark.
    expect(html).toContain("object-contain");
    expect(html).toContain('height="160"');
  });

  it("never upscales the reported box beyond a small source", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={asset({ width: 100, height: 50 })} preset="clientLogo" alt="Tiny" />
    );
    expect(html).toContain('width="100"');
  });
});

describe("OptimizedImage layout stability", () => {
  it("reserves the box for a cropping preset from the preset ratio", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="articleCard" alt="Card" />
    );
    expect(html).toContain("aspect-ratio:720 / 420");
  });

  it("reserves the natural ratio of a document from its stored dimensions", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={asset({ width: 1200, height: 399 })} preset="demandLetterDetail" alt="D" />
    );
    expect(html).toContain("aspect-ratio:1200 / 399");
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="399"');
  });

  it("invents no ratio for a document with unknown dimensions", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="demandLetterDetail" alt="D" />
    );
    expect(html).not.toContain("aspect-ratio");
  });
});

describe("OptimizedImage loading behaviour", () => {
  it("lazy-loads below-the-fold presets by default", () => {
    for (const preset of ["teamCard", "galleryThumbnail", "clientLogo", "articleCard"] as const) {
      const html = renderToStaticMarkup(
        <OptimizedImage src={CLOUDINARY} preset={preset} alt="x" />
      );
      expect(html).toContain('loading="lazy"');
      expect(html).not.toContain('fetchPriority="high"');
    }
  });

  it("marks an explicit priority image eager and high priority", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="heroImage" alt="" priority />
    );
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
  });
});

describe("OptimizedImage accessibility", () => {
  it("keeps an empty alt empty for decorative imagery", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="clientLogo" alt="" />
    );
    expect(html).toContain('alt=""');
  });

  it("preserves meaningful alt text verbatim", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="teamCard" alt="Asha Rai, Compliance Lead" />
    );
    expect(html).toContain('alt="Asha Rai, Compliance Lead"');
  });

  it("never renders a download control or a raw original link", () => {
    const html = renderToStaticMarkup(
      <OptimizedImage src={CLOUDINARY} preset="demandLetterLightbox" alt="Demand letter" />
    );
    expect(html).not.toContain("download");
    expect(html).not.toContain("<a ");
    // The untransformed master must never be the delivered source.
    expect(html).not.toContain(`src="${CLOUDINARY}"`);
  });
});

describe("OptimizedImage CMS compatibility", () => {
  it("optimises whatever the CMS holds now, with no code change for new uploads", () => {
    const first = renderToStaticMarkup(
      <OptimizedImage src={asset()} preset="articleCard" alt="a" />
    );
    const swapped = renderToStaticMarkup(
      <OptimizedImage
        src={asset({
          secureUrl: "https://res.cloudinary.com/demo/image/upload/v999/other-folder/new_upload.jpg",
        })}
        preset="articleCard"
        alt="a"
      />
    );

    expect(first).toContain("seven-seas-cms/asset.png");
    expect(swapped).toContain("other-folder/new_upload.jpg");
    // Same preset rules applied to both.
    for (const html of [first, swapped]) expect(html).toContain("c_fill,w_720,h_420");
  });

  it("accepts a bare URL, a mapped asset and a raw Prisma-shaped row alike", () => {
    const shapes = [
      CLOUDINARY,
      asset(),
      { fileUrl: CLOUDINARY, resourceType: "IMAGE" },
    ];
    for (const src of shapes) {
      const html = renderToStaticMarkup(
        <OptimizedImage src={src} preset="contentImage" alt="x" />
      );
      expect(html).toContain("q_auto:good");
    }
  });

  it("leaves a signed or authenticated asset completely untouched", () => {
    const signed = "https://res.cloudinary.com/demo/image/upload/s--Ab3dEf9x--/v1/secret.png";
    const html = renderToStaticMarkup(
      <OptimizedImage src={signed} preset="certificateDocument" alt="Certificate" />
    );
    expect(html).toContain(signed);
    expect(html).not.toContain("q_auto");
  });
});

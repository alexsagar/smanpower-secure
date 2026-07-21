import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IndustryGridBlock } from "./IndustryGridBlock";
import type { CmsContentBlock } from "@/types/content";

function block(industries: unknown[], extra: Record<string, unknown> = {}): CmsContentBlock {
  return {
    id: "block-1",
    blockKey: "home-industries",
    blockType: "industry_grid",
    pageSlug: "home",
    order: 0,
    visible: true,
    richHeading: { type: "doc", content: [] },
    content: { industries, ...extra },
  } as unknown as CmsContentBlock;
}

describe("IndustryGridBlock deployment counts", () => {
  it("renders the deployment count when the CMS provides one", () => {
    const html = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([
          { title: "Construction", href: "/industries/construction", deploymentCount: "18,400+" },
        ])}
      />
    );

    expect(html).toContain("Construction");
    expect(html).toContain("18,400+");
  });

  it("omits the count entirely for entries that do not define one", () => {
    // Backwards compatibility: every existing entry is {title, href} only.
    const html = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([{ title: "Security Services", href: "/industries/security-services" }])}
      />
    );

    expect(html).toContain("Security Services");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("+</p>");
  });

  it("renders mixed entries without breaking the grid", () => {
    const html = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([
          { title: "Construction", href: "/industries/construction", deploymentCount: "18,400+" },
          { title: "Hospitality", href: "/industries/hospitality" },
        ])}
      />
    );

    expect(html).toContain("18,400+");
    expect(html).toContain("Hospitality");
  });

  it("reveals the sector photo inside the hover panel when one is set", () => {
    const html = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([
          {
            title: "Construction",
            href: "/industries/construction",
            deploymentCount: "18,400+",
            image: "/images/site.png",
            imageAlt: "Welder on site",
          },
        ])}
      />
    );

    expect(html).toContain("Welder on site");
    expect(html).toContain("18,400+");
    // The photo must sit inside the sliding panel so the existing animation
    // reveals it: the image markup has to follow the panel's opening tag.
    const panelAt = html.indexOf("translate-y-full");
    const imageAt = html.indexOf("Welder on site");
    expect(panelAt).toBeGreaterThan(-1);
    expect(imageAt).toBeGreaterThan(panelAt);
  });

  it("falls back to the title for alt text when none is given", () => {
    const html = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([{ title: "Hospitality", href: "/x", image: "/images/h.png" }])}
      />
    );
    expect(html).toContain('alt="Hospitality"');
  });

  it("keeps the plain dark panel when no photo is set", () => {
    const html = renderToStaticMarkup(
      <IndustryGridBlock lang="en" block={block([{ title: "Security", href: "/x" }])} />
    );
    expect(html).toContain("translate-y-full");
    expect(html).not.toContain("<img");
  });

  it("shows the shared deployment label only when both label and count exist", () => {
    const withBoth = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([{ title: "A", href: "/x", deploymentCount: "9,500+" }], {
          deploymentLabel: "Workers Deployed",
        })}
      />
    );
    expect(withBoth).toContain("Workers Deployed");

    const noCount = renderToStaticMarkup(
      <IndustryGridBlock
        lang="en"
        block={block([{ title: "A", href: "/x" }], { deploymentLabel: "Workers Deployed" })}
      />
    );
    expect(noCount).not.toContain("Workers Deployed");
  });
});

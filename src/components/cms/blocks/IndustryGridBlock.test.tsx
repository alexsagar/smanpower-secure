import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IndustryGridBlock } from "./IndustryGridBlock";
import type { CmsContentBlock } from "@/types/content";

function block(industries: unknown[]): CmsContentBlock {
  return {
    id: "block-1",
    blockKey: "home-industries",
    blockType: "industry_grid",
    pageSlug: "home",
    order: 0,
    visible: true,
    richHeading: { type: "doc", content: [] },
    content: { industries },
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
});

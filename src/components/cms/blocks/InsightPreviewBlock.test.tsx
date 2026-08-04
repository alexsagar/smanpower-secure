import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InsightPreviewBlock } from "./InsightPreviewBlock";

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/media/OptimizedImage", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- minimal test double
  OptimizedImage: ({ alt }: { alt: string }) => <img alt={alt} data-insight-image />,
}));

describe("InsightPreviewBlock", () => {
  it("renders the saved category and featured image on homepage cards", () => {
    const html = renderToStaticMarkup(
      <InsightPreviewBlock
        block={{ content: { readArticleLabel: "Read Article" } } as never}
        lang="en"
        articles={[{
          category: "Global Workforce",
          date: "8/4/2026",
          title: "Workforce outlook",
          slug: "workforce-outlook",
          image: { secureUrl: "https://example.test/workforce.webp" } as never,
          imageAlt: "Workers attending an orientation",
        }]}
      />
    );

    expect(html).toContain("Global Workforce");
    expect(html).toContain("data-insight-image");
    expect(html).toContain("Workers attending an orientation");
  });
});

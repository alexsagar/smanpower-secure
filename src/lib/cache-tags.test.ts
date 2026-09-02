import { describe, expect, it } from "vitest";
import { CACHE_REVALIDATE } from "./cache-tags";

describe("public CMS cache policy", () => {
  it("keeps editorial fallbacks above Neon's autosuspend window", () => {
    expect(CACHE_REVALIDATE).toMatchObject({
      layout: 86400,
      pages: 86400,
      news: 86400,
      insights: 86400,
      stories: 86400,
      demands: 3600,
      careers: 3600,
      sitemap: 86400,
    });
    expect(Object.values(CACHE_REVALIDATE)).not.toContain(60);
    expect(Object.values(CACHE_REVALIDATE)).not.toContain(300);
  });
});

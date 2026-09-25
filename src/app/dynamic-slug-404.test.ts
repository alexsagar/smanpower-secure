import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  destinationsContent,
  employersContent,
  ethicalContent,
  industriesContent,
  trainingContent,
  trustContent,
  type PageContent,
} from "@/lib/content";

/**
 * Regression cover for the site-wide soft-404 fix.
 *
 * An unknown slug under a public `[slug]` route used to render the not-found UI
 * over an HTTP 200. `notFound()` cannot fix that on its own: the public segment
 * has a `loading.tsx`, so the response has already begun streaming by the time
 * the page runs, and Next cannot change a status code after headers are sent.
 *
 * The fix is `export const dynamicParams = false` on the route families whose
 * valid slug set is fixed at build time, which rejects an unknown slug at the
 * routing layer and yields a real 404. These tests assert the configuration
 * that produces that status, so removing the export fails the suite.
 */

const PUBLIC_DIR = join(process.cwd(), "src", "app", "(public)");

/** Route families whose slugs come from content.ts and are known at build time. */
const STATIC_SLUG_FAMILIES: Array<{ route: string; content: PageContent[] }> = [
  { route: "destinations", content: destinationsContent },
  { route: "employers", content: employersContent },
  { route: "ethical-recruitment", content: ethicalContent },
  { route: "industries", content: industriesContent },
  { route: "training-facilities", content: trainingContent },
  { route: "trust-centre", content: trustContent },
];

/**
 * Route families whose valid slugs live in the database and change without a
 * rebuild. `dynamicParams = false` must NOT be applied to these: it would 404
 * anything published after the last build.
 */
const DATABASE_SLUG_FAMILIES = [
  "insights",
  "news",
  "success-stories",
  "demands",
  "careers",
];

const pageSource = (route: string): string =>
  readFileSync(join(PUBLIC_DIR, route, "[slug]", "page.tsx"), "utf8");

describe("public dynamic slug routes return a real 404", () => {
  it.each(STATIC_SLUG_FAMILIES.map((f) => f.route))(
    "/%s/[slug] rejects unknown slugs at the routing layer",
    (route) => {
      const src = pageSource(route);
      expect(src).toMatch(/export const dynamicParams = false/);
      // The export is only meaningful alongside a generated param set.
      expect(src).toMatch(/export function generateStaticParams/);
    }
  );

  it.each(STATIC_SLUG_FAMILIES.map((f) => f.route))(
    "/%s/[slug] still calls notFound() for content that resolves but is empty",
    (route) => {
      // dynamicParams handles unknown slugs; notFound() still covers a known
      // slug whose content fails to resolve. Both paths must stay.
      expect(pageSource(route)).toMatch(/notFound\(\)/);
    }
  );

  it.each(STATIC_SLUG_FAMILIES)(
    "$route generates a param for every registered slug",
    ({ content }) => {
      const slugs = content.map((c) => c.slug);
      expect(slugs.length).toBeGreaterThan(0);
      // No duplicates: a duplicate would silently shadow a page.
      expect(new Set(slugs).size).toBe(slugs.length);
      // No empty or whitespace slugs.
      for (const slug of slugs) expect(slug.trim()).toBe(slug);
      for (const slug of slugs) expect(slug.length).toBeGreaterThan(0);
    }
  );

  it("keeps the known-good slugs inside the generated set", () => {
    const destinations = destinationsContent.map((c) => c.slug);
    expect(destinations).toContain("qatar");
    expect(destinations).toContain("malaysia");
    expect(destinations).toContain("europe");
    expect(industriesContent.map((c) => c.slug)).toContain("manufacturing");
    expect(trustContent.map((c) => c.slug)).toContain("licences");
  });

  it("leaves invalid slugs outside every generated set", () => {
    const invalid = ["foobarbaz", "germany", "nonexistent-xyz", "bogus-xyz", ""];
    for (const { route, content } of STATIC_SLUG_FAMILIES) {
      const slugs = content.map((c) => c.slug);
      for (const bad of invalid) {
        expect(slugs, `${route} must not register "${bad}"`).not.toContain(bad);
      }
    }
  });

  it.each(DATABASE_SLUG_FAMILIES)(
    "/%s/[slug] does NOT freeze its params, so newly published content stays reachable",
    (route) => {
      const src = pageSource(route);
      // Freezing these would 404 anything published since the last build.
      expect(src).not.toMatch(/export const dynamicParams = false/);
      // They must still call notFound(), which yields the noindex 404 UI.
      expect(src).toMatch(/notFound\(\)/);
    }
  );

  it("keeps the not-found UI noindex so streamed 404s are never indexed", () => {
    const notFoundSrc = readFileSync(join(PUBLIC_DIR, "not-found.tsx"), "utf8");
    expect(notFoundSrc).toMatch(/index:\s*false/);
    expect(notFoundSrc).toMatch(/follow:\s*false/);
  });
});

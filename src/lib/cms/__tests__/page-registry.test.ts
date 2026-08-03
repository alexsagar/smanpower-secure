import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUDITED_PUBLIC_ROUTE_COUNT,
  CMS_PAGE_REGISTRY,
  getCmsPageRegistryEntryByCurrentSlug,
  getCmsPageRegistryEntryByTargetSlug,
  isRegisteredPublicRoute,
  listCmsManagedOrPlannedPages,
  listEditableCmsPages,
  matchCmsPageRegistryEntry,
} from "../page-registry";

const auditedRoutes = [
  "/",
  "/about",
  "/about/our-story",
  "/about/mission-vision-values",
  "/about/leadership",
  "/about/our-people",
  "/about/community-impact",
  "/employers",
  "/employers/[slug]",
  "/employers/request-workforce",
  "/gallery",
  "/ethical-recruitment",
  "/ethical-recruitment/[slug]",
  "/ethical-recruitment/privacy-policy",
  "/industries",
  "/industries/[slug]",
  "/training-facilities",
  "/training-facilities/[slug]",
  "/trust-centre",
  "/trust-centre/[slug]",
  "/demands",
  "/demands/[slug]",
  "/demands/[slug]/apply",
  "/careers",
  "/careers/[slug]",
  "/news",
  "/news/[slug]",
  "/insights",
  "/insights/[slug]",
  "/success-stories",
  "/success-stories/[slug]",
  "/contact",
  "/worker-grievance",
  "/privacy-policy",
  "/terms-of-service",
  "/search",
  "/jobs",
  "/sitemap.xml",
  "/robots.txt",
];

describe("CMS page registry", () => {
  it("represents every audited public route", () => {
    expect(CMS_PAGE_REGISTRY).toHaveLength(AUDITED_PUBLIC_ROUTE_COUNT);
    expect(CMS_PAGE_REGISTRY.map((entry) => entry.canonicalRoute).sort()).toEqual(auditedRoutes.sort());
  });

  it("keeps canonical routes, current slugs, and target slugs unique", () => {
    const unique = (values: readonly string[]) => new Set(values).size;
    const routes = CMS_PAGE_REGISTRY.map((entry) => entry.canonicalRoute);
    const currentSlugs = CMS_PAGE_REGISTRY.flatMap((entry) => entry.currentCmsPageSlug ? [entry.currentCmsPageSlug] : []);
    const targetSlugs = CMS_PAGE_REGISTRY.flatMap((entry) => entry.targetCmsPageSlug ? [entry.targetCmsPageSlug] : []);

    expect(unique(routes)).toBe(routes.length);
    expect(unique(currentSlugs)).toBe(currentSlugs.length);
    expect(unique(targetSlugs)).toBe(targetSlugs.length);
  });

  it("does not register language-prefixed public routes", () => {
    expect(CMS_PAGE_REGISTRY.some((entry) => /^\/(en|ne)(\/|$)/.test(entry.canonicalRoute))).toBe(false);
  });

  it("has required metadata on every entry", () => {
    for (const entry of CMS_PAGE_REGISTRY) {
      expect(entry.label).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(entry.routeType).toBeTruthy();
      expect(entry.coverageStatus).toBeTruthy();
      expect(entry.managementMode).toBeTruthy();
      expect(entry.migrationWave).toBeTruthy();
      expect(entry.priority).toBeTruthy();
    }
  });

  it("matches dynamic route patterns", () => {
    expect(matchCmsPageRegistryEntry("/employers/candidate-sourcing")?.canonicalRoute).toBe("/employers/[slug]");
    expect(matchCmsPageRegistryEntry("/demands/factory-operator/apply")?.canonicalRoute).toBe("/demands/[slug]/apply");
  });

  it("lets exact static routes win over dynamic patterns", () => {
    expect(matchCmsPageRegistryEntry("/ethical-recruitment/privacy-policy")?.canonicalRoute).toBe("/ethical-recruitment/privacy-policy");
    expect(matchCmsPageRegistryEntry("/employers/request-workforce")?.canonicalRoute).toBe("/employers/request-workforce");
  });

  it("represents the ethical recruitment privacy route as a legacy redirect", () => {
    const redirect = matchCmsPageRegistryEntry("/ethical-recruitment/privacy-policy");

    expect(redirect?.coverageStatus).toBe("LEGACY_REDIRECT");
    expect(redirect?.routeType).toBe("LEGACY_REDIRECT");
    expect(redirect?.managementMode).toBe("LEGACY_REDIRECT");
    expect(redirect?.redirectTarget).toBe("/privacy-policy");
    expect(redirect?.currentCmsPageSlug).toBeUndefined();
    expect(redirect?.targetCmsPageSlug).toBeUndefined();
    expect(redirect?.plannedBlockTypes).toEqual([]);
  });

  it("returns only currently editable CMS or collection-backed pages", () => {
    const editableRoutes = listEditableCmsPages().map((entry) => entry.canonicalRoute);

    expect(editableRoutes).toHaveLength(18);
    expect(editableRoutes).toEqual(expect.arrayContaining(["/", "/about", "/demands", "/demands/[slug]", "/careers", "/news", "/gallery"]));
    expect(editableRoutes).not.toEqual(expect.arrayContaining([
      "/about/leadership",
      "/employers/[slug]",
      "/employers/request-workforce",
      "/worker-grievance",
      "/ethical-recruitment/privacy-policy",
      "/sitemap.xml",
      "/robots.txt",
    ]));
    expect(isRegisteredPublicRoute("/sitemap.xml")).toBe(true);
  });

  it("excludes system and legacy redirect routes from planned CMS helpers", () => {
    const plannedRoutes = listCmsManagedOrPlannedPages().map((entry) => entry.canonicalRoute);

    expect(plannedRoutes).not.toContain("/ethical-recruitment/privacy-policy");
    expect(plannedRoutes).not.toContain("/sitemap.xml");
    expect(plannedRoutes).not.toContain("/robots.txt");
  });

  it("only assigns current CMS slugs to verified CMS-backed pages", () => {
    expect(CMS_PAGE_REGISTRY.filter((entry) => entry.currentCmsPageSlug).map((entry) => entry.currentCmsPageSlug).sort()).toEqual([
      "about",
      "employers",
      "ethical-recruitment",
      "gallery",
      "home",
      "industries",
      "training-facilities",
      "trust-centre",
    ].sort());
    expect(getCmsPageRegistryEntryByCurrentSlug("home")?.canonicalRoute).toBe("/");
    expect(getCmsPageRegistryEntryByTargetSlug("about-leadership")?.canonicalRoute).toBe("/about/leadership");
  });

  it("keeps registry files free of server-only dependencies", () => {
    const sources = ["page-registry.ts", "page-registry.types.ts"].map((file) =>
      readFileSync(join(process.cwd(), "src/lib/cms", file), "utf8")
    ).join("\n");

    expect(sources).not.toMatch(/PrismaContentRepository|content-resolver|server-only|@prisma\/client|process\.env/);
    expect(sources).not.toMatch(/from ["']@\/lib\/prisma["']/);
  });
});

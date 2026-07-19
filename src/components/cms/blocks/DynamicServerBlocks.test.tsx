import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import type { CmsContentBlock } from "@/types/content";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => jsx("a", { href, children }),
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => jsx("div", { children }),
}));

const block = (blockType: CmsContentBlock["blockType"]): CmsContentBlock => ({
  id: `block-${blockType}`,
  blockKey: `block-${blockType}`,
  blockType,
  pageSlug: "home",
  order: 1,
  visible: true,
  content: { title: "Section" },
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.doUnmock("@/services/industries.service");
  vi.doUnmock("@/services/facilities.service");
  vi.doUnmock("@/services/compliance.service");
});

describe("server-backed dynamic CMS blocks", () => {
  it("DynamicIndustryGridBlock fetches industries through the public service wrapper", async () => {
    const getIndustries = vi.fn().mockResolvedValue([{ id: "i1", name: "Hospitality", slug: "hospitality", order: 1, isActive: true }]);
    vi.doMock("@/services/industries.service", () => ({ getIndustries }));

    const { DynamicIndustryGridBlock } = await import("./DynamicIndustryGridBlock");
    const html = renderToStaticMarkup(await DynamicIndustryGridBlock({ block: block("dynamic_industry_grid"), lang: "en" }) as React.ReactElement);

    expect(getIndustries).toHaveBeenCalledTimes(1);
    expect(html).toContain("Hospitality");
    expect(html).toContain("/industries/hospitality");
  });

  it("DynamicFacilitiesGridBlock fetches facilities through the public service wrapper", async () => {
    const getTrainingFacilities = vi.fn().mockResolvedValue([{ id: "f1", name: "Skills Center", slug: "skills-center", isActive: true }]);
    vi.doMock("@/services/facilities.service", () => ({ getTrainingFacilities }));

    const { DynamicFacilitiesGridBlock } = await import("./DynamicFacilitiesGridBlock");
    const html = renderToStaticMarkup(await DynamicFacilitiesGridBlock({ block: block("dynamic_facilities_grid"), lang: "en" }) as React.ReactElement);

    expect(getTrainingFacilities).toHaveBeenCalledTimes(1);
    expect(html).toContain("Skills Center");
    expect(html).toContain("/training-facilities/skills-center");
  });

  it("DynamicVaultGridBlock fetches trust documents through the public service wrapper", async () => {
    const getComplianceDocuments = vi.fn().mockResolvedValue([{ id: "d1", title: "Licence", documentType: "licence", isPublic: true, isVerified: true, order: 1 }]);
    vi.doMock("@/services/compliance.service", () => ({ getComplianceDocuments }));

    const { DynamicVaultGridBlock } = await import("./DynamicVaultGridBlock");
    const html = renderToStaticMarkup(await DynamicVaultGridBlock({ block: block("dynamic_vault_grid"), lang: "en" }) as React.ReactElement);

    expect(getComplianceDocuments).toHaveBeenCalledTimes(1);
    expect(html).toContain("Licence");
    expect(html).toContain("/trust-centre/licence");
  });
});

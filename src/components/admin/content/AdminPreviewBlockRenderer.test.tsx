import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { jsx } from "react/jsx-runtime";
import type { AdminPreviewData } from "@/types/admin-preview";
import type { CmsClientPartner, CmsContentBlock, CmsStatistic } from "@/types/content";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => jsx("img", props),
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => jsx("div", { children }),
}));

const block = (blockType: CmsContentBlock["blockType"], content: Record<string, unknown> = {}): CmsContentBlock => ({
  id: `block-${blockType}`,
  blockKey: `block-${blockType}`,
  blockType,
  pageSlug: "home",
  order: 1,
  visible: true,
  content,
});

const stat: CmsStatistic = {
  id: "stat-1",
  label: "Workers",
  value: "1,200",
  suffix: "+",
  description: "Placed ethically",
  order: 1,
};

const partner: CmsClientPartner = {
  id: "partner-1",
  name: "Alpha Partner",
  type: "client",
  isPublic: true,
  isVerified: true,
  order: 1,
};

function text(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("admin CMS preview boundary", () => {
  it("keeps VisualPageEditor free of server renderer and Prisma imports", () => {
    const source = readFileSync(join(process.cwd(), "src/components/admin/content/VisualPageEditor.tsx"), "utf8");

    expect(source).not.toMatch(/ContentBlockRenderer|content-resolver|PrismaContentRepository|@\/lib\/prisma|@prisma\/client/);
  });

  it("renders statistics from injected preview data", async () => {
    const { AdminPreviewBlockRenderer } = await import("./AdminPreviewBlockRenderer");
    const html = renderToStaticMarkup(
      <AdminPreviewBlockRenderer block={block("statistics")} previewData={{ statistics: [stat] }} />
    );

    expect(text(html)).toContain("Workers");
    expect(text(html)).toContain("1,200");
    expect(text(html)).toContain("Placed ethically");
  });

  it("renders client partners from injected preview data", async () => {
    const { AdminPreviewBlockRenderer } = await import("./AdminPreviewBlockRenderer");
    const previewData: AdminPreviewData = { clientPartners: [partner] };
    const html = renderToStaticMarkup(
      <AdminPreviewBlockRenderer block={block("client_marquee", { heading: "Global Partners" })} previewData={previewData} />
    );

    expect(text(html)).toContain("Global");
    expect(text(html)).toContain("Alpha Partner");
  });

  it("shows admin-only placeholders for empty server-backed preview data", async () => {
    const { AdminPreviewBlockRenderer } = await import("./AdminPreviewBlockRenderer");
    const html = renderToStaticMarkup(
      <>
        <AdminPreviewBlockRenderer block={block("statistics")} previewData={{ statistics: [] }} />
        <AdminPreviewBlockRenderer block={block("client_marquee")} previewData={{ clientPartners: [] }} />
      </>
    );

    expect(text(html)).toContain("No published statistics available for preview.");
    expect(text(html)).toContain("No published partners available for preview.");
  });
});

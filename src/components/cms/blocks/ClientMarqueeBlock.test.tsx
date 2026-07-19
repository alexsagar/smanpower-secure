import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { demoClientPartners } from "@/demo-data/homepage";
import type { CmsClientPartner, CmsContentBlock } from "@/types/content";

vi.mock("server-only", () => ({}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => jsx("img", props),
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => jsx("div", { children }),
}));

const block = {
  id: "block-home-partners",
  blockType: "client_marquee",
  visible: true,
  content: {
    heading: "Global Partners",
    subheading: "Trusted by Industry Leaders Worldwide",
  },
} as CmsContentBlock;

function makePartner(overrides: Partial<CmsClientPartner>): CmsClientPartner {
  return {
    id: "partner-1",
    name: "Partner One",
    type: "client",
    isPublic: true,
    isVerified: true,
    order: 1,
    ...overrides,
  };
}

function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.resetModules();
  vi.doUnmock("@/repositories/content-resolver");
  vi.doUnmock("@/repositories/prisma-content-repository");
  vi.doUnmock("@/repositories/demo-content-repository");
  vi.doUnmock("@/lib/prisma");
});

describe("ClientMarqueeBlock", () => {
  it("uses the real demo resolver path and renders fixture partners from DemoContentRepository", async () => {
    vi.resetModules();
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("DEMO_MODE", "true");

    const resolverModule = await import("@/repositories/content-resolver");
    expect(resolverModule.getContentRepository().constructor.name).toBe("DemoContentRepository");

    const { ClientMarqueeBlock } = await import("./ClientMarqueeBlock");
    const result = await ClientMarqueeBlock({ block, lang: "en" });

    expect(result).not.toBeNull();

    const html = renderToStaticMarkup(result as React.ReactElement);
    const text = htmlToText(html);
    const firstClient = demoClientPartners.find((partner) => partner.type === "client");
    const firstGroup = demoClientPartners.find((partner) => partner.type === "group_company");

    expect(firstClient).toBeDefined();
    expect(firstGroup).toBeDefined();
    expect(text).toContain(block.content.heading);
    expect(text).toContain(block.content.subheading);
    expect(text).toContain(firstClient!.name);
    expect(text).toContain(firstGroup!.name);
    expect(text).toContain("group company");
    expect(text).not.toContain("undefined");
  });

  it("renders normalized CmsClientPartner data through the real renderer and preserves row ordering", async () => {
    const clients = [
      makePartner({
        id: "client-1",
        name: "Alpha Client",
        logoUrl: "https://cdn.example.com/alpha-client.png",
        order: 2,
      }),
      makePartner({
        id: "client-2",
        name: "Beta Client",
        order: 5,
      }),
    ];
    const groups = [
      makePartner({
        id: "group-1",
        name: "Group One",
        type: "group_company",
        logoUrl: "https://cdn.example.com/group-one.png",
        order: 7,
      }),
      makePartner({
        id: "group-2",
        name: "Group Two",
        type: "group_company",
        order: 8,
      }),
    ];

    const { ClientMarqueeRenderer } = await import("./ClientMarqueeRenderer");
    const html = renderToStaticMarkup(
      <ClientMarqueeRenderer block={block} clients={clients} groups={groups} />
    );
    const text = htmlToText(html);

    expect(text).toContain(block.content.heading);
    expect(text).toContain(block.content.subheading);
    expect(html).toContain('alt="Alpha Client"');
    expect(html).toContain('alt="Group One"');
    expect(text).toContain("Beta Client");
    expect(text).toContain("Group Two");
    expect(text).toContain("group company");
    expect(text).not.toContain("undefined");
    expect(html).toContain("marquee-scroll");
    expect(html).toContain("marquee-scroll-reverse");
    expect(html.indexOf('alt="Alpha Client"')).toBeLessThan(html.indexOf("Beta Client"));
    expect(html.indexOf('alt="Group One"')).toBeLessThan(html.indexOf("Group Two"));
    expect(html.indexOf("Beta Client")).toBeLessThan(html.indexOf('alt="Group One"'));
  });

  it("returns null for an empty Prisma-backed result without falling back to demo partners", async () => {
    vi.resetModules();
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");

    const getClientPartnersMock = vi.fn<() => Promise<CmsClientPartner[]>>().mockResolvedValue([]);
    const demoRepoConstructor = vi.fn(() => {
      throw new Error("demo repository should not be instantiated");
    });

    vi.doMock("@/repositories/prisma-content-repository", () => ({
      PrismaContentRepository: class PrismaContentRepository {
        getClientPartners = getClientPartnersMock;
      },
    }));

    vi.doMock("@/repositories/demo-content-repository", () => ({
      DemoContentRepository: class DemoContentRepository {
        constructor() {
          demoRepoConstructor();
        }
      },
    }));

    vi.doMock("@/lib/prisma", () => {
      throw new Error("ClientMarqueeBlock must not import prisma directly");
    });

    const resolverModule = await import("@/repositories/content-resolver");
    expect(resolverModule.getContentRepository().constructor.name).toBe("PrismaContentRepository");

    const { ClientMarqueeBlock } = await import("./ClientMarqueeBlock");

    await expect(ClientMarqueeBlock({ block, lang: "en" })).resolves.toBeNull();
    expect(getClientPartnersMock).toHaveBeenCalledTimes(1);
    expect(demoRepoConstructor).not.toHaveBeenCalled();
  });
});

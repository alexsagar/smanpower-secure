import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { demoStatistics } from "@/demo-data/homepage";
import type { CmsContentBlock, CmsStatistic } from "@/types/content";

vi.mock("server-only", () => ({}));

const block = {
  id: "block-home-stats",
  blockType: "statistics",
  visible: true,
  content: {},
} as CmsContentBlock;

function makeStatistic(overrides: Partial<CmsStatistic>): CmsStatistic {
  return {
    id: "stat-1",
    label: "Workers",
    value: "1200",
    description: "Placed",
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
  vi.doUnmock("@/demo-data/homepage");
  vi.doUnmock("@/lib/prisma");
});

describe("StatisticsBlock", () => {
  it("uses the real demo resolver path and renders demoStatistics from DemoContentRepository", async () => {
    vi.resetModules();
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("DEMO_MODE", "true");

    const resolverModule = await import("@/repositories/content-resolver");
    expect(resolverModule.getContentRepository().constructor.name).toBe("DemoContentRepository");

    const { StatisticsBlock } = await import("./StatisticsBlock");
    const result = await StatisticsBlock({ block, lang: "en" });

    expect(result).not.toBeNull();

    const html = renderToStaticMarkup(result as React.ReactElement);
    const text = htmlToText(html);
    const first = demoStatistics[0];
    const second = demoStatistics[1];

    expect(text).toContain(first.label);
    expect(text).toContain(first.value);
    expect(text).toContain(first.description);
    expect(text).toContain(second.label);
    expect(text.indexOf(first.label)).toBeLessThan(text.indexOf(second.label));
    expect(text).not.toContain("undefined");
  });

  it("renders repository statistics in order with suffixes and without undefined optional fields", async () => {
    const stats = [
      makeStatistic({
        id: "stat-2",
        label: "Markets",
        value: "12",
        description: "Open Markets",
        order: 2,
      }),
      makeStatistic({
        id: "stat-1",
        label: "Workers",
        value: "1,200",
        suffix: "+",
        description: "Placed",
        order: 1,
      }),
    ];

    vi.doMock("@/repositories/content-resolver", () => ({
      getStatistics: vi.fn().mockResolvedValue(stats),
    }));

    vi.doMock("@/demo-data/homepage", () => {
      throw new Error("StatisticsBlock must not import demoStatistics directly");
    });

    vi.doMock("@/lib/prisma", () => {
      throw new Error("StatisticsBlock must not import prisma directly");
    });

    const { StatisticsBlock } = await import("./StatisticsBlock");
    const result = await StatisticsBlock({ block, lang: "en" });

    expect(result).not.toBeNull();

    const html = renderToStaticMarkup(result as React.ReactElement);
    const text = htmlToText(html);

    expect(text).toContain("Workers");
    expect(text).toContain("1,200");
    expect(text).toContain("+");
    expect(text).toContain("Placed");
    expect(text).toContain("Markets");
    expect(text).toContain("12");
    expect(text).toContain("Open Markets");
    expect(text).not.toContain("undefined");
    expect(html.indexOf("Markets")).toBeLessThan(html.indexOf("Workers"));
  });

  it("returns an empty render for an empty Prisma-backed result without falling back to demo statistics", async () => {
    vi.resetModules();
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");

    const getStatisticsMock = vi.fn<() => Promise<CmsStatistic[]>>().mockResolvedValue([]);
    const demoRepoConstructor = vi.fn(() => {
      throw new Error("demo repository should not be instantiated");
    });

    vi.doMock("@/repositories/prisma-content-repository", () => ({
      PrismaContentRepository: class PrismaContentRepository {
        getStatistics = getStatisticsMock;
      },
    }));

    vi.doMock("@/repositories/demo-content-repository", () => ({
      DemoContentRepository: class DemoContentRepository {
        constructor() {
          demoRepoConstructor();
        }
      },
    }));

    const resolverModule = await import("@/repositories/content-resolver");
    expect(resolverModule.getContentRepository().constructor.name).toBe("PrismaContentRepository");

    const { StatisticsBlock } = await import("./StatisticsBlock");
    const result = await StatisticsBlock({ block, lang: "en" });
    const html = renderToStaticMarkup(result as React.ReactElement);

    expect(html).toBe("");
    expect(getStatisticsMock).toHaveBeenCalledTimes(1);
    expect(demoRepoConstructor).not.toHaveBeenCalled();
  });
});

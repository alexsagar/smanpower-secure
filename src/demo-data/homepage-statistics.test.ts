import { describe, expect, it } from "vitest";
import { demoHomepageBlocks, demoStatistics } from "./homepage";

/**
 * Regression guard for the homepage statistics section.
 *
 * The Prisma repository reads statistics from `content.stats` on the homepage
 * `statistics` block. The block was seeded with `content: {}`, so against a real
 * database the section resolved to zero statistics and rendered nothing, while
 * demo mode (which reads demoStatistics directly) looked fine.
 */
describe("homepage statistics block", () => {
  const statisticsBlock = demoHomepageBlocks.find((b) => b.blockType === "statistics");

  it("exists in the homepage block set", () => {
    expect(statisticsBlock).toBeDefined();
  });

  it("carries the statistics in content.stats where the repository reads them", () => {
    const stats = (statisticsBlock?.content as { stats?: unknown[] })?.stats;
    expect(Array.isArray(stats)).toBe(true);
    expect(stats?.length).toBe(demoStatistics.length);
  });

  it("serves the same figures to both repositories from one source", () => {
    const stats = (statisticsBlock?.content as { stats?: unknown[] })?.stats;
    expect(stats).toEqual(demoStatistics);
  });

  it("stores rows with every field the repository mapper requires", () => {
    // mapStatisticRecord drops any row missing id/label/value/description/order.
    for (const stat of demoStatistics) {
      expect(stat.id).toBeTruthy();
      expect(stat.label).toBeTruthy();
      expect(stat.value).toBeTruthy();
      expect(stat.description).toBeTruthy();
      expect(typeof stat.order).toBe("number");
    }
  });
});

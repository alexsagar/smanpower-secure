import { describe, expect, it } from "vitest";
import { getStatisticsFromBlock } from "./StatisticsBlock";

describe("getStatisticsFromBlock", () => {
  it("returns only valid statistics entries from block content", () => {
    const block = {
      content: {
        stats: [
          { id: "1", label: "Workers", value: "1200", suffix: "+", description: "Placed" },
          { id: "2", label: "Markets", value: 12 },
          { id: "broken", value: "3" },
          null,
        ],
      },
    } as any;

    expect(getStatisticsFromBlock(block)).toEqual([
      { id: "1", label: "Workers", value: "1200", suffix: "+", description: "Placed" },
      { id: "2", label: "Markets", value: 12 },
    ]);
  });
});

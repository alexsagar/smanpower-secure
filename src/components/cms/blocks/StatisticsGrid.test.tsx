import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatisticsGrid } from "./StatisticsGrid";
import type { CmsStatistic } from "@/types/content";

const stat = (o: Partial<CmsStatistic>): CmsStatistic => ({
  id: "s", label: "L", value: "0", suffix: undefined, description: "d", ...o,
} as CmsStatistic);

describe("StatisticsGrid (dynamic, backend-driven)", () => {
  it("renders backend values verbatim, preserving 0, +, decimals and percentages", () => {
    const html = renderToStaticMarkup(
      <StatisticsGrid
        stats={[
          stat({ id: "a", label: "Deployed", value: "0" }),
          stat({ id: "b", label: "Experience", value: "15", suffix: "+" }),
          stat({ id: "c", label: "Compliance", value: "100", suffix: "%" }),
          stat({ id: "d", label: "Rating", value: "4.9" }),
        ]}
      />
    );
    // Zero value is preserved (not dropped as falsy).
    expect(html).toContain(">0<");
    expect(html).toContain("15");
    expect(html).toContain("+");
    expect(html).toContain("100");
    expect(html).toContain("%");
    expect(html).toContain("4.9");
  });

  it("changing a stored value changes the output with no code edits", () => {
    const render = (value: string) =>
      renderToStaticMarkup(<StatisticsGrid stats={[stat({ value })]} />);
    expect(render("1200")).toContain("1200");
    expect(render("9999")).toContain("9999");
  });

  it("renders nothing when there are no statistics", () => {
    expect(renderToStaticMarkup(<StatisticsGrid stats={[]} />)).toBe("");
  });
});

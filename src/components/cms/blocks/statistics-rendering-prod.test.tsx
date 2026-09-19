import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatisticsGrid } from "@/components/cms/blocks/StatisticsGrid";
import { StatsGridBlock } from "@/components/cms/blocks/StatsGridBlock";
import { TARGET } from "../../../../scripts/update-production-cms-statistics.mjs";

describe("Production Statistics Component Rendering Verification", () => {
  it("renders Homepage StatisticsGrid correctly with approved values without duplication or counters", () => {
    const stats = [
      TARGET.home.stat1,
      { id: "stat-2", label: "Trusted Network", value: "350", suffix: "+", description: "Employer Partners", order: 2 },
      { id: "stat-3", label: "Talent Placed", value: "150k", suffix: "+", description: "Workers Deployed", order: 3 },
      { id: "stat-4", label: "Industry Focus", value: "8", description: "Recruitment Sectors", order: 4 },
      { id: "stat-5", label: "Infrastructure", value: "3", description: "Training Facilities", order: 5 },
      TARGET.home.stat6,
    ];

    const html = renderToStaticMarkup(<StatisticsGrid stats={stats as any} />);

    // Stat 1 checks
    expect(html).toContain("Global Operations");
    expect(html).toContain("2010");
    expect(html).toContain("Since 2010");
    // Verify no duplicated "Since 2010" in the primary value span
    expect(html).not.toContain("Since 2010Since 2010");

    // Stat 6 checks
    expect(html).toContain("Ethical Standard");
    expect(html).toContain("RBA");
    expect(html).toContain("Aligned Framework");

    // Unrelated stats preserved
    expect(html).toContain("350");
    expect(html).toContain("150k");
  });

  it("renders About Page StatsGridBlock correctly with approved values without duplication", () => {
    const block = {
      id: "block_about_2",
      blockKey: "stats",
      blockType: "stats_grid",
      order: 2,
      visible: true,
      content: {
        stats: [
          TARGET.about.item0,
          TARGET.about.item1,
          TARGET.about.item2,
          TARGET.about.item3,
        ],
      },
    };

    const html = renderToStaticMarkup(<StatsGridBlock block={block as any} lang="en" />);

    // Item 0: Since 2010 / Established
    expect(html).toContain("Since 2010");
    expect(html).toContain("Established");

    // Item 1: 350+ / Employer Partners
    expect(html).toContain("350+");
    expect(html).toContain("Employer Partners");

    // Item 2: 150,000+ / Workers Deployed
    expect(html).toContain("150,000+");
    expect(html).toContain("Workers Deployed");

    // Item 3: 7 / Provinces Covered
    expect(html).toContain("7");
    expect(html).toContain("Provinces Covered");

    // Verify no duplicates
    expect(html).not.toContain("Since 2010Since 2010");
    expect(html).not.toContain("EstablishedEstablished");
  });
});

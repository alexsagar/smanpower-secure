import React from "react";
import { getStatistics } from "@/repositories/content-resolver";
import { StatisticsGrid } from "./StatisticsGrid";
import type { CmsContentBlock } from "@/types/content";

export async function StatisticsBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void block;
  void lang;

  const stats = await getStatistics();
  return <StatisticsGrid stats={stats} />;
}

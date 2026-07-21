import React from "react";
import type { CmsContentBlock } from "@/types/content";
import TalentDashboard from "@/components/dashboard/TalentDashboard";
import { mergePageCopy } from "@/lib/page-copy";
import { talentDashboardDefaults } from "@/lib/talent-dashboard-content";

export function MapIntelligenceBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;

  // Stored block content is merged over the live defaults, so an empty or
  // partially-filled block still renders exactly what the site shows today.
  const content = mergePageCopy(talentDashboardDefaults, block?.content);

  return (
    <>
      {/* SECTION 9: NEPAL TALENT INTELLIGENCE */}
      <TalentDashboard content={content} />
    </>
  );
}

"use client";

import React from "react";
import type { AdminPreviewData } from "@/types/admin-preview";
import type { CmsContentBlock } from "@/types/content";
import { IntroductionBlock } from "@/components/cms/blocks/IntroductionBlock";
import { ManifestoBlock } from "@/components/cms/blocks/ManifestoBlock";
import { ServiceListBlock } from "@/components/cms/blocks/ServiceListBlock";
import { PillarGridBlock } from "@/components/cms/blocks/PillarGridBlock";
import { IndustryGridBlock } from "@/components/cms/blocks/IndustryGridBlock";
import { TrainingBentoBlock } from "@/components/cms/blocks/TrainingBentoBlock";
import { MapIntelligenceBlock } from "@/components/cms/blocks/MapIntelligenceBlock";
import { TrustCentreBlock } from "@/components/cms/blocks/TrustCentreBlock";
import { CommunityBlock } from "@/components/cms/blocks/CommunityBlock";
import { StoryGridBlock } from "@/components/cms/blocks/StoryGridBlock";
import { InsightPreviewBlock } from "@/components/cms/blocks/InsightPreviewBlock";
import { FinalCTABlock } from "@/components/cms/blocks/FinalCTABlock";
import { ImageTextBlock } from "@/components/cms/blocks/ImageTextBlock";
import { EditorialBlock } from "@/components/cms/blocks/EditorialBlock";
import { StatsGridBlock } from "@/components/cms/blocks/StatsGridBlock";
import { CoreValuesBlock } from "@/components/cms/blocks/CoreValuesBlock";
import { ProcessFlowBlock } from "@/components/cms/blocks/ProcessFlowBlock";
import { SolutionsGridBlock } from "@/components/cms/blocks/SolutionsGridBlock";
import { AdvantageBlock } from "@/components/cms/blocks/AdvantageBlock";
import { PledgeBlock } from "@/components/cms/blocks/PledgeBlock";
import { TimelineGridBlock } from "@/components/cms/blocks/TimelineGridBlock";
import { StatisticsGrid } from "@/components/cms/blocks/StatisticsGrid";
import { ClientMarqueeRenderer } from "@/components/cms/blocks/ClientMarqueeRenderer";
import { DynamicIndustryGridRenderer } from "@/components/cms/blocks/DynamicIndustryGridRenderer";
import { DynamicFacilitiesGridRenderer } from "@/components/cms/blocks/DynamicFacilitiesGridRenderer";
import { DynamicVaultGridRenderer } from "@/components/cms/blocks/DynamicVaultGridRenderer";

function AdminPreviewPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-y border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

export function AdminPreviewBlockRenderer({
  block,
  lang = "en",
  previewData,
}: {
  block: CmsContentBlock;
  lang?: string;
  previewData: AdminPreviewData;
}) {
  if (!block.visible) return null;

  switch (block.blockType) {
    case "statistics": {
      const stats = previewData.statistics ?? [];
      return stats.length ? <StatisticsGrid stats={stats} /> : <AdminPreviewPlaceholder>No published statistics available for preview.</AdminPreviewPlaceholder>;
    }
    case "client_marquee": {
      const partners = previewData.clientPartners ?? [];
      const clients = partners.filter((partner) => partner.type !== "group_company");
      const groups = partners.filter((partner) => partner.type === "group_company");
      return partners.length ? <ClientMarqueeRenderer block={block} clients={clients} groups={groups} /> : <AdminPreviewPlaceholder>No published partners available for preview.</AdminPreviewPlaceholder>;
    }
    case "dynamic_industry_grid": {
      const industries = previewData.industries ?? [];
      return industries.length ? <DynamicIndustryGridRenderer block={block} industries={industries} /> : <AdminPreviewPlaceholder>No published industries available for preview.</AdminPreviewPlaceholder>;
    }
    case "dynamic_facilities_grid": {
      const facilities = previewData.trainingFacilities ?? [];
      return facilities.length ? <DynamicFacilitiesGridRenderer block={block} facilities={facilities} /> : <AdminPreviewPlaceholder>No published training facilities available for preview.</AdminPreviewPlaceholder>;
    }
    case "dynamic_vault_grid": {
      const documents = previewData.trustDocuments ?? [];
      return documents.length ? <DynamicVaultGridRenderer block={block} documents={documents} /> : <AdminPreviewPlaceholder>No published trust documents available for preview.</AdminPreviewPlaceholder>;
    }
    case "introduction":
      return <IntroductionBlock block={block} lang={lang} />;
    case "manifesto":
      return <ManifestoBlock block={block} lang={lang} />;
    case "service_list":
      return <ServiceListBlock block={block} lang={lang} />;
    case "pillar_grid":
      return <PillarGridBlock block={block} lang={lang} />;
    case "industry_grid":
      return <IndustryGridBlock block={block} lang={lang} />;
    case "training_bento":
      return <TrainingBentoBlock block={block} lang={lang} />;
    case "map_intelligence":
      return <MapIntelligenceBlock block={block} lang={lang} />;
    case "trust_centre":
      return <TrustCentreBlock block={block} lang={lang} />;
    case "community":
      return <CommunityBlock block={block} lang={lang} />;
    case "story_grid":
      return <StoryGridBlock block={block} lang={lang} />;
    case "insight_preview":
      return <InsightPreviewBlock block={block} lang={lang} />;
    case "final_cta":
      return <FinalCTABlock block={block} lang={lang} />;
    case "image_text":
      return <ImageTextBlock block={block} lang={lang} />;
    case "editorial":
      return <EditorialBlock block={block} lang={lang} />;
    case "stats_grid":
      return <StatsGridBlock block={block} lang={lang} />;
    case "core_values":
      return <CoreValuesBlock block={block} lang={lang} />;
    case "process_flow":
      return <ProcessFlowBlock block={block} lang={lang} />;
    case "solutions_grid":
      return <SolutionsGridBlock block={block} lang={lang} />;
    case "advantage":
      return <AdvantageBlock block={block} lang={lang} />;
    case "pledge":
      return <PledgeBlock block={block} lang={lang} />;
    case "timeline_grid":
      return <TimelineGridBlock block={block} lang={lang} />;
    default:
      return null;
  }
}

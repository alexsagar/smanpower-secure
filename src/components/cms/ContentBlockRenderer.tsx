import "server-only";

// ============================================================
// Content Block Renderer
// ============================================================
// Takes a CmsContentBlock and renders the appropriate component.
// ============================================================

import React from "react";
import type { CmsContentBlock } from "@/types/content";

// Import all block components dynamically or statically
import { IntroductionBlock } from "./blocks/IntroductionBlock";
import { ManifestoBlock } from "./blocks/ManifestoBlock";
import { StatisticsBlock } from "./blocks/StatisticsBlock";
import { ServiceListBlock } from "./blocks/ServiceListBlock";
import { PillarGridBlock } from "./blocks/PillarGridBlock";
import { IndustryGridBlock } from "./blocks/IndustryGridBlock";
import { TrainingBentoBlock } from "./blocks/TrainingBentoBlock";
import { MapIntelligenceBlock } from "./blocks/MapIntelligenceBlock";
import { TrustCentreBlockServer } from "./blocks/TrustCentreBlockServer";
import { EmployerTestimonialsBlock } from "./blocks/EmployerTestimonialsBlock";
import { ClientMarqueeBlock } from "./blocks/ClientMarqueeBlock";
import { StoryGridBlockServer } from "./blocks/StoryGridBlockServer";
import { InsightPreviewBlockServer } from "./blocks/InsightPreviewBlockServer";
import { FinalCTABlock } from "./blocks/FinalCTABlock";
import { ImageTextBlock } from "./blocks/ImageTextBlock";
import { EditorialBlock } from "./blocks/EditorialBlock";
import { StatsGridBlock } from "./blocks/StatsGridBlock";
import { CoreValuesBlock } from "./blocks/CoreValuesBlock";
import { ProcessFlowBlock } from "./blocks/ProcessFlowBlock";
import { SolutionsGridBlock } from "./blocks/SolutionsGridBlock";
import { AdvantageBlock } from "./blocks/AdvantageBlock";
import { PledgeBlock } from "./blocks/PledgeBlock";
import { TimelineGridBlock } from "./blocks/TimelineGridBlock";
import { DynamicIndustryGridBlock } from "./blocks/DynamicIndustryGridBlock";
import { DynamicFacilitiesGridBlock } from "./blocks/DynamicFacilitiesGridBlock";
import { DynamicVaultGridBlock } from "./blocks/DynamicVaultGridBlock";
import { ImageGalleryBlock } from "./blocks/ImageGalleryBlock";

interface ContentBlockRendererProps {
  block: CmsContentBlock;
  lang?: string;
}

export function ContentBlockRenderer({ block, lang = "en" }: ContentBlockRendererProps) {
  if (!block.visible) return null;

  switch (block.blockType) {
    case "introduction":
      return <IntroductionBlock block={block} lang={lang} />;
    case "manifesto":
      return <ManifestoBlock block={block} lang={lang} />;
    case "statistics":
      return <StatisticsBlock block={block} lang={lang} />;
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
      return <TrustCentreBlockServer block={block} lang={lang} />;
    case "community":
    case "testimonial":
      return <EmployerTestimonialsBlock block={block} />;
    case "client_marquee":
      return <ClientMarqueeBlock block={block} lang={lang} />;
    case "story_grid":
      return <StoryGridBlockServer block={block} lang={lang} />;
    case "insight_preview":
      return <InsightPreviewBlockServer block={block} lang={lang} />;
    case "final_cta":
      return <FinalCTABlock block={block} lang={lang} />;
    case "image_text":
      return <ImageTextBlock block={block} lang={lang} />;
    case "image_gallery":
      return <ImageGalleryBlock block={block} />;
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
    case "dynamic_industry_grid":
      return <DynamicIndustryGridBlock block={block} lang={lang} />;
    case "dynamic_facilities_grid":
      return <DynamicFacilitiesGridBlock block={block} lang={lang} />;
    case "dynamic_vault_grid":
      return <DynamicVaultGridBlock block={block} lang={lang} />;
    default:
      console.warn(`Unsupported block type: ${block.blockType}`);
      return null;
  }
}

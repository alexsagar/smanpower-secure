export type CmsBlockTypeId =
  | "introduction"
  | "manifesto"
  | "statistics"
  | "service_list"
  | "pillar_grid"
  | "industry_grid"
  | "training_bento"
  | "map_intelligence"
  | "trust_centre"
  | "community"
  | "client_marquee"
  | "story_grid"
  | "insight_preview"
  | "final_cta"
  | "image_text"
  | "editorial"
  | "stats_grid"
  | "core_values"
  | "process_flow"
  | "solutions_grid"
  | "advantage"
  | "pledge"
  | "timeline_grid"
  | "dynamic_industry_grid"
  | "dynamic_facilities_grid"
  | "dynamic_vault_grid"
  | "page_copy";

export type PageCategory = "MARKETING" | "LISTING" | "DETAIL" | "FUNCTIONAL" | "LEGAL" | "SEARCH" | "REDIRECT" | "SYSTEM" | "COLLECTION" | "HYBRID";
export type CmsCoverageStatus = "FULL" | "PARTIAL" | "NONE" | "COLLECTION_DRIVEN" | "FUNCTIONAL_CODE_CONTROLLED" | "LEGACY_REDIRECT" | "SYSTEM_ROUTE";
export type CmsManagementMode = "PAGE_BLOCKS" | "COLLECTION" | "COLLECTION_WITH_PAGE_WRAPPER" | "FUNCTIONAL_WITH_EDITABLE_COPY" | "LEGACY_REDIRECT" | "SYSTEM" | "HARDCODED_PENDING_MIGRATION";
export type CmsRouteType = "STATIC" | "DYNAMIC_PATTERN" | "LEGACY_REDIRECT" | "SYSTEM";
export type CmsPreviewStrategy = "BLOCK_PREVIEW" | "COLLECTION_PREVIEW" | "FUNCTIONAL_COPY_PREVIEW" | "NONE";
export type CmsSeoPolicy = "CMS_PAGE_SEO" | "COLLECTION_SEO" | "CODE_SEO" | "HYBRID_SEO" | "NOT_APPLICABLE";
export type CmsMediaPolicy = "CMS_MEDIA" | "COLLECTION_MEDIA" | "CODE_ASSET" | "HYBRID_MEDIA" | "NOT_APPLICABLE";
export type CmsMigrationWave = "WAVE_0" | "WAVE_1" | "WAVE_2" | "WAVE_3" | "WAVE_4" | "WAVE_5" | "WAVE_6" | "WAVE_7";
export type CmsPriority = "P0" | "P1" | "P2" | "P3";

export type CmsFunctionalBoundary = {
  editable: readonly string[];
  codeControlled: readonly string[];
};

export type CmsPageRegistryEntry = {
  canonicalRoute: string;
  routePattern?: string;
  redirectTarget?: string;
  label: string;
  category: PageCategory;
  coverageStatus: CmsCoverageStatus;
  currentCmsPageSlug?: string;
  targetCmsPageSlug?: string;
  routeType: CmsRouteType;
  managementMode: CmsManagementMode;
  publicRenderer: string;
  allowedBlockTypes: readonly CmsBlockTypeId[];
  requiredBlockTypes: readonly CmsBlockTypeId[];
  optionalBlockTypes: readonly CmsBlockTypeId[];
  plannedBlockTypes: readonly string[];
  collectionDependencies: readonly string[];
  seoPolicy: CmsSeoPolicy;
  mediaPolicy: CmsMediaPolicy;
  previewStrategy: CmsPreviewStrategy;
  hasCodeControlledFunctionality: boolean;
  functionalBoundary?: CmsFunctionalBoundary;
  migrationWave: CmsMigrationWave;
  priority: CmsPriority;
  enabled: boolean;
};

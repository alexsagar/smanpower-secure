import type {
  CmsBlockTypeId,
  CmsCoverageStatus,
  CmsMigrationWave,
  CmsPageRegistryEntry,
} from "./page-registry.types";

const HOME_BLOCKS = [
  "introduction",
  "manifesto",
  "statistics",
  "service_list",
  "pillar_grid",
  "industry_grid",
  "training_bento",
  "map_intelligence",
  "trust_centre",
  "testimonial",
  "client_marquee",
  "story_grid",
  "insight_preview",
  "final_cta",
] as const satisfies readonly CmsBlockTypeId[];

const PAGE_BLOCKS = [
  "introduction",
  "editorial",
  "stats_grid",
  "core_values",
  "process_flow",
  "solutions_grid",
  "advantage",
  "pledge",
  "timeline_grid",
  "image_text",
  "final_cta",
] as const satisfies readonly CmsBlockTypeId[];

const DYNAMIC_BLOCKS = [
  "dynamic_industry_grid",
  "dynamic_facilities_grid",
  "dynamic_vault_grid",
] as const satisfies readonly CmsBlockTypeId[];

const FORM_BOUNDARY = {
  editable: ["headings", "descriptions", "instructions", "supporting sections", "SEO", "safe success copy"],
  codeControlled: ["validation", "Turnstile", "consent requirements", "upload restrictions", "eligibility", "database transactions", "authentication", "authorization"],
} as const;

const entry = (entry: CmsPageRegistryEntry): CmsPageRegistryEntry => entry;

export const CMS_PAGE_REGISTRY = [
  entry({ canonicalRoute: "/", label: "Home", category: "MARKETING", coverageStatus: "FULL", currentCmsPageSlug: "home", targetCmsPageSlug: "home", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/page.tsx", allowedBlockTypes: HOME_BLOCKS, requiredBlockTypes: ["introduction"], optionalBlockTypes: HOME_BLOCKS, plannedBlockTypes: ["logo_grid"], collectionDependencies: ["statistics", "clientPartners", "successStories", "insights", "industries", "trainingFacilities", "complianceDocuments"], seoPolicy: "HYBRID_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_4", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/about", label: "About", category: "MARKETING", coverageStatus: "PARTIAL", currentCmsPageSlug: "about", targetCmsPageSlug: "about", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/about/page.tsx", allowedBlockTypes: PAGE_BLOCKS, requiredBlockTypes: [], optionalBlockTypes: PAGE_BLOCKS, plannedBlockTypes: ["leadership_grid", "milestones"], collectionDependencies: [], seoPolicy: "CODE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/about/our-story", label: "Our Story", category: "MARKETING", coverageStatus: "NONE", targetCmsPageSlug: "about-our-story", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/about/our-story/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["timeline", "milestones", "rich_text", "image_text"], collectionDependencies: ["companyMilestones"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/about/mission-vision-values", label: "Mission, Vision and Values", category: "MARKETING", coverageStatus: "NONE", targetCmsPageSlug: "about-mission-vision-values", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/about/mission-vision-values/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["rich_text", "card_grid", "quote", "cta"], collectionDependencies: [], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/about/leadership", label: "Leadership", category: "MARKETING", coverageStatus: "NONE", targetCmsPageSlug: "about-leadership", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/about/leadership/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["leadership_grid"], collectionDependencies: ["teamMembers"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/about/our-people", label: "Our People", category: "MARKETING", coverageStatus: "NONE", targetCmsPageSlug: "about-our-people", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/about/our-people/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["team_grid", "department_grid", "cta"], collectionDependencies: ["teamMembers"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/about/community-impact", label: "Community Impact", category: "MARKETING", coverageStatus: "NONE", targetCmsPageSlug: "about-community-impact", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/about/community-impact/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["card_grid", "stats_grid", "testimonial_grid"], collectionDependencies: ["statistics", "testimonials"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_1", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/employers", label: "Employers", category: "MARKETING", coverageStatus: "PARTIAL", currentCmsPageSlug: "employers", targetCmsPageSlug: "employers", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/employers/page.tsx", allowedBlockTypes: PAGE_BLOCKS, requiredBlockTypes: [], optionalBlockTypes: PAGE_BLOCKS, plannedBlockTypes: ["feature_grid", "cta"], collectionDependencies: [], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_2", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/employers/[slug]", routePattern: "/employers/[slug]", label: "Employer Service Detail", category: "DETAIL", coverageStatus: "NONE", targetCmsPageSlug: "employers-service-detail", routeType: "DYNAMIC_PATTERN", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/employers/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["detail_template", "feature_grid", "image_text", "cta"], collectionDependencies: ["employerServices"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_2", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/employers/request-workforce", label: "Request Workforce", category: "FUNCTIONAL", coverageStatus: "FUNCTIONAL_CODE_CONTROLLED", targetCmsPageSlug: "request-workforce", routeType: "STATIC", managementMode: "FUNCTIONAL_WITH_EDITABLE_COPY", publicRenderer: "src/app/(public)/employers/request-workforce/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["application_intro", "form_intro", "faq", "cta"], collectionDependencies: ["employerLeads"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "FUNCTIONAL_COPY_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: FORM_BOUNDARY, migrationWave: "WAVE_2", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/ethical-recruitment", label: "Ethical Recruitment", category: "MARKETING", coverageStatus: "PARTIAL", currentCmsPageSlug: "ethical-recruitment", targetCmsPageSlug: "ethical-recruitment", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/ethical-recruitment/page.tsx", allowedBlockTypes: PAGE_BLOCKS, requiredBlockTypes: [], optionalBlockTypes: PAGE_BLOCKS, plannedBlockTypes: ["policy_list", "download_list", "faq"], collectionDependencies: [], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_2", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/ethical-recruitment/privacy-policy", redirectTarget: "/privacy-policy", label: "Ethical Recruitment Privacy Policy Redirect", category: "REDIRECT", coverageStatus: "LEGACY_REDIRECT", routeType: "LEGACY_REDIRECT", managementMode: "LEGACY_REDIRECT", publicRenderer: "src/app/(public)/ethical-recruitment/privacy-policy/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: [], collectionDependencies: [], seoPolicy: "NOT_APPLICABLE", mediaPolicy: "NOT_APPLICABLE", previewStrategy: "NONE", hasCodeControlledFunctionality: true, migrationWave: "WAVE_0", priority: "P3", enabled: true }),
  entry({ canonicalRoute: "/ethical-recruitment/[slug]", routePattern: "/ethical-recruitment/[slug]", label: "Ethical Recruitment Detail", category: "DETAIL", coverageStatus: "NONE", targetCmsPageSlug: "ethical-policy-detail", routeType: "DYNAMIC_PATTERN", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/ethical-recruitment/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["policy_detail", "feature_grid", "download_list", "faq"], collectionDependencies: ["ethicalPolicies"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_2", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/industries", label: "Industries", category: "LISTING", coverageStatus: "PARTIAL", currentCmsPageSlug: "industries", targetCmsPageSlug: "industries", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/industries/page.tsx", allowedBlockTypes: [...PAGE_BLOCKS, ...DYNAMIC_BLOCKS], requiredBlockTypes: ["dynamic_industry_grid"], optionalBlockTypes: [...PAGE_BLOCKS, "dynamic_industry_grid"], plannedBlockTypes: ["industry_listing_controls", "featured_industry"], collectionDependencies: ["industries"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/industries/[slug]", routePattern: "/industries/[slug]", label: "Industry Detail", category: "DETAIL", coverageStatus: "NONE", targetCmsPageSlug: "industry-detail-template", routeType: "DYNAMIC_PATTERN", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/industries/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["industry_detail", "feature_grid", "gallery", "cta"], collectionDependencies: ["industries"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/training-facilities", label: "Training Facilities", category: "LISTING", coverageStatus: "PARTIAL", currentCmsPageSlug: "training-facilities", targetCmsPageSlug: "training-facilities", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/training-facilities/page.tsx", allowedBlockTypes: [...PAGE_BLOCKS, ...DYNAMIC_BLOCKS], requiredBlockTypes: ["dynamic_facilities_grid"], optionalBlockTypes: [...PAGE_BLOCKS, "dynamic_facilities_grid"], plannedBlockTypes: ["facility_listing_controls", "gallery"], collectionDependencies: ["trainingFacilities"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/training-facilities/[slug]", routePattern: "/training-facilities/[slug]", label: "Training Facility Detail", category: "DETAIL", coverageStatus: "NONE", targetCmsPageSlug: "training-facility-detail-template", routeType: "DYNAMIC_PATTERN", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/training-facilities/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["facility_detail", "gallery", "feature_grid", "video"], collectionDependencies: ["trainingFacilities"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/trust-centre", label: "Trust Centre", category: "LISTING", coverageStatus: "PARTIAL", currentCmsPageSlug: "trust-centre", targetCmsPageSlug: "trust-centre", routeType: "STATIC", managementMode: "PAGE_BLOCKS", publicRenderer: "src/app/(public)/trust-centre/page.tsx", allowedBlockTypes: [...PAGE_BLOCKS, ...DYNAMIC_BLOCKS], requiredBlockTypes: ["dynamic_vault_grid"], optionalBlockTypes: [...PAGE_BLOCKS, "dynamic_vault_grid"], plannedBlockTypes: ["download_list", "compliance_documents"], collectionDependencies: ["complianceDocuments"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "BLOCK_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/trust-centre/[slug]", routePattern: "/trust-centre/[slug]", label: "Trust Centre Detail", category: "DETAIL", coverageStatus: "NONE", targetCmsPageSlug: "trust-centre-detail-template", routeType: "DYNAMIC_PATTERN", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/trust-centre/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["compliance_documents", "download_list", "policy_detail"], collectionDependencies: ["complianceDocuments"], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_3", priority: "P0", enabled: true }),
  entry({ canonicalRoute: "/demands", label: "Demands", category: "COLLECTION", coverageStatus: "COLLECTION_DRIVEN", targetCmsPageSlug: "demands", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/demands/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "filter_help", "demand_card_template"], collectionDependencies: ["demands"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/demands/[slug]", routePattern: "/demands/[slug]", label: "Demand Detail", category: "DETAIL", coverageStatus: "COLLECTION_DRIVEN", routeType: "DYNAMIC_PATTERN", managementMode: "COLLECTION", publicRenderer: "src/app/(public)/demands/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["demand_detail_template", "application_intro"], collectionDependencies: ["demands", "demandPositions", "demandDocuments"], seoPolicy: "COLLECTION_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/demands/[slug]/apply", routePattern: "/demands/[slug]/apply", label: "Demand Application", category: "FUNCTIONAL", coverageStatus: "FUNCTIONAL_CODE_CONTROLLED", targetCmsPageSlug: "demand-application-template", routeType: "DYNAMIC_PATTERN", managementMode: "FUNCTIONAL_WITH_EDITABLE_COPY", publicRenderer: "src/app/(public)/demands/[slug]/apply/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["application_intro", "form_instructions", "success_message"], collectionDependencies: ["demands", "demandApplications"], seoPolicy: "CODE_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "FUNCTIONAL_COPY_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: FORM_BOUNDARY, migrationWave: "WAVE_6", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/careers", label: "Careers", category: "COLLECTION", coverageStatus: "COLLECTION_DRIVEN", targetCmsPageSlug: "careers", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/careers/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "career_card_template"], collectionDependencies: ["careerOpenings"], seoPolicy: "HYBRID_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/careers/[slug]", routePattern: "/careers/[slug]", label: "Career Detail", category: "DETAIL", coverageStatus: "COLLECTION_DRIVEN", routeType: "DYNAMIC_PATTERN", managementMode: "COLLECTION", publicRenderer: "src/app/(public)/careers/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["career_detail_template", "application_intro"], collectionDependencies: ["careerOpenings", "careerApplications"], seoPolicy: "COLLECTION_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: FORM_BOUNDARY, migrationWave: "WAVE_6", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/news", label: "News", category: "COLLECTION", coverageStatus: "COLLECTION_DRIVEN", targetCmsPageSlug: "news", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/news/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "article_card_template"], collectionDependencies: ["newsArticles"], seoPolicy: "HYBRID_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/news/[slug]", routePattern: "/news/[slug]", label: "News Article", category: "DETAIL", coverageStatus: "COLLECTION_DRIVEN", routeType: "DYNAMIC_PATTERN", managementMode: "COLLECTION", publicRenderer: "src/app/(public)/news/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["article_template", "related_content"], collectionDependencies: ["newsArticles"], seoPolicy: "COLLECTION_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/insights", label: "Insights", category: "COLLECTION", coverageStatus: "COLLECTION_DRIVEN", targetCmsPageSlug: "insights", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/insights/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "article_card_template"], collectionDependencies: ["insightArticles"], seoPolicy: "HYBRID_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/insights/[slug]", routePattern: "/insights/[slug]", label: "Insight Article", category: "DETAIL", coverageStatus: "COLLECTION_DRIVEN", routeType: "DYNAMIC_PATTERN", managementMode: "COLLECTION", publicRenderer: "src/app/(public)/insights/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["article_template", "related_content"], collectionDependencies: ["insightArticles"], seoPolicy: "COLLECTION_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/success-stories", label: "Success Stories", category: "COLLECTION", coverageStatus: "COLLECTION_DRIVEN", targetCmsPageSlug: "success-stories", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/success-stories/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "story_card_template"], collectionDependencies: ["successStories"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/success-stories/[slug]", routePattern: "/success-stories/[slug]", label: "Success Story", category: "DETAIL", coverageStatus: "COLLECTION_DRIVEN", routeType: "DYNAMIC_PATTERN", managementMode: "COLLECTION", publicRenderer: "src/app/(public)/success-stories/[slug]/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["story_detail_template", "related_content"], collectionDependencies: ["successStories"], seoPolicy: "COLLECTION_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/contact", label: "Contact", category: "FUNCTIONAL", coverageStatus: "PARTIAL", targetCmsPageSlug: "contact", routeType: "STATIC", managementMode: "FUNCTIONAL_WITH_EDITABLE_COPY", publicRenderer: "src/app/(public)/contact/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["contact_details", "office_locations", "contact_form_intro"], collectionDependencies: ["siteSettings", "officeLocations", "contactLeads"], seoPolicy: "CMS_PAGE_SEO", mediaPolicy: "HYBRID_MEDIA", previewStrategy: "FUNCTIONAL_COPY_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: FORM_BOUNDARY, migrationWave: "WAVE_5", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/worker-grievance", label: "Worker Grievance", category: "FUNCTIONAL", coverageStatus: "NONE", targetCmsPageSlug: "worker-grievance", routeType: "STATIC", managementMode: "FUNCTIONAL_WITH_EDITABLE_COPY", publicRenderer: "src/app/(public)/worker-grievance/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["grievance_intro", "contact_details", "faq"], collectionDependencies: [], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "FUNCTIONAL_COPY_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: FORM_BOUNDARY, migrationWave: "WAVE_5", priority: "P1", enabled: true }),
  entry({ canonicalRoute: "/privacy-policy", label: "Privacy Policy", category: "LEGAL", coverageStatus: "NONE", targetCmsPageSlug: "privacy-policy", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/privacy-policy/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["legal_rich_text"], collectionDependencies: [], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_5", priority: "P3", enabled: true }),
  entry({ canonicalRoute: "/terms-of-service", label: "Terms of Service", category: "LEGAL", coverageStatus: "NONE", targetCmsPageSlug: "terms-of-service", routeType: "STATIC", managementMode: "HARDCODED_PENDING_MIGRATION", publicRenderer: "src/app/(public)/terms-of-service/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["legal_rich_text"], collectionDependencies: [], seoPolicy: "CODE_SEO", mediaPolicy: "CODE_ASSET", previewStrategy: "NONE", hasCodeControlledFunctionality: false, migrationWave: "WAVE_5", priority: "P3", enabled: true }),
  entry({ canonicalRoute: "/search", label: "Search", category: "SEARCH", coverageStatus: "FUNCTIONAL_CODE_CONTROLLED", targetCmsPageSlug: "search", routeType: "STATIC", managementMode: "FUNCTIONAL_WITH_EDITABLE_COPY", publicRenderer: "src/app/(public)/search/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["search_intro", "result_card_templates"], collectionDependencies: ["jobs", "stories", "facilities", "industries"], seoPolicy: "CODE_SEO", mediaPolicy: "NOT_APPLICABLE", previewStrategy: "FUNCTIONAL_COPY_PREVIEW", hasCodeControlledFunctionality: true, functionalBoundary: { editable: ["intro copy", "no-results copy", "SEO"], codeControlled: ["query parsing", "result ranking", "collection visibility", "route generation"] }, migrationWave: "WAVE_6", priority: "P3", enabled: true }),
  entry({ canonicalRoute: "/jobs", label: "Jobs", category: "LISTING", coverageStatus: "PARTIAL", targetCmsPageSlug: "jobs", routeType: "STATIC", managementMode: "COLLECTION_WITH_PAGE_WRAPPER", publicRenderer: "src/app/(public)/jobs/page.tsx", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: ["listing_intro", "job_card_template"], collectionDependencies: ["jobs"], seoPolicy: "CODE_SEO", mediaPolicy: "COLLECTION_MEDIA", previewStrategy: "COLLECTION_PREVIEW", hasCodeControlledFunctionality: false, migrationWave: "WAVE_6", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/sitemap.xml", label: "Sitemap", category: "SYSTEM", coverageStatus: "SYSTEM_ROUTE", routeType: "SYSTEM", managementMode: "SYSTEM", publicRenderer: "src/app/sitemap.ts", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: [], collectionDependencies: ["cmsPages", "demands", "insightArticles", "newsArticles", "careerOpenings", "successStories"], seoPolicy: "NOT_APPLICABLE", mediaPolicy: "NOT_APPLICABLE", previewStrategy: "NONE", hasCodeControlledFunctionality: true, migrationWave: "WAVE_0", priority: "P2", enabled: true }),
  entry({ canonicalRoute: "/robots.txt", label: "Robots", category: "SYSTEM", coverageStatus: "SYSTEM_ROUTE", routeType: "SYSTEM", managementMode: "SYSTEM", publicRenderer: "src/app/robots.ts", allowedBlockTypes: [], requiredBlockTypes: [], optionalBlockTypes: [], plannedBlockTypes: [], collectionDependencies: [], seoPolicy: "NOT_APPLICABLE", mediaPolicy: "NOT_APPLICABLE", previewStrategy: "NONE", hasCodeControlledFunctionality: true, migrationWave: "WAVE_0", priority: "P3", enabled: true }),
] as const satisfies readonly CmsPageRegistryEntry[];

export const AUDITED_PUBLIC_ROUTE_COUNT = 38;

export function normalizeCmsRoute(route: string) {
  if (route === "") return "/";
  const [withoutQuery] = route.split(/[?#]/);
  const normalized = withoutQuery.replace(/\/+$/, "");
  return normalized || "/";
}

function routePatternMatches(pattern: string, route: string) {
  const patternParts = normalizeCmsRoute(pattern).split("/").filter(Boolean);
  const routeParts = normalizeCmsRoute(route).split("/").filter(Boolean);
  return patternParts.length === routeParts.length && patternParts.every((part, index) => part.startsWith("[") && part.endsWith("]") ? routeParts[index].length > 0 : part === routeParts[index]);
}

export function matchCmsPageRegistryEntry(route: string) {
  const normalized = normalizeCmsRoute(route);
  return CMS_PAGE_REGISTRY.find((entry) => entry.canonicalRoute === normalized)
    ?? CMS_PAGE_REGISTRY.find((entry) => entry.routePattern && routePatternMatches(entry.routePattern, normalized));
}

export function getCmsPageRegistryEntryByRoute(route: string) {
  return matchCmsPageRegistryEntry(route);
}

export function getCmsPageRegistryEntryByCurrentSlug(slug: string) {
  return CMS_PAGE_REGISTRY.find((entry) => entry.currentCmsPageSlug === slug);
}

export function getCmsPageRegistryEntryByTargetSlug(slug: string) {
  return CMS_PAGE_REGISTRY.find((entry) => entry.targetCmsPageSlug === slug);
}

export function listEditableCmsPages() {
  return CMS_PAGE_REGISTRY.filter((entry) =>
    entry.enabled
    && entry.managementMode !== "SYSTEM"
    && entry.managementMode !== "LEGACY_REDIRECT"
    && (Boolean(entry.currentCmsPageSlug) || entry.coverageStatus === "COLLECTION_DRIVEN")
  );
}

export function listCmsManagedOrPlannedPages() {
  return CMS_PAGE_REGISTRY.filter((entry) =>
    entry.enabled
    && entry.managementMode !== "SYSTEM"
    && entry.managementMode !== "LEGACY_REDIRECT"
  );
}

export function listPagesByMigrationWave(wave: CmsMigrationWave) {
  return CMS_PAGE_REGISTRY.filter((entry) => entry.migrationWave === wave);
}

export function listPagesByCoverageStatus(status: CmsCoverageStatus) {
  return CMS_PAGE_REGISTRY.filter((entry) => entry.coverageStatus === status);
}

export function isRegisteredPublicRoute(route: string) {
  return Boolean(matchCmsPageRegistryEntry(route));
}

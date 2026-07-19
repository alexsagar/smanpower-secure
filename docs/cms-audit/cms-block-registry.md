# CMS Block Registry Audit

## Existing Block Types

| Block type | Server or client | Data source | Public renderer | Admin preview renderer | Editable fields | Media support | Validation | Empty-state behavior | Pages using it | Known limitation |
|---|---|---|---|---|---|---|---|---|---|---|
| introduction | client-safe presentational | block.content/rich fields | IntroductionBlock | direct import | content, rich body, media via editor | yes for supported media fields | weak | renders based on block | homepage/demo | field schema not explicit |
| manifesto | client-safe | block.content | ManifestoBlock | direct import | content JSON | no obvious media | weak | renders block | homepage/demo | hard to validate |
| statistics | server wrapper + pure grid | repository getStatistics | StatisticsBlock | StatisticsGrid | stats in homepage block | no | partial tests | public null when empty; admin placeholder | home | stats not reusable collection |
| service_list | client-safe | block.content.services | ServiceListBlock | direct import | services array | no | weak | likely blank/partial | home | no schema |
| pillar_grid | client-safe | block.content.pillars | PillarGridBlock | direct import | pillars array | no | weak | likely blank/partial | home | no schema |
| industry_grid | client-safe | block.content | IndustryGridBlock | direct import | cards/content | maybe no | weak | likely blank/partial | home | static alternative to dynamic industry grid |
| training_bento | client-safe | block.content | TrainingBentoBlock | direct import | cards/content | likely images | weak | likely blank/partial | home | no typed schema |
| map_intelligence | client-safe | block.content | MapIntelligenceBlock | direct import | content | no | weak | likely blank/partial | home | map/data not collection-backed |
| trust_centre | client-safe | block.content | TrustCentreBlock | direct import | content/cards | maybe no | weak | likely blank/partial | home | separate from ComplianceDocument |
| community | client-safe | block.content | CommunityBlock | direct import | content | maybe | weak | likely blank/partial | home | overlaps community impact hardcoded page |
| client_marquee | server wrapper + client renderer | repository getClientPartners | ClientMarqueeBlock | ClientMarqueeRenderer | heading/subheading | logo URL via partner model | tests | public null when empty; admin placeholder | home | partner logos not MediaAsset-backed |
| story_grid | client-safe | block.content | StoryGridBlock | direct import | content | maybe | weak | likely blank/partial | home | does not clearly query SuccessStory collection |
| insight_preview | client-safe | block.content | InsightPreviewBlock | direct import | content | maybe | weak | likely blank/partial | home | does not clearly query InsightArticle collection |
| final_cta | client-safe | block.content | FinalCTABlock | direct import | heading/body/CTA | no | weak | likely blank/partial | home | no link safety schema |
| image_text | client-safe | block + media fields | ImageTextBlock | direct import | rich text, image/video fields | yes | focused tests | renders based on media/content | demo pages | media field normalization needed |
| editorial | client-safe | block.content/rich | EditorialBlock | direct import | rich heading/body | no | weak | renders block | about/employers/ethical demo | no schema |
| stats_grid | client-safe | block.content | StatsGridBlock | direct import | stats array | no | weak | likely blank/partial | about demo | separate from StatisticsBlock |
| core_values | client-safe | block.content | CoreValuesBlock | direct import | values array | no | weak | likely blank/partial | about demo | no schema |
| process_flow | client-safe | block.content | ProcessFlowBlock | direct import | steps array | no | weak | likely blank/partial | employers demo | no schema |
| solutions_grid | client-safe | block.content | SolutionsGridBlock | direct import | cards array | maybe icons | weak | likely blank/partial | employers/ethical demo | no schema |
| advantage | client-safe | block.content | AdvantageBlock | direct import | cards/copy | no | weak | likely blank/partial | employers demo | no schema |
| pledge | client-safe | block.content | PledgeBlock | direct import | pledge copy | no | weak | likely blank/partial | ethical demo | no schema |
| timeline_grid | client-safe | block.content | TimelineGridBlock | direct import | timeline entries | no | weak | likely blank/partial | ethical demo | no dedicated Milestone collection |
| dynamic_industry_grid | server wrapper + pure renderer | Industry service | DynamicIndustryGridBlock | DynamicIndustryGridRenderer | intro block fields | collection image not rendered in grid | tests | public blank grid if no industries; admin placeholder | /industries | service filters and repository differ |
| dynamic_facilities_grid | server wrapper + pure renderer | TrainingFacility service | DynamicFacilitiesGridBlock | DynamicFacilitiesGridRenderer | intro block fields | collection images not rendered in grid | tests | public blank grid if no facilities; admin placeholder | /training-facilities | service orders by createdAt |
| dynamic_vault_grid | server wrapper + pure renderer | Compliance service | DynamicVaultGridBlock | DynamicVaultGridRenderer | intro block fields | document files not shown in card | tests | public blank grid if no docs; admin placeholder | /trust-centre | detail trust pages still hardcoded |

## ContentBlockType Values Not Registered

`src/types/content.ts` includes additional identifiers such as `text`, `rich_text`, `video_text`, `full_width_image`, `image_gallery`, `timeline`, `process_steps`, `team_grid`, `testimonial`, `faq_accordion`, `document_list`, `certification`, `cta_banner`, `divider`, `two_column`, `three_column`, `quote`, `table`, `related_content`, `contact_form`, `employer_enquiry`, and `job_listing`. These are not currently handled in `ContentBlockRenderer`.

## Proposed Missing Block Types

Only add when needed by migrated pages:

- `leadership_grid`: `/about/leadership`.
- `team_grid`: `/about/our-people`.
- `milestones`: `/about/our-story`.
- `office_locations`: `/contact`.
- `contact_details`: `/contact`, `/worker-grievance`, footer-adjacent pages.
- `faq`: employers, applications, grievance.
- `logo_grid`: partners/trust logos.
- `download_list`: trust centre and ethical policies.
- `compliance_documents`: trust centre collection output.
- `application_intro`: demand/career/workforce request pages.
- `legal_rich_text`: privacy and terms pages.
- `gallery` and `video`: training facility pages.
- `detail_template` or route-specific detail blocks for employer service, industry, facility, trust pages.

## Block System Risks

- `BlockEditor` is generic and does not enforce per-block schemas.
- `VisualPageEditor` duplicate/delete are UI-local until save; deletion of newly duplicated temp IDs may require persistence review.
- Dynamic server-backed block admin preview requires preloaded data; new dynamic blocks must follow that pattern.
- Public renderer is correctly server-only; keep it that way.

# CMS Coverage Audit

## Executive Summary

This audit found 38 public-facing routes: 36 page routes and 2 system-generated routes. CMS coverage is strong for the homepage and partial for several top-level marketing pages, but many visible subpages remain hardcoded in route files or in `src/lib/content.ts`. Collection-driven pages exist for demands, careers, news, insights, and success stories, but several use direct Prisma calls in page files rather than the repository/service layer.

The current CMS strengths are `CmsPage`, `CmsHeroSection`, `CmsContentBlock`, a server-only `ContentBlockRenderer`, and an admin preview renderer that keeps Prisma out of the browser. The main weakness is inconsistent adoption: top-level pages may use CMS blocks, while their child detail pages use hardcoded TypeScript arrays.

## Counts

- Total public routes found: 38
- Fully CMS-managed: 1
- Partially CMS-managed: 8
- Hardcoded / none: 14
- Collection-driven: 10
- Functional/code-controlled: 3
- System routes: 2
- Legacy redirects: 0 page rows; legacy `/en` and `/ne` locale redirects are handled by `src/proxy.ts`.

## Existing CMS Strengths

- `src/app/(public)/page.tsx` renders homepage hero and blocks from the content repository.
- `src/components/cms/ContentBlockRenderer.tsx` is marked `server-only`, preventing accidental client imports.
- `src/components/admin/content/AdminPreviewBlockRenderer.tsx` provides a client-safe preview path for dynamic server-backed blocks.
- `src/repositories/content-repository.ts` defines a public content contract that already includes pages, navigation, site settings, footer settings, demands, stories, industries, trust docs, training facilities, insights, statistics, partners, team, and media.
- `src/components/admin/content/VisualPageEditor.tsx` supports ordering, visibility, duplicate, delete, JSON editing, and live preview for CMS pages.

## Existing CMS Architecture Weaknesses

- Direct Prisma calls exist in public page files for careers, news, and insights, e.g. `src/app/(public)/careers/page.tsx`, `src/app/(public)/news/page.tsx`, and `src/app/(public)/insights/page.tsx`.
- Hardcoded child-page content lives in `src/lib/content.ts` for employers, ethical recruitment, industries, training facilities, and trust centre.
- Several subpages under `/about` are fully hardcoded route components.
- SEO is inconsistent: some pages use repository-backed `getPageSeo`, while hardcoded pages use static metadata and collection pages often generate SEO directly from model fields.
- Block validation and field-specific schemas are thin; `BlockEditor` edits broad JSON-like content without per-block typed validation.
- Existing block identifiers in `ContentBlockType` include many future types that are not registered in `ContentBlockRenderer`.

## Pages With The Most Hardcoded Visible Content

- `src/lib/content.ts:11` employers detail content.
- `src/lib/content.ts:130` ethical recruitment detail content.
- `src/lib/content.ts:254` industry detail content.
- `src/lib/content.ts:409` training facility detail content.
- `src/lib/content.ts:512` trust centre detail content.
- `src/app/(public)/about/leadership/page.tsx:15` leadership data.
- `src/app/(public)/about/our-story/page.tsx:13` milestones.
- `src/app/(public)/about/community-impact/page.tsx:14` impact pillars and `src/app/(public)/about/community-impact/page.tsx:21` stats.
- `src/app/(public)/contact/page.tsx:24` global offices.
- `src/app/(public)/employers/request-workforce/page.tsx:13` form dictionary and `src/app/(public)/employers/request-workforce/page.tsx:36` advantages.

## Hardcoded Data Duplicated Across Files

- Contact data appears in site settings/footer, `src/app/(public)/contact/page.tsx`, and `src/app/(public)/worker-grievance/page.tsx`.
- Training/facility concepts appear in `src/lib/content.ts`, `TrainingFacility` model, demo data, and dynamic facility blocks.
- Industry concepts appear in `src/lib/content.ts`, `Industry` model, demo data, and dynamic industry blocks.
- Trust/licence/certification content appears in `src/lib/content.ts`, `ComplianceDocument` model, demo data, and trust centre blocks.
- Statistics appear in homepage CMS block content and separate repository convenience methods.

## CMS Records Exist But Do Not Control All Visible Sections

Top-level pages using `getPageBySlug` and `ContentBlockRenderer` still have fallback/default visible copy in their route files:

- `src/app/(public)/about/page.tsx`
- `src/app/(public)/employers/page.tsx`
- `src/app/(public)/ethical-recruitment/page.tsx`
- `src/app/(public)/industries/page.tsx`
- `src/app/(public)/training-facilities/page.tsx`
- `src/app/(public)/trust-centre/page.tsx`

These pages should be considered PARTIAL until SEO, fallback hero text, and all visible sections are CMS-owned or intentionally registry-controlled.

## Missing Reusable Collections

- Leadership/team members: repository has `getTeamMembers`, but public leadership pages do not use it.
- Office locations: currently hardcoded in contact page.
- Company milestones: hardcoded in `/about/our-story`.
- FAQs: no clear reusable public FAQ collection.
- Trust logos/certifications/licences: partially represented by `ComplianceDocument`, but public pages still use hardcoded trust content.
- Contact information: partially represented by site settings, but not consistently used.

## Missing Block Types

Needed by current pages:

- `leadership_grid`
- `team_grid`
- `milestones`
- `office_locations`
- `contact_details`
- `faq`
- `logo_grid`
- `download_list`
- `compliance_documents`
- `application_intro`
- `legal_rich_text`
- `detail_template` variants for service/industry/facility/trust child pages

Already present but not fully enough alone:

- `image_text`
- `timeline_grid`
- `stats_grid`
- `core_values`
- `solutions_grid`
- `process_flow`
- `final_cta`

## Missing Preview Support

Admin preview exists for current registered CMS blocks and the server-backed datasets `statistics`, `client_marquee`, `dynamic_industry_grid`, `dynamic_facilities_grid`, and `dynamic_vault_grid`.

Preview is missing for future collection/template pages such as leadership, office locations, milestones, legal rich text, form intro blocks, and collection detail templates.

## SEO Coverage Gaps

- Hardcoded pages use static `metadata` rather than `SEOPageMeta`.
- Collection detail pages mostly generate metadata from collection model fields.
- Listing pages for news/insights query SEO meta directly through Prisma rather than through a repository.
- Sitemap uses direct Prisma and a static route list in `src/app/sitemap.ts`, so future CMS page registry changes must also update sitemap logic.

## Media-Library Integration Gaps

- CMS block editing supports `MediaInput` for some managed media fields.
- Hardcoded pages reference `/images/...` paths directly.
- `src/lib/content.ts` stores image paths, not media asset IDs.
- Leadership, office, milestones, and legal pages do not have media-library-backed fields.

## Navigation And Footer Management Gaps

- Header navigation comes from repository-managed `NavigationItem` data.
- Footer settings and legal/social links come through `getFooterSettings` and `getSiteSettings`.
- Footer contact/social filtering is code-controlled for safety.
- Route-level content and footer references can diverge when hardcoded route copy references contacts independently of site settings.

## Empty-State Risks

- Public dynamic CMS blocks often return null for empty collections.
- Admin preview shows placeholders for some server-backed empty data.
- Listing pages have page-specific empty states, not CMS-managed empty-state copy.
- Empty states for industries/training/trust grids should be standardized before migration.

## Client/Server Boundary Risks

No current client CMS component in the inspected CMS editor path imports Prisma, `PrismaContentRepository`, or `content-resolver`. Risk remains if future block renderers copy server-backed components directly into `AdminPreviewBlockRenderer`.

The boundary pattern to preserve:

- Public renderer: server component imports server-backed blocks.
- Admin preview: client component imports pure renderers and receives serializable preview data.

## Recommended Phased Migration Plan

1. Foundation: page registry, block schemas, preview data registry, SEO policy.
2. About pages: leadership/team, milestones, people, impact.
3. Employers and ethical recruitment detail pages.
4. Industries/training/trust centre collections and detail templates.
5. Home/global settings cleanup.
6. Contact/grievance/legal pages.
7. Listing/detail templates and repository consistency.
8. Remove hardcoded fallbacks after staged content validation.

## Definition Of Done

- Every public route is represented in a CMS page registry or explicitly marked code-controlled.
- Every visible non-functional section is editable through `CmsPage` blocks or a dedicated collection.
- Functional pages separate CMS-safe copy from code-controlled validation/security.
- SEO source is defined per route.
- Media fields use `MediaAsset` where editors need control.
- Admin preview exists for every allowed public block and collection-backed block.
- Public empty states are intentional and tested.
- No Prisma/server repositories enter client bundles.

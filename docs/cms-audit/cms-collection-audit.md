# CMS Collection Audit

## Leadership / Team Members

- Current model: no dedicated normalized leadership model; repository exposes `getTeamMembers()` from `SiteSetting` key `team_members` in `src/repositories/prisma-content-repository.ts:1077`.
- Current admin route: none found for team members.
- Current repository/service: `ContentRepository.getTeamMembers`.
- Current public renderer: not used by `/about/leadership` or `/about/our-people`.
- Media support: URL-backed photo mapping through repository.
- Ordering support: yes in record shape.
- Draft/publish support: `isPublished` only.
- Visibility support: `isPublished`.
- Soft-delete/archive support: no.
- Admin preview support: no.
- Missing capabilities: admin CRUD, media picker integration, leadership/person categories, localized fields.
- Recommended action: create first-class TeamMember admin management or formalize the SiteSetting-backed collection.

## Client Partners

- Current model: `ClientPartner` in `prisma/schema.prisma:1048`.
- Current admin route: `src/app/admin/(dashboard)/partners/page.tsx`.
- Current repository/service: `getClientPartners()` in content repository.
- Current public renderer: `ClientMarqueeBlock` / `ClientMarqueeRenderer`.
- Media support: logo URL, not clearly MediaAsset-backed.
- Ordering support: yes.
- Draft/publish support: public/private only.
- Visibility support: `isPublic`, `isVerified`.
- Soft-delete/archive support: not evident.
- Admin preview support: yes via `AdminPreviewBlockRenderer`.
- Missing capabilities: MediaAsset logo relation, richer partner categories, archive/deletion lifecycle.
- Recommended action: keep model; add MediaAsset linkage and status lifecycle if needed.

## Statistics

- Current model: no dedicated Prisma model; stats are read from a published homepage `CmsContentBlock` in `getStatistics()`.
- Current admin route: CMS page editor.
- Current repository/service: `ContentRepository.getStatistics`.
- Current public renderer: `StatisticsBlock` / `StatisticsGrid`.
- Media support: none.
- Ordering support: `order` field inside JSON.
- Draft/publish support: through CmsPage/CmsContentBlock visibility/status.
- Visibility support: block visibility only.
- Soft-delete/archive support: through block deletion/revisions only.
- Admin preview support: yes.
- Missing capabilities: scoped statistics collection, reuse across pages, per-stat visibility.
- Recommended action: keep JSON for homepage if sufficient; create Statistic collection if reused across impact/about pages.

## Testimonials

- Current model: `Testimonial` in `prisma/schema.prisma:1023`.
- Current admin route: none found.
- Current repository/service: `getPublishedTestimonials()`.
- Current public renderer: no prominent current CMS block found.
- Media support: URL-backed image mapping.
- Ordering support: yes.
- Draft/publish support: `isPublished`.
- Visibility support: `isPublished`, `consentGiven`.
- Soft-delete/archive support: not evident.
- Admin preview support: no.
- Missing capabilities: admin CRUD, consent management UI, testimonial grid block.
- Recommended action: add admin management and `testimonial_grid` block only when public pages require testimonials.

## Industries

- Current model: `Industry` in `prisma/schema.prisma:774`.
- Current admin route: no dedicated route found.
- Current repository/service: content repository and `src/services/industries.service.ts`.
- Current public renderer: dynamic industry grid; detail pages use hardcoded `src/lib/content.ts`.
- Media support: URL image field/repository maps to media-like asset.
- Ordering support: yes.
- Draft/publish support: no; `isActive`.
- Visibility support: `isActive`.
- Soft-delete/archive support: not evident.
- Admin preview support: grid preview yes.
- Missing capabilities: admin CRUD, rich detail content, media gallery, SEO.
- Recommended action: make Industry the source for `/industries/[slug]` and add pageContent/SEO support.

## Training Facilities

- Current model: `TrainingFacility` in `prisma/schema.prisma:840`.
- Current admin route: `src/app/admin/(dashboard)/training/page.tsx` and `/training/new`.
- Current repository/service: content repository and `src/services/facilities.service.ts`.
- Current public renderer: dynamic facilities grid; detail pages use hardcoded `src/lib/content.ts`.
- Media support: JSON images array.
- Ordering support: not clearly explicit in model; service orders by createdAt.
- Draft/publish support: no; `isActive`.
- Visibility support: `isActive`.
- Soft-delete/archive support: not evident.
- Admin preview support: grid preview yes.
- Missing capabilities: ordered list, rich detail sections, MediaAsset gallery, SEO.
- Recommended action: extend facility collection before migrating detail pages.

## Compliance Documents / Certifications / Licences

- Current model: `ComplianceDocument` in `prisma/schema.prisma:884`.
- Current admin route: `src/app/admin/(dashboard)/compliance/page.tsx` and `/compliance/new`.
- Current repository/service: content repository and `src/services/compliance.service.ts`.
- Current public renderer: dynamic vault grid; detail pages use hardcoded `src/lib/content.ts`.
- Media support: file URL / document fields.
- Ordering support: yes.
- Draft/publish support: public/verified but no full draft workflow.
- Visibility support: `isPublic`, `isVerified`.
- Soft-delete/archive support: model appears to include deletion fields based on type errors observed in build work; confirm implementation.
- Admin preview support: grid preview yes.
- Missing capabilities: category landing templates, download list block, expiry warnings in public UI.
- Recommended action: consolidate trust centre detail pages around this collection.

## Success Stories

- Current model: `SuccessStory` in `prisma/schema.prisma:973`.
- Current admin route: `src/app/admin/(dashboard)/stories`.
- Current repository/service: content repository.
- Current public renderer: listing and detail pages.
- Media support: featured image relation.
- Ordering support: by story/published date.
- Draft/publish support: status.
- Visibility support: status and person-name controls.
- Soft-delete/archive support: not fully confirmed.
- Admin preview support: no page-template preview.
- Missing capabilities: CMS-managed listing intro and related story blocks.
- Recommended action: keep collection; add CmsPage wrapper content for listing.

## FAQs

- Current model: none found.
- Current admin route: none.
- Current repository/service: none.
- Current public renderer: none.
- Media support: not applicable.
- Ordering support: none.
- Draft/publish support: none.
- Visibility support: none.
- Soft-delete/archive support: none.
- Admin preview support: no.
- Missing capabilities: reusable FAQ groups for employers, applications, ethical recruitment, grievance.
- Recommended action: add only after page migration identifies repeated FAQ needs.

## Office Locations

- Current model: none found.
- Current admin route: none.
- Current repository/service: site settings only for headquarters/contact lines.
- Current public renderer: hardcoded `globalOffices` in `src/app/(public)/contact/page.tsx:24`.
- Media support: no.
- Ordering support: no.
- Draft/publish support: no.
- Visibility support: no.
- Soft-delete/archive support: no.
- Admin preview support: no.
- Missing capabilities: branch offices, maps, contact channels.
- Recommended action: create OfficeLocation collection or structured SiteSetting field.

## Company Milestones

- Current model: none found.
- Current admin route: none.
- Current repository/service: none.
- Current public renderer: hardcoded `/about/our-story`.
- Media support: no.
- Ordering support: hardcoded array order.
- Draft/publish support: no.
- Visibility support: no.
- Soft-delete/archive support: no.
- Admin preview support: no.
- Missing capabilities: milestone date/order, media, status.
- Recommended action: create Milestone collection or timeline block for About Story.

## Trust Logos

- Current model: no explicit trust logo collection.
- Current admin route: none.
- Current repository/service: ClientPartner and ComplianceDocument partially overlap.
- Current public renderer: no dedicated logo grid found.
- Media support: not structured.
- Ordering support: not structured.
- Draft/publish support: not structured.
- Visibility support: not structured.
- Soft-delete/archive support: not structured.
- Admin preview support: no.
- Missing capabilities: logo grid, source/category labels.
- Recommended action: use `logo_grid` block backed by MediaAsset or ClientPartner-like collection if real logos are needed.

## Contact Information / Social Links

- Current model: `SiteSetting`, `NavigationItem`.
- Current admin route: settings/navigation route not clearly found; SEO route exists.
- Current repository/service: `getSiteSettings()`, `getFooterSettings()`.
- Current public renderer: `Header`, `Footer`, contact page partly.
- Media support: logo URL in settings.
- Ordering support: footer sections/social links have order.
- Draft/publish support: no.
- Visibility support: social links have `isActive`.
- Soft-delete/archive support: no.
- Admin preview support: no.
- Missing capabilities: consistent use across contact/grievance pages.
- Recommended action: centralize all contact and office references through settings/office collection.

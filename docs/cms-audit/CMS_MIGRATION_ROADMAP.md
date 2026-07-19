# CMS Migration Roadmap

## Wave 0: CMS Architecture Foundation

- Pages: all future migrations.
- New collections: none unless page registry storage is modeled.
- New block types: registry metadata only.
- Schema impact: likely page registry fields or config table; no migration in audit phase.
- Migration requirements: define canonical route to CMS slug mapping.
- Admin UI work: allowed block type registry, per-block validation, preview-data registry.
- Public rendering work: registry-driven template resolver.
- Preview work: formalize preview datasets and empty states.
- Tests: server/client boundary tests, block schema tests, registry route tests.
- Staging checks: ensure no Prisma enters client bundle.
- Rollback: registry can be read-only/config-first.
- Dependencies: none.

## Wave 1: About Pages And Leadership/Team

- Pages: `/about`, `/about/our-story`, `/about/mission-vision-values`, `/about/leadership`, `/about/our-people`, `/about/community-impact`.
- New collections: TeamMember/Leadership if SiteSetting-backed team is insufficient; Milestone if story timeline remains reusable.
- New block types: `leadership_grid`, `team_grid`, `milestones`, `stats_grid` improvements.
- Schema impact: team/milestone collection or structured settings.
- Migration requirements: seed current hardcoded leaders, departments, milestones, impact pillars.
- Admin UI work: team/milestone CRUD and ordering.
- Public rendering work: replace hardcoded route sections with CMS blocks/collections.
- Preview work: collection-backed preview data.
- Tests: public rendering, empty states, admin preview.
- Staging checks: verify leadership names/photos and SEO.
- Rollback: retain old hardcoded route behind feature flag until content verified.
- Dependencies: Wave 0 registry.

## Wave 2: Employers And Ethical Recruitment

- Pages: `/employers`, `/employers/[slug]`, `/employers/request-workforce`, `/ethical-recruitment`, `/ethical-recruitment/[slug]`.
- New collections: EmployerService or CMS child pages; EthicalPolicy if policy pages need review workflow.
- New block types: `feature_grid`, `process_steps`, `application_intro`, `faq`, `download_list`.
- Schema impact: child-page model or collection content fields.
- Migration requirements: move `src/lib/content.ts` employer/ethical arrays into CMS.
- Admin UI work: child page editing, safe form copy fields.
- Public rendering work: detail template reads CMS/collection.
- Preview work: detail page preview.
- Tests: notFound behavior, form boundary tests.
- Staging checks: do not alter workforce request validation.
- Rollback: keep `src/lib/content.ts` fallback temporarily.
- Dependencies: Wave 0.

## Wave 3: Industries, Training Facilities And Trust Centre

- Pages: `/industries`, `/industries/[slug]`, `/training-facilities`, `/training-facilities/[slug]`, `/trust-centre`, `/trust-centre/[slug]`.
- New collections: extend existing Industry, TrainingFacility, ComplianceDocument rather than duplicate.
- New block types: `gallery`, `video`, `download_list`, `compliance_documents`, `logo_grid`.
- Schema impact: rich detail/pageContent, SEO, ordered galleries, MediaAsset relations.
- Migration requirements: reconcile `src/lib/content.ts` arrays with existing Prisma records.
- Admin UI work: industry CRUD, facility rich editor, compliance category pages.
- Public rendering work: collection-driven detail templates.
- Preview work: collection detail preview.
- Tests: empty public data, media rendering, SEO.
- Staging checks: verify public-only documents and no private files leak.
- Rollback: keep hardcoded detail fallback until collection parity.
- Dependencies: Wave 0 media/preview conventions.

## Wave 4: Home Page And Global Site Content

- Pages: `/`, header/footer global content.
- New collections: optional Statistic collection if reused; strengthen ClientPartner media.
- New block types: `testimonial_grid`, `logo_grid` if needed.
- Schema impact: statistics collection optional.
- Migration requirements: normalize homepage dynamic block datasets.
- Admin UI work: partner/logo/stat editing if not already sufficient.
- Public rendering work: keep server renderer and dynamic block wrappers.
- Preview work: stronger empty-state previews.
- Tests: homepage block order and client bundle boundary.
- Staging checks: homepage visual parity.
- Rollback: current CMS blocks remain source.
- Dependencies: prior collection decisions.

## Wave 5: Contact, Grievance And Legal Pages

- Pages: `/contact`, `/worker-grievance`, `/privacy-policy`, `/terms-of-service`.
- New collections: OfficeLocation; LegalPage if legal content requires approval workflow.
- New block types: `contact_details`, `office_locations`, `legal_rich_text`, `faq`.
- Schema impact: office/legal structured content.
- Migration requirements: seed hardcoded offices and legal copy. Keep `/ethical-recruitment/privacy-policy` as a legacy redirect to canonical `/privacy-policy`.
- Admin UI work: legal editing with restricted roles and review workflow.
- Public rendering work: contact/grievance pages read settings/office/legal content.
- Preview work: legal/contact preview.
- Tests: no validation/security edits exposed.
- Staging checks: legal review required.
- Rollback: route fallback copy; the legacy privacy redirect remains in place.
- Dependencies: Wave 0 and auth/RBAC policy.

## Wave 6: Listing And Dynamic Detail Templates

- Pages: `/demands`, `/demands/[slug]`, `/demands/[slug]/apply`, `/careers`, `/careers/[slug]`, `/news`, `/news/[slug]`, `/insights`, `/insights/[slug]`, `/success-stories`, `/success-stories/[slug]`, `/search`, `/jobs`.
- New collections: none for existing models; repository wrappers for direct Prisma pages.
- New block types: `listing_intro`, `application_intro`, `related_content`.
- Schema impact: optional route-level CMS page wrappers for listings.
- Migration requirements: map listing route slugs to CMS pages.
- Admin UI work: template copy and SEO editing.
- Public rendering work: repository consistency for direct Prisma pages.
- Preview work: listing intro previews.
- Tests: collection visibility, no private/draft leakage.
- Staging checks: compare listing counts and canonical URLs.
- Rollback: old page components.
- Dependencies: Wave 0 registry.

## Wave 7: Hardcoded Fallback Removal And Cleanup

- Pages: all migrated pages.
- New collections: none.
- New block types: none.
- Schema impact: none unless removing deprecated fields.
- Migration requirements: verify production content parity.
- Admin UI work: content completeness checks.
- Public rendering work: remove `src/lib/content.ts` and route fallback copy only after coverage.
- Preview work: complete preview parity.
- Tests: route snapshot/semantic checks, sitemap route consistency.
- Staging checks: SEO, redirects, sitemap, robots, no client Prisma.
- Rollback: retain a tagged branch or config fallback until stable.
- Dependencies: Waves 1-6 complete.

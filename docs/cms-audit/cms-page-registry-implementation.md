# CMS Page Registry Implementation

## Location

- Registry data and helpers: `src/lib/cms/page-registry.ts`
- Registry types: `src/lib/cms/page-registry.types.ts`
- Focused tests: `src/lib/cms/__tests__/page-registry.test.ts`

## Scope

This is Wave 0 foundation only. The registry describes the current public route inventory and future CMS intent. It is not wired into public rendering, sitemap generation, admin routing, Prisma, or migrations.

## Matching Rules

- Exact static routes are checked first.
- Dynamic patterns then match one path segment per `[slug]` token.
- Query strings, hashes, and trailing slashes are ignored before matching.
- `/ethical-recruitment/privacy-policy` is an exact static entry, so it wins over `/ethical-recruitment/[slug]`.

## Current Editable vs Planned Pages

- `listEditableCmsPages()` returns only enabled routes currently editable through a real CMS page slug or a dedicated collection.
- The expected current editable count is 17: 7 verified CMS page-backed routes and 10 collection-driven routes.
- `listCmsManagedOrPlannedPages()` returns enabled non-system, non-legacy routes that are either currently managed or planned for future CMS management.
- Hardcoded pending routes are planned, not currently editable.

## Legacy Redirects

- Legacy redirect entries use `coverageStatus: "LEGACY_REDIRECT"`, `routeType: "LEGACY_REDIRECT"`, and `managementMode: "LEGACY_REDIRECT"`.
- `redirectTarget` stores the canonical destination.
- `/ethical-recruitment/privacy-policy` redirects to `/privacy-policy` and has no current or target CMS page slug.

## Current vs Target Slugs

- `currentCmsPageSlug` is set only for pages already verified as CMS-backed: `home`, `about`, `employers`, `ethical-recruitment`, `industries`, `training-facilities`, and `trust-centre`.
- `targetCmsPageSlug` records planned migration destinations. It does not imply a database record exists.
- Collection-driven and functional routes keep current CMS slugs empty unless a real `CmsPage` mapping already exists.

## Future Updates

When a migration wave lands:

1. Create or migrate the actual CMS data.
2. Add any new block renderers or collections separately.
3. Update this registry from `HARDCODED_PENDING_MIGRATION` or `COLLECTION` to the new honest state.
4. Add focused tests for the changed route and any new block allowance.

## What The Registry Does Not Control

- Zod validation
- Turnstile
- upload security
- consent rules
- application eligibility
- authentication and authorization
- database transactions
- public rendering behavior
- Google Translate routing
- environment configuration

## Client/Server Safety

The registry is pure serializable data plus pure route helpers. It must not import Prisma, repositories, `content-resolver`, `server-only`, authentication modules, or environment variables.

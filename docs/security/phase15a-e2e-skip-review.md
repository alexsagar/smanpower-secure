# Phase 15A E2E Skip Review

## Summary

Current skipped E2E coverage does not hide an already-supported security-critical media workflow. The skips are existing QA infrastructure or assertion issues and should be handled separately.

## Classified Skips

### `tests/e2e/demand.spec.ts`

- Classification: temporary QA limitation
- Scope: public demand listing/detail smoke coverage
- Reason:
  The file depends on a seeded QA demand with a stable known slug and company name. The current E2E pipeline does not guarantee that exact seeded record shape at runtime.
- Security impact:
  Not a current media or auth bypass gap. This is coverage debt for seeded public-demand verification.

### `tests/e2e/demand-lifecycle.spec.ts`

- Classification: temporary QA limitation
- Skipped tests:
  - `Publish makes it public, gives JobPosting, updates sitemap`
  - `Update changes public content after revalidation`
- Reason:
  These tests create or mutate demand records directly through Prisma during E2E, but the production-style build under test serves cached/static demand pages that do not reflect those writes without an explicit revalidation path designed for the test flow.
- Security impact:
  Not a currently hidden auth or privacy defect. This is stale E2E infrastructure around cache invalidation.

### `tests/e2e/forms.spec.ts`

- Classification: stale test
- Skipped test:
  - `Contact form requires validation`
- Reason:
  The assertion expects inline error text inside the form node, but the application renders validation feedback outside that DOM node. The behavior under test is real; the locator strategy is wrong.
- Security impact:
  No evidence that this masks a supported security-critical workflow. It is an assertion bug.

## Result

No skipped test needed to be enabled before Phase 15A media work. None of the current skips conceal a supported media-permission, document-access, or authentication regression.

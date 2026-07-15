# Media migration runbook

This runbook covers the authoritative media migration:

- `prisma/migrations/20260715064834_add_authoritative_media_placements`

It was validated only on local `smanpower_qa`. Do not target production `neondb` during staging preparation.

## 1. Prerequisites

1. Confirm the target database is staging, not production.
2. Confirm the app branch includes commit `4587cbe` or later.
3. Confirm `npm run migrate:deploy` is available and `vercel-build` does not run migrations.
4. Confirm the target environment has staging-only URLs, secrets, and `DEMO_MODE=false`.

## 2. Target verification

Before running any migration:

1. Verify `APP_ENV=staging`.
2. Verify the database name is `smanpower_staging`.
3. Verify the database is not production `neondb`.
4. Verify the hostname and project correspond to the staging Neon project.

## 3. Backup requirement

1. Create a fresh database backup or branch backup before migration.
2. Record the backup identifier with timestamp.
3. Do not continue without a verified restore path.

## 4. Disposable migration-test procedure

1. Restore or branch staging data into a disposable Neon test database.
2. Point `DATABASE_URL` and `DIRECT_URL` to that disposable target only.
3. Run `npm run migrate:deploy`.
4. Run `npx tsx src/scripts/verify-media-migration.ts`.
5. Run `npm run build`.
6. Smoke-test public CMS pages and admin media flows.

## 5. Staging migration procedure

1. Verify the target again.
2. Create and confirm the staging backup.
3. Run `npm run migrate:deploy`.
4. Run `npx tsx src/scripts/verify-media-migration.ts`.
5. Run the application build.
6. Open the staging site and verify media-backed CMS pages.

## 6. Row-count checks

Record and review:

- `MediaAsset` total row count
- `CmsHeroSection` total row count
- `CmsContentBlock` total row count

The verification script prints these counts for audit comparison.

## 7. Null and backfill checks

After migration:

1. `MediaAsset.resourceType` must exist.
2. `MediaAsset.resourceType` null count must be `0`.
3. Existing `MediaAsset` rows must still be present.

## 8. Foreign-key and index checks

Verify these schema objects exist:

- `MediaAsset_resourceType_idx`
- `CmsHeroSection_posterImageId_fkey`
- `CmsHeroSection_mobileImageId_fkey`
- `CmsContentBlock_videoId_fkey`
- `CmsContentBlock_posterImageId_fkey`
- `CmsContentBlock_mobileImageId_fkey`

The verification script checks the expected columns, indexes, and foreign keys.

## 9. Application build verification

After migration:

1. Run `npm run build`.
2. Confirm the build does not attempt a migration.
3. Confirm Prisma client generation still succeeds.

## 10. Rollback decision process

Rollback is a deployment decision, not an automatic script step.

Stop and restore from backup if any of these happen:

- migration reports an error;
- `resourceType` backfill leaves null rows;
- required foreign keys or indexes are missing;
- admin CMS/media pages fail to load after migration;
- public CMS pages fail to render existing image-only content.

## 11. Explicit production warning

Do not point this process at production `neondb` during staging preparation.
Production migration remains a separate, later, explicitly approved release step.

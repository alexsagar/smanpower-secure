# CMS Backup and Restore Runbook

## What `npm run cms:export` (target `backup`) produces

`src/scripts/cms-export.ts` writes `prisma/backups/cms-backup-<timestamp>.json`.

**Included** (full table dumps): `CmsPage` (with its `CmsHeroSection` and
`CmsContentBlock` rows nested), `SEOPageMeta`, `MediaAsset`, `NavigationItem`,
`SiteSetting`, `Industry`, `TrainingFacility`, `ComplianceDocument`,
`SuccessStory`, `InsightArticle`.

**Excluded — NOT recoverable from this file**: users, accounts/sessions, MFA
data, audit logs, applicants/candidates, demands, partners, permissions/roles,
every other table, and all binary media stored in R2 (only `MediaAsset`
metadata rows are exported, never the objects).

This is a **CMS-content backup, not a database backup.**

## Export verification

Verification is not a file-size or "JSON parses" check. After writing the file
the script re-reads it and, for every exported collection, compares the row
count in the file against a live `count()` on the source database. It also
checks the relationships `cms-import.ts` replays: every hero and content block
resolves to an exported page, and every navigation child resolves to an
exported parent. Counts are read at run time; none are hard-coded. Any mismatch
throws and the export is treated as failed.

## Restore options

### 1. JSON importer — non-production only

`src/scripts/cms-import.ts` is destructive: inside one transaction it deletes
every CMS table listed above and replays the backup. The safe runner therefore:

- refuses `--target=restore` against the production database outright;
- requires `--apply` (there is no dry-run restore);
- requires `--confirm-production` to acknowledge the wipe, even on a
  non-production database.

```
node scripts/run-production-cms-seed.mjs --target=restore \
  --env-file=.env.test --file=prisma/backups/cms-backup-<ts>.json \
  --apply --confirm-production
```

**Verified round trip (2026-09-21)** against the isolated disposable
`smanpower_qa` local Postgres database: export → import → export. Row counts
matched on both passes (pages 6, seoMeta 6, navigationItems 2, contentBlocks 5,
all other collections 0), parent/child relationships resolved, and the two
export files were byte-identical, confirming ids and relations survive the
round trip. No restore has been executed against production or staging.

### 2. Database-level recovery — the production path

Production runs on Neon. Recovery for production uses Neon's branch /
point-in-time restore, which covers the whole database including the tables the
JSON export excludes. Production restore via the JSON importer stays disabled
until it has been rehearsed against a production-shaped isolated branch.

## Backup file handling

Backup files may contain company and applicant-adjacent content. They are
written to `prisma/backups/`, which is git-ignored (`.gitignore`, "# backups"),
and must never be committed, placed under `public/`, or attached to a public
artifact.

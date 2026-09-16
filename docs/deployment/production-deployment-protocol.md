# Production Deployment Safety Protocol & Runbook (Phase 1B.2A-S2)

**Domain:** `https://smanpower.com`  
**Cloudflare Worker:** `smanpower-secure`  
**Authoritative Repository:** `https://github.com/alexsagar/smanpower-secure.git`  
**Authoritative Production Branch:** `main`  

---

## 1. Golden Promotion Pipeline

All code heading to production must follow the strict four-stage promotion path:

```
dev  ──(PR)──>  staging  ──(PR)──>  main  ──(Safe Build & Deploy)──>  production
```

Direct pushes to `staging` or `main` are strictly forbidden.  
Deployments from branches other than `main` are blocked by automated safety guards.

---

## 2. Incidents & Root Cause Hardening History

### Incident 1: Stale Local Database Build Contamination (Phase 1B.2A-S)
* **Root Cause:** Next.js automatically loads `.env.local` during production builds, which pointed to an outdated July development Neon database instead of production.
* **Hardening:** Preflight guard blocks if `.env.local` contains production-critical variables (`DATABASE_URL`, `DIRECT_URL`, `APP_ENV`, etc.); `.env.production` is strictly isolated; `.env.local` is quarantined during builds.

### Incident 2: Cross-Build Local Cache Reuse Contamination (Phase 1B.2A-S2)
* **Root Cause:** Even with correct production database credentials, `.next/cache/fetch-cache` and `.open-next` persisted across builds. Next.js reused 114 disk-cached `unstable_cache` entries from July (including `cms-news: []` and old stats) during `next build`, completely bypassing the Neon database. OpenNext then packaged these stale files into the new `BUILD_ID` directory and deployed them to R2.
* **Correction of BUILD_ID Isolation Assumption:** `BUILD_ID` namespace isolation on R2 only prevents cross-deployment collisions in the cloud; it does **not** prevent OpenNext from copying stale disk files from `.next/cache/fetch-cache` into the new local `BUILD_ID` directory during compilation.
* **Hardening:**
  1. **Clean Pre-Build Isolation:** Mandatory automated purge of `.next`, `.open-next`, `.wrangler`, and previous manifests prior to build (`scripts/clean-build-isolation.mjs`).
  2. **Pre-Build Clean Guard:** Asserts complete absence of `.next`, `.open-next`, `.wrangler`, and 0 fetch-cache entries.
  3. **Production Content Truth Manifest:** Immediately before compilation, queries live Neon DB to generate `.production-build-truth.json` containing cryptographic hash, article titles/slugs, demands, home hero tokens, leadership, and build start time.
  4. **Post-Build Content-Truth Verification:** Inspects compiled `.next/server/app` HTML and `.open-next/cache` against truth manifest, asserts absence of "No news" / empty fallbacks, and verifies all `.next/cache/fetch-cache` entries have fresh modification times ($mtime \ge buildStartTime$).
  5. **Artifact Certification Manifest:** Emits `.production-artifact-manifest.json` binding exact Git SHA, BUILD_ID, fresh timestamp, and truth manifest hash.
  6. **Deploy Manifest Gate:** `deploy:production:safe` strictly verifies the artifact manifest before allowing `opennextjs-cloudflare deploy`.

---

## 3. Safe Production Deployment Commands

Raw `wrangler deploy` or direct `opennextjs-cloudflare deploy` from developer shells is **STRICTLY PROHIBITED**.  
You must always use the automated, hardened production commands:

### A. Certified Safe Production Build (Pre-flight, DB Sanity, Clean Isolation, Build & Truth Verification)
```bash
npm run build:production:safe
```
This command performs:
1. **Production Preflight Guard (`scripts/production-preflight.mjs`):**
   - Verifies checked-out branch is `main`.
   - Verifies working tree is clean.
   - Fetches and verifies local `main` matches `origin/main` with 0 unpushed commits.
   - Verifies `.env.local` does not contain production-critical variables.
   - Verifies application flags: `APP_ENV=production`, `DEMO_MODE=false`, `QA_MODE=false`, `SITE_URL=https://smanpower.com`.
   - Verifies database identity matches approved production Neon database fingerprints (`ep-steep-wave`).
2. **Production Content Sanity Gate (`scripts/production-content-sanity.mjs`):**
   - Queries the live database to confirm it contains active NewsArticles ($\ge 1$), Demands ($\ge 3$), CMS Pages ($\ge 50$), recent August 2026 insight revisions, and MediaAssets ($\ge 140$).
   - Blocks the build if an outdated database snapshot is detected.
3. **Clean Build Isolation (`scripts/clean-build-isolation.mjs`):**
   - Wipes `.next`, `.open-next`, `.wrangler`, `.production-build-truth.json`, and `.production-artifact-manifest.json`.
   - Clean guard verifies workspace is 100% free of previous build artifacts.
4. **Production Content Truth Manifest (`scripts/generate-production-truth-manifest.mjs`):**
   - Queries live Neon production DB and generates `.production-build-truth.json`.
5. **Prisma Generation & OpenNext Build:**
   - Runs `prisma generate` and hoists workerd exports (`scripts/prisma-workerd-exports.mjs`).
   - Runs `npx opennextjs-cloudflare build` inside an isolated `.env.production` context.
6. **Generated-Build Content-Truth Verification (`scripts/verify-generated-build.mjs`):**
   - Inspects compiled `.open-next` / `.next` artifacts.
   - Verifies /news contains all published articles from the truth manifest (no "No news" empty fallback).
   - Verifies /demands contains all active demands from the truth manifest.
   - Verifies Homepage contains hero eyebrow marker, brand token, Google Translate (`#google_translate_element`), and Organization schema.
   - Verifies Leadership name and Insight article SSR without fallback skeletons or OpenAI SVG leaks.
   - Verifies `.next/cache/fetch-cache` freshness ($mtime \ge buildStartTime$) and absence of stale `cms-news: []`.
   - Generates `.production-artifact-manifest.json` certifying the build.

### B. Certified Safe Production Deployment
```bash
npm run deploy:production:safe
```
This command:
1. Executes `npm run build:production:safe`.
2. **Artifact Certification Gate:** Verifies `.production-artifact-manifest.json`:
   - Status must be `CERTIFIED_FOR_DEPLOYMENT`.
   - Must match current Git HEAD SHA.
   - Must match current `BUILD_ID`.
   - Must match current truth manifest hash.
   - Must be less than 1 hour old.
3. Captures deployment audit metadata (Git SHA, previous active Worker version ID, timestamp).
4. Executes `npx opennextjs-cloudflare deploy`.
5. Executes automated live smoke tests against `https://smanpower.com` (`scripts/production-smoke-test.mjs`).
6. In the event of any health check failure, displays instant rollback instructions with the previous Worker version ID.

---

## 4. Environment File Isolation Rules

* **`.env.development.local`:**
  - Used exclusively for local development (`npm run dev`).
  - Contains development database connection strings and local secrets.
  - Next.js only loads this file when `NODE_ENV=development`. It is completely ignored during `next build` and production pipelines.
* **`.env.production`:**
  - Contains production database connection strings and non-secret production configuration flags.
  - Gitignored.
* **`.env.local`:**
  - **Do NOT put `DATABASE_URL`, `DIRECT_URL`, `APP_ENV`, `DEMO_MODE`, or `QA_MODE` in `.env.local`.**
  - Next.js loads `.env.local` with priority over `.env.production` during local builds. To prevent silent contamination, the preflight guard automatically aborts if `.env.local` contains any production-critical variables, and the safe build runner quarantines `.env.local` during builds.

---

## 5. Emergency Worker Rollback Procedure

If a deployed Worker version exhibits defects or regresses live production content:

1. **Check deployment history to identify the last known good Worker Version ID:**
   ```bash
   npx wrangler deployments list --name smanpower-secure
   ```
2. **Execute an immediate zero-downtime version rollback:**
   ```bash
   npx wrangler rollback <known-good-version-id> --yes
   ```
   *Example:*
   ```bash
   npx wrangler rollback 04ffd2d0-40dd-4c75-9348-49752c28bff5 --yes
   ```
3. **Verify live production health:**
   ```bash
   npm run production:smoke-test
   ```
4. **Do NOT rebuild from Git, revert commits, or purge database data during a rollback.** The rollback command instantaneously switches Cloudflare Worker routing to the previous compiled bundle.

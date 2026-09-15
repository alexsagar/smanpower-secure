# Production Deployment Safety Protocol & Runbook

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

## 2. Safe Production Deployment Commands

Raw `wrangler deploy` or direct `opennextjs-cloudflare deploy` from developer shells is **STRICTLY PROHIBITED**.  
You must always use the automated, hardened production commands:

### A. Certified Safe Production Build (Pre-flight, Sanity Gate & Verification only)
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
   - Queries the database to confirm it contains active NewsArticles ($\ge 1$), Demands ($\ge 3$), CMS Pages ($\ge 50$), recent August 2026 insight revisions, and MediaAssets ($\ge 140$).
   - Blocks the build if an outdated database snapshot (e.g. July 2026 with 0 news) is detected.
3. **Prisma Generation & OpenNext Build:**
   - Runs `prisma generate` and hoists workerd exports (`scripts/prisma-workerd-exports.mjs`).
   - Runs `npx opennextjs-cloudflare build` inside an isolated `.env.production` context.
4. **Generated-Build Content Verification (`scripts/verify-generated-build.mjs`):**
   - Inspects compiled `.open-next` / `.next` artifacts.
   - Verifies presence of Google Translate (`#google_translate_element`), Organization schema, valid insight `<title>` and canonical tags, and confirms absence of SSR crash fallback skeletons.

### B. Certified Safe Production Deployment
```bash
npm run deploy:production:safe
```
This command:
1. Executes `npm run build:production:safe`.
2. Captures deployment audit metadata (Git SHA, previous active Worker version ID, timestamp).
3. Executes `npx opennextjs-cloudflare deploy`.
4. Executes automated live smoke tests against `https://smanpower.com` (`scripts/production-smoke-test.mjs`).
5. In the event of any health check failure, displays instant rollback instructions with the previous Worker version ID.

---

## 3. Environment File Isolation Rules

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

## 4. Emergency Worker Rollback Procedure

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

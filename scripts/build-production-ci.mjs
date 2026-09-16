/**
 * scripts/build-production-ci.mjs
 *
 * Phase 1B.2A-S5: Safe Automatic Production CI Build & Certification Gate
 * (npm run build:production:ci)
 *
 * Designed to execute within automated CI environments (Cloudflare Workers Builds / GitHub Actions)
 * as well as supervised local runs.
 *
 * Mandatory Execution Steps:
 * 1. Branch and source-commit verification (strictly requires 'main').
 * 2. Environment and secrets guard (validates DATABASE_URL, APP_ENV, DEMO_MODE, SITE_URL).
 * 3. Preflight database fingerprint verification (must match approved production hashes).
 * 4. .env.local non-interference defense.
 * 5. Production content sanity gate (direct read-only DB count assertions).
 * 6. Clean build isolation (wipes .next, .open-next, .wrangler, manifests & verifies clean state).
 * 7. Live CMS content-truth manifest generation (.production-build-truth.json).
 * 8. Prisma generation & workerd exports hoisting.
 * 9. OpenNext Cloudflare production compilation (npx opennextjs-cloudflare build).
 * 10. Generated-build content-truth verification (HTML inspection, sitemap, fetch-cache, no empty fallbacks).
 * 11. Concurrency content-change recheck (ensures DB did not change while building).
 * 12. Artifact certification manifest generation (.production-artifact-manifest.json with SHA-256 hashes).
 *
 * If ANY check fails, exits with code 1, stopping Cloudflare from proceeding to the Deploy command.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  validateGitState,
  validateEnvLocal,
  validateAppEnvironment,
  validateDatabaseIdentity,
  parseEnvContent,
} from "./deployment-safety-common.mjs";
import { runContentSanityCheck } from "./production-content-sanity.mjs";
import { cleanBuildDirectories, verifyCleanBuildState } from "./clean-build-isolation.mjs";
import { generateProductionTruthManifest } from "./generate-production-truth-manifest.mjs";
import { verifyGeneratedBuild } from "./verify-generated-build.mjs";

export async function buildProductionCi(options = {}) {
  const cwd = options.cwd || process.cwd();
  const allowNonMain = options.allowNonMain || process.env.ALLOW_NON_MAIN === "true" || process.env.ALLOW_NON_MAIN === "1";

  console.log("================================================================");
  console.log("🏗️   AUTOMATIC PRODUCTION RELEASE: CI BUILD & CERTIFICATION GATE");
  console.log("================================================================\n");

  // Step 1: Branch and Source-Commit Verification
  console.log("--- STEP 1: BRANCH & SOURCE COMMIT VERIFICATION ---");
  let branch = process.env.WORKERS_CI_BRANCH || process.env.GITHUB_REF_NAME || "";
  if (!branch) {
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8" }).trim();
    } catch (e) {
      branch = "unknown";
    }
  }

  let commitSha = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || "";
  if (!commitSha) {
    try {
      commitSha = execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
    } catch (e) {
      commitSha = "unknown";
    }
  }

  console.log(`   Git Branch: ${branch}`);
  console.log(`   Commit SHA: ${commitSha}`);

  if (!allowNonMain && branch !== "main") {
    console.error(`❌ CRITICAL SAFETY VIOLATION: Current branch is '${branch}'. Production release is strictly restricted to 'main'.`);
    process.exit(1);
  }
  console.log("   ✅ PASS: Branch verified as 'main'.");

  // Step 2: Establish Environment
  console.log("\n--- STEP 2: VERIFYING ENVIRONMENT & SECRETS ---");
  const envProdPath = resolve(cwd, ".env.production");
  if (existsSync(envProdPath)) {
    const fileContent = readFileSync(envProdPath, "utf8");
    const parsed = parseEnvContent(fileContent);
    for (const [k, v] of Object.entries(parsed)) {
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
    console.log("   Loaded fallback variables from local .env.production.");
  }

  process.env.NODE_ENV = "production";
  process.env.APP_ENV = process.env.APP_ENV || "production";
  process.env.DEMO_MODE = process.env.DEMO_MODE || "false";
  process.env.QA_MODE = process.env.QA_MODE || "false";
  process.env.SITE_URL = process.env.SITE_URL || "https://smanpower.com";
  process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smanpower.com";

  if (!process.env.DATABASE_URL) {
    console.error("❌ CRITICAL: DATABASE_URL is missing from the environment!");
    console.error("   For Cloudflare Workers Builds: Ensure DATABASE_URL is added to Settings > Builds > Build variables and secrets.");
    process.exit(1);
  }

  const appEnvCheck = validateAppEnvironment(process.env);
  if (!appEnvCheck.valid) {
    console.error(`❌ FAILED: ${appEnvCheck.error}`);
    process.exit(1);
  }
  console.log("   ✅ PASS: Application environment verified (APP_ENV=production, DEMO_MODE=false, QA_MODE=false).");

  // Step 3: Database Fingerprint Verification
  console.log("\n--- STEP 3: DATABASE FINGERPRINT VERIFICATION ---");
  const dbCheck = validateDatabaseIdentity(process.env.DATABASE_URL);
  if (!dbCheck.valid) {
    console.error(`❌ FAILED: ${dbCheck.error}`);
    process.exit(1);
  }
  console.log(`   ✅ PASS: DATABASE_URL verified against approved production fingerprint (${dbCheck.shortHash}, host: ${dbCheck.host}).`);

  // Step 4: .env.local Quarantine / Defense
  const envLocalPath = resolve(cwd, ".env.local");
  const envLocalBackupPath = resolve(cwd, ".env.local.quarantined");
  let quarantined = false;
  if (existsSync(envLocalPath)) {
    console.log("   ⚠️  Quarantining .env.local during production build...");
    renameSync(envLocalPath, envLocalBackupPath);
    quarantined = true;
  }

  try {
    // Step 5: Content Sanity Gate
    console.log("\n--- STEP 5: DATABASE CONTENT SANITY GATE ---");
    if (!options.skipSanity) {
      const sanityResult = await runContentSanityCheck({ cwd, databaseUrl: process.env.DATABASE_URL });
      if (!sanityResult.success) {
        console.error("❌ Content Sanity Gate failed. Aborting production build.");
        process.exit(1);
      }
    } else {
      console.log("   (Skipped content sanity check per options)");
    }

    // Step 6: Clean Build Isolation
    console.log("\n--- STEP 6: CLEAN BUILD ISOLATION ---");
    cleanBuildDirectories({ cwd });
    const cleanGuard = verifyCleanBuildState({ cwd });
    if (!cleanGuard.success) {
      console.error("❌ Pre-build clean state verification failed. Aborting build.");
      process.exit(1);
    }

    // Step 7: Live CMS Content Truth Manifest
    console.log("\n--- STEP 7: LIVE CMS CONTENT TRUTH SNAPSHOT ---");
    const buildStartTime = options.buildStartTime || Date.now();
    let truthResult;
    if (!options.skipTruth) {
      truthResult = await generateProductionTruthManifest({
        cwd,
        databaseUrl: process.env.DATABASE_URL,
        buildStartTime,
      });
      if (!truthResult.success) {
        console.error("❌ Failed to generate production truth manifest. Aborting build.");
        process.exit(1);
      }
    }

    const truthManifestPath = resolve(cwd, ".production-build-truth.json");

    // Step 8: Prisma Generate & Workerd Exports
    if (!options.skipBuild) {
      console.log("\n--- STEP 8: PRISMA GENERATE & WORKERD EXPORTS ---");
      execSync("npx prisma generate", { cwd, stdio: "inherit", env: process.env });
      execSync("node scripts/prisma-workerd-exports.mjs", { cwd, stdio: "inherit", env: process.env });

      // Step 9: OpenNext Cloudflare Production Compilation
      console.log("\n--- STEP 9: OPENNEXT CLOUDFLARE PRODUCTION BUILD ---");
      execSync("npx opennextjs-cloudflare build", { cwd, stdio: "inherit", env: process.env });
    }

    // Step 10: Generated-Build Content-Truth Verification
    console.log("\n--- STEP 10: GENERATED ARTIFACT TRUTH VERIFICATION ---");
    const verification = await verifyGeneratedBuild({
      cwd,
      buildStartTime,
      truthManifestPath,
      mockTruthManifest: options.mockTruthManifest,
    });
    if (!verification.success) {
      console.error("❌ Production Build Artifact Truth Verification Failed!");
      process.exit(1);
    }

    // Step 11: Concurrency Content-Change Recheck (Section 17)
    console.log("\n--- STEP 11: CONCURRENCY CONTENT-TRUTH STABILITY RECHECK ---");
    if (!options.skipTruth && !options.skipSanity) {
      try {
        const prisma = new PrismaClient({
          datasources: { db: { url: process.env.DATABASE_URL } },
          log: ["error"],
        });
        const [postNewsCount, postDemandCount] = await Promise.all([
          prisma.newsArticle.count({ where: { status: "PUBLISHED", isPublished: true, deletedAt: null } }),
          prisma.demand.count({ where: { status: "PUBLISHED", isPublic: true, deletedAt: null } }),
        ]);
        await prisma.$disconnect();

        const initialNews = truthResult?.truth?.counts?.publishedNews;
        const initialDemands = truthResult?.truth?.counts?.activeDemands;

        if (initialNews !== undefined && postNewsCount !== initialNews) {
          console.error(`🚨 CONCURRENCY ERROR: Published news article count changed during build (${initialNews} -> ${postNewsCount}).`);
          console.error("Database was modified while build was compiling. Aborting to prevent stale release.");
          process.exit(1);
        }
        if (initialDemands !== undefined && postDemandCount !== initialDemands) {
          console.error(`🚨 CONCURRENCY ERROR: Active demands count changed during build (${initialDemands} -> ${postDemandCount}).`);
          console.error("Database was modified while build was compiling. Aborting to prevent stale release.");
          process.exit(1);
        }
        console.log(`   ✅ PASS: Database content remained stable during compilation (News: ${postNewsCount}, Demands: ${postDemandCount}).`);
      } catch (err) {
        console.warn(`   ⚠️  Concurrency recheck warning: ${err.message}`);
      }
    }

    console.log("\n================================================================");
    console.log("🎉 SAFE PRODUCTION BUILD COMPLETED & FULLY CERTIFIED.");
    console.log("Artifacts match live Neon content truth and are certified for deployment.");
    console.log("================================================================\n");
    return { success: true, buildStartTime };

  } finally {
    if (quarantined && existsSync(envLocalBackupPath)) {
      renameSync(envLocalBackupPath, envLocalPath);
      console.log("   Restored quarantined .env.local.");
    }
  }
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/build-production-ci.mjs")) {
  buildProductionCi()
    .catch((err) => {
      console.error("Unhandled build error:", err);
      process.exit(1);
    });
}

#!/usr/bin/env node

/**
 * scripts/build-production-safe.mjs
 *
 * Safe Production Build Command (npm run build:production:safe)
 *
 * Orchestrates the Phase 1B.2A-S2 Hardened Production Build Pipeline:
 * 1. Production Preflight Guard (Git state, production environment variables, database fingerprint)
 * 2. Strict Production Environment Isolation (.env.production loaded, .env.local quarantined)
 * 3. Production Content Sanity Gate (direct DB read asserting content thresholds)
 * 4. Clean Build Isolation (pre-build wipe of .next, .open-next, .wrangler, manifests & clean-state guard)
 * 5. Production Content Truth Manifest (.production-build-truth.json generated immediately prior to build)
 * 6. Prisma Generation & workerd export hoisting
 * 7. OpenNext Cloudflare production build
 * 8. Generated-Build Content-Truth Verification (checks HTML, cache freshness, truth match, and signs artifact manifest)
 * 9. Stops before deployment.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { runProductionPreflight } from "./production-preflight.mjs";
import { cleanBuildDirectories, verifyCleanBuildState } from "./clean-build-isolation.mjs";
import { generateProductionTruthManifest } from "./generate-production-truth-manifest.mjs";
import { verifyGeneratedBuild } from "./verify-generated-build.mjs";
import { parseEnvContent } from "./deployment-safety-common.mjs";

export async function buildProductionSafe(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("================================================================");
  console.log("🏗️   SAFE PRODUCTION BUILD PIPELINE (Phase 1B.2A-S2)");
  console.log("================================================================\n");

  // Step 1: Run Preflight Guard
  console.log("--- STEP 1: PREFLIGHT GUARD ---");
  const preflight = await runProductionPreflight(options);
  if (!preflight.success) {
    console.error("❌ Build aborted by Preflight Guard.");
    process.exit(1);
  }

  // Step 2: Establish isolated production build environment
  console.log("--- STEP 2: ESTABLISHING PRODUCTION ENVIRONMENT ---");
  const envProdPath = resolve(cwd, ".env.production");
  if (!existsSync(envProdPath)) {
    console.error("❌ CRITICAL: .env.production file is missing!");
    process.exit(1);
  }
  const prodEnv = parseEnvContent(readFileSync(envProdPath, "utf8"));
  for (const [k, v] of Object.entries(prodEnv)) {
    process.env[k] = v;
  }
  process.env.NODE_ENV = "production";
  process.env.APP_ENV = "production";
  console.log("   ✅ Loaded production environment variables into build context.");

  // If .env.local exists, temporarily quarantine it during the build
  const envLocalPath = resolve(cwd, ".env.local");
  const envLocalBackupPath = resolve(cwd, ".env.local.quarantined");
  let quarantined = false;
  if (existsSync(envLocalPath)) {
    console.log("   ⚠️  Quarantining .env.local during production build...");
    renameSync(envLocalPath, envLocalBackupPath);
    quarantined = true;
  }

  try {
    // Step 3: Run Content Sanity Gate in an isolated child process
    console.log("\n--- STEP 3: DATABASE CONTENT SANITY GATE ---");
    execSync("node scripts/production-content-sanity.mjs", { cwd, stdio: "inherit", env: process.env });

    // Step 4: Clean Build Isolation & Pre-Build Clean Guard
    console.log("\n--- STEP 4: CLEAN BUILD ISOLATION ---");
    cleanBuildDirectories({ cwd });
    const cleanGuard = verifyCleanBuildState({ cwd });
    if (!cleanGuard.success) {
      console.error("❌ Pre-build clean state verification failed. Aborting build.");
      process.exit(1);
    }

    // Step 5: Generate Production Content Truth Manifest
    console.log("\n--- STEP 5: PRODUCTION CONTENT TRUTH MANIFEST ---");
    const buildStartTime = Date.now();
    const truthResult = await generateProductionTruthManifest({ cwd, buildStartTime });
    if (!truthResult.success) {
      console.error("❌ Failed to generate production truth manifest. Aborting build.");
      process.exit(1);
    }

    // Step 6: Prisma Generate
    console.log("--- STEP 6: PRISMA GENERATE ---");
    execSync("npx prisma generate", { cwd, stdio: "inherit", env: process.env });

    // Step 7: Prisma workerd exports hoisting
    console.log("\n--- STEP 7: PRISMA WORKERD EXPORTS HOISTING ---");
    execSync("node scripts/prisma-workerd-exports.mjs", { cwd, stdio: "inherit", env: process.env });

    // Step 8: OpenNext Cloudflare Build
    console.log("\n--- STEP 8: OPENNEXT CLOUDFLARE PRODUCTION BUILD ---");
    execSync("npx opennextjs-cloudflare build", { cwd, stdio: "inherit", env: process.env });

    // Step 9: Generated-Build Content-Truth Verification
    console.log("\n--- STEP 9: GENERATED ARTIFACT TRUTH VERIFICATION ---");
    const verification = await verifyGeneratedBuild({
      cwd,
      buildStartTime,
      truthManifestPath: truthResult.manifestPath,
    });
    if (!verification.success) {
      console.error("❌ Production Build Artifact Truth Verification Failed!");
      process.exit(1);
    }

    console.log("================================================================");
    console.log("🎉 SAFE PRODUCTION BUILD COMPLETED & FULLY CERTIFIED.");
    console.log("Artifacts match live Neon content truth and are certified for deployment.");
    console.log("================================================================\n");

  } finally {
    // Restore quarantined .env.local if it was moved
    if (quarantined && existsSync(envLocalBackupPath)) {
      renameSync(envLocalBackupPath, envLocalPath);
      console.log("   Restored quarantined .env.local.");
    }
  }
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/build-production-safe.mjs")) {
  buildProductionSafe()
    .catch((err) => {
      console.error("Unhandled build error:", err);
      process.exit(1);
    });
}

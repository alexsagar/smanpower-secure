#!/usr/bin/env node

/**
 * scripts/build-production-safe.mjs
 *
 * Safe Production Build Command (npm run build:production:safe)
 *
 * Orchestrates:
 * 1. Production Preflight Guard
 * 2. Strict Production Environment Isolation (.env.production only, defends against .env.local)
 * 3. Production Content Sanity Gate (reads production database)
 * 4. Prisma Generation & workerd export hoisting
 * 5. OpenNext Cloudflare production build
 * 6. Generated-Build Content Verification
 * 7. Stops before deployment.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { runProductionPreflight } from "./production-preflight.mjs";
import { runContentSanityCheck } from "./production-content-sanity.mjs";
import { verifyGeneratedBuild } from "./verify-generated-build.mjs";
import { parseEnvContent } from "./deployment-safety-common.mjs";

export async function buildProductionSafe(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("================================================================");
  console.log("🏗️   SAFE PRODUCTION BUILD PIPELINE");
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
  // Inject prodEnv into process.env
  for (const [k, v] of Object.entries(prodEnv)) {
    process.env[k] = v;
  }
  process.env.NODE_ENV = "production";
  process.env.APP_ENV = "production";
  console.log("   ✅ Loaded production environment variables into build context.");

  // If .env.local exists, temporarily quarantine it during the build to guarantee
  // that Next.js cannot read it even if a developer created it locally.
  const envLocalPath = resolve(cwd, ".env.local");
  const envLocalBackupPath = resolve(cwd, ".env.local.quarantined");
  let quarantined = false;
  if (existsSync(envLocalPath)) {
    console.log("   ⚠️  Quarantining .env.local during production build...");
    renameSync(envLocalPath, envLocalBackupPath);
    quarantined = true;
  }

  try {
    // Step 3: Run Content Sanity Gate in an isolated child process (ensures native DLL handles are released)
    console.log("\n--- STEP 3: DATABASE CONTENT SANITY GATE ---");
    execSync("node scripts/production-content-sanity.mjs", { cwd, stdio: "inherit", env: process.env });

    // Step 4: Prisma Generate
    console.log("--- STEP 4: PRISMA GENERATE ---");
    execSync("npx prisma generate", { cwd, stdio: "inherit", env: process.env });

    // Step 5: Prisma workerd exports hoisting
    console.log("\n--- STEP 5: PRISMA WORKERD EXPORTS HOISTING ---");
    execSync("node scripts/prisma-workerd-exports.mjs", { cwd, stdio: "inherit", env: process.env });

    // Step 6: OpenNext Cloudflare Build
    console.log("\n--- STEP 6: OPENNEXT CLOUDFLARE PRODUCTION BUILD ---");
    execSync("npx opennextjs-cloudflare build", { cwd, stdio: "inherit", env: process.env });

    // Step 7: Generated Build Content Verification
    console.log("\n--- STEP 7: GENERATED ARTIFACT VERIFICATION ---");
    const verification = await verifyGeneratedBuild({ cwd });
    if (!verification.success) {
      console.error("❌ Production Build Artifact Verification Failed!");
      process.exit(1);
    }

    console.log("================================================================");
    console.log("🎉 SAFE PRODUCTION BUILD COMPLETED & FULLY VERIFIED.");
    console.log("Artifacts are certified safe and ready for deployment.");
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

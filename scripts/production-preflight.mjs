#!/usr/bin/env node

/**
 * scripts/production-preflight.mjs
 *
 * Production Preflight Guard
 * Enforces strict Git, environment, and database safety before any production build or deployment.
 * Exits with code 1 if ANY safety check fails.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateGitState,
  validateEnvLocal,
  validateAppEnvironment,
  validateDatabaseIdentity,
  parseEnvContent,
} from "./deployment-safety-common.mjs";

export async function runProductionPreflight(options = {}) {
  const cwd = options.cwd || process.cwd();
  const allowNonMain = options.allowNonMain || process.env.ALLOW_NON_MAIN === "true" || process.env.ALLOW_NON_MAIN === "1";
  const skipFetch = options.skipFetch || process.env.SKIP_GIT_FETCH === "true" || process.env.SKIP_GIT_FETCH === "1";

  console.log("================================================================");
  console.log("🛡️  PRODUCTION PREFLIGHT SAFETY GUARD");
  console.log("================================================================");

  const errors = [];

  // 1. Defend against .env.local
  console.log("1. Checking .env.local defense...");
  const envLocalCheck = validateEnvLocal({ cwd });
  if (!envLocalCheck.valid) {
    errors.push(`[ENV_LOCAL] ${envLocalCheck.error}`);
    console.error(`   ❌ FAILED: ${envLocalCheck.error}`);
  } else {
    console.log("   ✅ PASS: No unauthorized .env.local overrides detected.");
  }

  // 2. Git State Verification
  console.log("2. Checking Git state...");
  const gitCheck = validateGitState({ cwd, allowNonMain, skipFetch });
  if (!gitCheck.valid) {
    errors.push(`[GIT] ${gitCheck.error}`);
    console.error(`   ❌ FAILED: ${gitCheck.error}`);
  } else {
    console.log(`   ✅ PASS: Git branch is '${gitCheck.branch}', clean working tree, aligned with origin/main.`);
  }

  // 3. Resolve Production Environment
  console.log("3. Verifying production application environment...");
  // Load variables from process.env and .env.production
  const envProdPath = resolve(cwd, ".env.production");
  let combinedEnv = { ...process.env };
  if (existsSync(envProdPath)) {
    const fileContent = readFileSync(envProdPath, "utf8");
    const parsed = parseEnvContent(fileContent);
    combinedEnv = { ...parsed, ...combinedEnv };
  }

  const appEnvCheck = validateAppEnvironment(combinedEnv);
  if (!appEnvCheck.valid) {
    errors.push(`[APP_ENV] ${appEnvCheck.error}`);
    console.error(`   ❌ FAILED: ${appEnvCheck.error}`);
  } else {
    console.log(`   ✅ PASS: APP_ENV=production, DEMO_MODE=false, QA_MODE=false, SITE_URL=https://smanpower.com`);
  }

  // 4. Database Identity & Fingerprint Verification
  console.log("4. Verifying database identity and fingerprint...");
  const dbUrl = combinedEnv.DATABASE_URL;
  const dbCheck = validateDatabaseIdentity(dbUrl);
  if (!dbCheck.valid) {
    errors.push(`[DATABASE] ${dbCheck.error}`);
    console.error(`   ❌ FAILED: ${dbCheck.error}`);
  } else {
    console.log(`   ✅ PASS: DATABASE_URL verified against approved production fingerprint (${dbCheck.shortHash}, host: ${dbCheck.host}).`);
  }

  console.log("----------------------------------------------------------------");
  if (errors.length > 0) {
    console.error(`🚨 PREFLIGHT FAILED: ${errors.length} safety violation(s) detected:`);
    errors.forEach((e, idx) => console.error(`   ${idx + 1}. ${e}`));
    console.error("Aborting production build. The safety guard prevents deployment with invalid state.");
    console.log("================================================================\n");
    return { success: false, errors };
  }

  console.log("✅ ALL PREFLIGHT SAFETY CHECKS PASSED. Safe to proceed with production build.");
  console.log("================================================================\n");
  return { success: true, errors: [] };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/production-preflight.mjs")) {
  runProductionPreflight()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled preflight exception:", err);
      process.exit(1);
    });
}

#!/usr/bin/env node

/**
 * scripts/deploy-production-safe.mjs
 *
 * Safe Production Deploy Wrapper (npm run deploy:production:safe)
 *
 * Requirements:
 * 1. Runs the full safe production build pipeline (preflight, DB sanity, build, artifact verification).
 * 2. Captures deployment audit metadata (Git SHA, previous active Worker version ID, timestamp).
 * 3. Deploys using `npx opennextjs-cloudflare deploy`.
 * 4. Runs automated post-deployment health smoke tests.
 * 5. Automatically prompts and displays instant rollback instructions if any smoke test fails.
 */

import { execSync } from "node:child_process";
import { buildProductionSafe } from "./build-production-safe.mjs";
import { runProductionSmokeTest } from "./production-smoke-test.mjs";

function getActiveWorkerVersionId(cwd) {
  try {
    const out = execSync("npx wrangler deployments list --name smanpower-secure", {
      cwd,
      encoding: "utf8",
    });
    // Find first active version ID
    const match = out.match(/Version\(s\):\s*\([0-9]+%\)\s*([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  } catch (e) {
    console.warn("⚠️  Could not retrieve previous Worker version ID via wrangler:", e.message);
    return null;
  }
}

export async function deployProductionSafe(options = {}) {
  const cwd = options.cwd || process.cwd();

  console.log("================================================================");
  console.log("🚀  SAFE PRODUCTION DEPLOYMENT WRAPPER");
  console.log("================================================================\n");

  // Step 1: Execute Safe Production Build Pipeline
  console.log("--- PHASE 1: EXECUTE SAFE PRODUCTION BUILD ---");
  await buildProductionSafe(options);

  // Step 2: Capture Deployment Audit Metadata
  console.log("\n--- PHASE 2: CAPTURING PRE-DEPLOYMENT AUDIT METADATA ---");
  const gitSha = execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
  const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8" }).trim();
  const timestamp = new Date().toISOString();
  console.log(`   Git SHA:    ${gitSha}`);
  console.log(`   Git Branch: ${gitBranch}`);
  console.log(`   Timestamp:  ${timestamp}`);

  const previousVersionId = getActiveWorkerVersionId(cwd);
  if (previousVersionId) {
    console.log(`   Previous Active Worker Version ID: ${previousVersionId}`);
  } else {
    console.log("   ⚠️  Previous Active Worker Version ID: Unknown (will require manual list if rollback needed)");
  }

  // Step 3: Execute Deployment
  console.log("\n--- PHASE 3: DEPLOYING TO CLOUDFLARE WORKERS ---");
  try {
    execSync("npx opennextjs-cloudflare deploy", {
      cwd,
      stdio: "inherit",
      env: process.env,
    });
  } catch (err) {
    console.error("❌ Deployment failed during opennextjs-cloudflare deploy:", err.message);
    process.exit(1);
  }

  // Step 4: Run Post-Deployment Smoke Test
  console.log("\n--- PHASE 4: POST-DEPLOYMENT HEALTH GATE ---");
  const smokeResult = await runProductionSmokeTest({
    baseUrl: "https://smanpower.com",
    previousVersionId,
  });

  if (!smokeResult.success) {
    console.error("❌ POST-DEPLOYMENT VERIFICATION FAILED.");
    process.exit(1);
  }

  console.log("================================================================");
  console.log("🎉 PRODUCTION DEPLOYMENT COMPLETE & FULLY CERTIFIED.");
  console.log(`Decommissioned version: ${previousVersionId || "unknown"}`);
  console.log(`Deployed commit:        ${gitSha}`);
  console.log(`Deployment time:        ${timestamp}`);
  console.log("================================================================\n");
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/deploy-production-safe.mjs")) {
  deployProductionSafe()
    .catch((err) => {
      console.error("Unhandled deployment error:", err);
      process.exit(1);
    });
}

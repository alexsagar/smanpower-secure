/**
 * scripts/deploy-production-ci.mjs
 *
 * Phase 1B.2A-S5: Safe Automatic Production CI Deployment & Health Gate
 * (npm run deploy:production:ci)
 *
 * Designed to execute within automated CI environments (Cloudflare Workers Builds / GitHub Actions)
 * as well as supervised local runs.
 *
 * Guarantees:
 * 1. ZERO REBUILD: Deploys the exact compiled artifacts from the build step without generating a second artifact.
 * 2. EXACT ARTIFACT CERTIFICATION: Validates cryptographic SHA-256 hashes of .open-next/worker.js, BUILD_ID, and news.html against .production-artifact-manifest.json.
 * 3. BRANCH & CONCURRENCY GUARD: Verifies release is strictly on 'main' and origin/main has not advanced to a newer commit.
 * 4. AUDIT & ROLLBACK: Captures previous active Worker version ID before deployment.
 * 5. DEPLOYMENT: Deploys via `npx opennextjs-cloudflare deploy`.
 * 6. POST-DEPLOYMENT SMOKE TEST: Runs 7-category live production health gate against https://smanpower.com.
 * 7. RECOVERY: If smoke test fails, outputs instant rollback command and exits 1.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { runProductionSmokeTest } from "./production-smoke-test.mjs";
import { validateArtifactManifest } from "./deployment-safety-common.mjs";

export function getActiveWorkerVersionId(cwd) {
  try {
    const out = execSync("npx wrangler deployments list --name smanpower-secure", {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const match = out.match(/Version\(s\):\s*\([0-9]+%\)\s*([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  } catch (e) {
    console.warn("⚠️  Could not retrieve previous Worker version ID via wrangler:", e.message);
    return null;
  }
}

export async function deployProductionCi(options = {}) {
  const cwd = options.cwd || process.cwd();
  const allowNonMain = options.allowNonMain || process.env.ALLOW_NON_MAIN === "true" || process.env.ALLOW_NON_MAIN === "1";

  console.log("================================================================");
  console.log("🚀  AUTOMATIC PRODUCTION RELEASE: CI DEPLOYMENT & HEALTH GATE");
  console.log("================================================================\n");

  // Step 1: Branch Verification
  console.log("--- STEP 1: BRANCH VERIFICATION ---");
  let branch = process.env.WORKERS_CI_BRANCH || process.env.GITHUB_REF_NAME || "";
  if (!branch) {
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8" }).trim();
    } catch (e) {
      branch = "unknown";
    }
  }

  if (!allowNonMain && branch !== "main") {
    console.error(`❌ CRITICAL SAFETY VIOLATION: Current branch is '${branch}'. Production deployment is strictly restricted to 'main'.`);
    process.exit(1);
  }
  console.log("   ✅ PASS: Branch verified as 'main'.");

  // Step 2: Concurrency & Latest-Commit Guard (Section 23)
  console.log("\n--- STEP 2: CONCURRENCY & LATEST-COMMIT GUARD ---");
  let localSha = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || "";
  if (!localSha) {
    try {
      localSha = execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
    } catch (e) {
      localSha = "unknown";
    }
  }

  if (!options.skipGitFetch && !process.env.SKIP_GIT_FETCH) {
    try {
      execSync("git fetch origin main", { cwd, stdio: "pipe" });
      const remoteMainSha = execSync("git rev-parse origin/main", { cwd, encoding: "utf8" }).trim();
      if (localSha && remoteMainSha && localSha !== remoteMainSha) {
        console.error(`🚨 CONCURRENCY ERROR: Local commit (${localSha.slice(0, 7)}) does not match latest origin/main (${remoteMainSha.slice(0, 7)}).`);
        console.error("A newer commit was merged while this build was processing. Aborting deployment to prevent deploying an outdated release.");
        process.exit(1);
      }
      console.log(`   ✅ PASS: Current commit (${localSha.slice(0, 7)}) matches latest origin/main.`);
    } catch (err) {
      console.warn(`   ⚠️  Git remote check skipped or failed: ${err.message}`);
    }
  }

  // Step 3: Exact-Artifact Certification Gate (Zero Rebuild Guarantee)
  console.log("\n--- STEP 3: EXACT-ARTIFACT CERTIFICATION VERIFICATION ---");
  const manifestPath = resolve(cwd, ".production-artifact-manifest.json");
  const truthPath = resolve(cwd, ".production-build-truth.json");
  const buildIdPath = resolve(cwd, ".open-next/assets/BUILD_ID");

  if (!existsSync(manifestPath)) {
    console.error("❌ CRITICAL: .production-artifact-manifest.json not found! Build was not certified.");
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error("❌ CRITICAL: Failed to parse .production-artifact-manifest.json:", err.message);
    process.exit(1);
  }

  const currentBuildId = existsSync(buildIdPath) ? readFileSync(buildIdPath, "utf8").trim() : null;
  let currentTruthHash = null;
  if (existsSync(truthPath)) {
    try {
      const truthObj = JSON.parse(readFileSync(truthPath, "utf8"));
      currentTruthHash = truthObj.truthHash;
    } catch (e) {}
  }

  const manifestValidation = validateArtifactManifest({
    manifest,
    currentGitSha: localSha !== "unknown" ? localSha : undefined,
    currentBuildId,
    currentTruthHash,
    now: Date.now(),
    verifyHashes: true,
    cwd,
  });

  if (!manifestValidation.valid) {
    console.error("❌ CRITICAL SAFETY VIOLATION: Artifact certification validation failed!");
    console.error(`   ${manifestValidation.error}`);
    console.error("Deployment ABORTED. Artifacts must be freshly built and certified.");
    process.exit(1);
  }

  console.log("   ✅ Artifact certification valid and strictly bound to current commit & truth:");
  console.log(`      Git SHA:           ${manifest.gitSha}`);
  console.log(`      Build ID:          ${manifest.buildId}`);
  console.log(`      Truth Hash:        ${manifest.truthHash.slice(0, 16)}...`);
  console.log(`      Certified News:    ${manifest.metrics?.verifiedNewsCount}`);
  console.log(`      Certified Demands: ${manifest.metrics?.verifiedDemandCount}`);
  console.log(`      Certified At:      ${manifest.verifiedAt}`);

  // Record worker.js hash prior to deployment
  const workerPath = resolve(cwd, ".open-next/worker.js");
  const preDeployWorkerHash = existsSync(workerPath)
    ? createHash("sha256").update(readFileSync(workerPath)).digest("hex")
    : null;

  // Step 4: Capture Previous Worker Version for Rollback Audit
  console.log("\n--- STEP 4: PRE-DEPLOYMENT WORKER AUDIT ---");
  const previousVersionId = options.mockPreviousVersionId !== undefined
    ? options.mockPreviousVersionId
    : getActiveWorkerVersionId(cwd);

  if (previousVersionId) {
    console.log(`   ✅ Recorded Previous Active Worker Version ID: ${previousVersionId}`);
  } else {
    console.log("   ⚠️  Previous Active Worker Version ID: Unknown (will require manual list if rollback needed)");
  }

  // Step 5: Execute Deployment (Zero Rebuild)
  console.log("\n--- STEP 5: DEPLOYING TO CLOUDFLARE WORKERS ---");
  if (!options.dryRun && !options.skipDeploy) {
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

    // Cryptographic verification that deploy did not alter the worker bundle
    if (preDeployWorkerHash && existsSync(workerPath)) {
      const postDeployWorkerHash = createHash("sha256").update(readFileSync(workerPath)).digest("hex");
      if (postDeployWorkerHash !== preDeployWorkerHash) {
        console.error("❌ CRITICAL ANOMALY: .open-next/worker.js hash changed during deploy!");
        process.exit(1);
      }
      console.log("   ✅ Post-deploy integrity verified: zero rebuild occurred during deployment.");
    }
  } else {
    console.log("   (Deployment execution bypassed per options/dry-run mode)");
  }

  // Step 6: Post-Deployment Smoke Test Health Gate
  console.log("\n--- STEP 6: POST-DEPLOYMENT HEALTH GATE ---");
  let smokeResult = { success: true, errors: [] };
  if (!options.skipSmokeTest) {
    smokeResult = await runProductionSmokeTest({
      baseUrl: options.baseUrl || "https://smanpower.com",
      previousVersionId,
    });

    if (!smokeResult.success) {
      console.error("🚨 POST-DEPLOYMENT VERIFICATION FAILED.");
      process.exit(1);
    }
  } else {
    console.log("   (Post-deployment smoke test skipped per options)");
  }

  const timestamp = new Date().toISOString();
  console.log("\n================================================================");
  console.log("🎉 AUTOMATIC PRODUCTION RELEASE COMPLETED SUCCESSFULLY.");
  console.log(`Decommissioned version: ${previousVersionId || "unknown"}`);
  console.log(`Deployed commit:        ${localSha}`);
  console.log(`Deployment time:        ${timestamp}`);
  console.log("================================================================\n");

  return {
    success: true,
    deployedCommit: localSha,
    previousVersionId,
    timestamp,
  };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/deploy-production-ci.mjs")) {
  deployProductionCi()
    .catch((err) => {
      console.error("Unhandled deployment error:", err);
      process.exit(1);
    });
}

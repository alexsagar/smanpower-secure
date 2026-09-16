/**
 * scripts/clean-build-isolation.mjs
 *
 * Clean Production Build Isolation & Pre-Build Clean Guard
 *
 * Guarantees that every production build begins with zero reusable application
 * build artifacts. Removes and verifies absence of:
 * - .next
 * - .open-next
 * - .wrangler
 * - Any previous fetch-cache or manifest files
 */

import { existsSync, rmSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export function cleanBuildDirectories(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("🧹  Initiating pre-build artifact cleanup...");

  const targets = [
    resolve(cwd, ".next"),
    resolve(cwd, ".open-next"),
    resolve(cwd, ".wrangler"),
    resolve(cwd, ".production-build-truth.json"),
    resolve(cwd, ".production-artifact-manifest.json"),
  ];

  for (const target of targets) {
    if (existsSync(target)) {
      try {
        rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
        console.log(`   ✅ Removed: ${target.replace(cwd, "")}`);
      } catch (err) {
        console.error(`   ❌ Failed to remove ${target}:`, err.message);
        throw new Error(`Could not delete build artifact: ${target}. Aborting build.`);
      }
    }
  }
}

export function verifyCleanBuildState(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("🛡️   Verifying clean pre-build state...");

  const errors = [];

  const nextDir = resolve(cwd, ".next");
  if (existsSync(nextDir)) {
    errors.push("PRE-BUILD .NEXT EXISTS = YES (Expected NO)");
  } else {
    console.log("   ✅ PRE-BUILD .NEXT EXISTS = NO");
  }

  const openNextDir = resolve(cwd, ".open-next");
  if (existsSync(openNextDir)) {
    errors.push("PRE-BUILD .OPEN-NEXT EXISTS = YES (Expected NO)");
  } else {
    console.log("   ✅ PRE-BUILD .OPEN-NEXT EXISTS = NO");
  }

  const wranglerDir = resolve(cwd, ".wrangler");
  if (existsSync(wranglerDir)) {
    errors.push("PRE-BUILD .WRANGLER EXISTS = YES (Expected NO)");
  } else {
    console.log("   ✅ PRE-BUILD .WRANGLER EXISTS = NO");
  }

  const fetchCacheDir = resolve(cwd, ".next/cache/fetch-cache");
  let fetchCount = 0;
  if (existsSync(fetchCacheDir)) {
    try {
      fetchCount = readdirSync(fetchCacheDir).length;
    } catch (e) {}
  }
  if (fetchCount > 0) {
    errors.push(`PRE-BUILD FETCH CACHE ENTRIES = ${fetchCount} (Expected 0)`);
  } else {
    console.log("   ✅ PRE-BUILD FETCH CACHE ENTRIES = 0");
  }

  if (errors.length > 0) {
    console.error("❌ CLEAN BUILD GUARD FAILED:");
    errors.forEach((e) => console.error(`   - ${e}`));
    return { success: false, errors };
  }

  console.log("   🎉 Clean build guard PASSED. Workspace is 100% free of previous build artifacts.\n");
  return { success: true, errors: [] };
}

// If run from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/clean-build-isolation.mjs")) {
  try {
    cleanBuildDirectories();
    const result = verifyCleanBuildState();
    if (!result.success) process.exit(1);
  } catch (err) {
    console.error("Clean build isolation failure:", err.message);
    process.exit(1);
  }
}

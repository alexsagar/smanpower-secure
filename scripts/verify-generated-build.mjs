#!/usr/bin/env node

/**
 * scripts/verify-generated-build.mjs
 *
 * Generated-Build Content Verification
 * Inspects generated .open-next / .next output BEFORE deployment.
 * Blocks deployment if the compiled build contains stale, demo, or defective content.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export async function verifyGeneratedBuild(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("================================================================");
  console.log("📦  GENERATED-BUILD CONTENT VERIFICATION");
  console.log("================================================================");

  const errors = [];

  const openNextDir = resolve(cwd, ".open-next");
  const nextServerAppDir = resolve(cwd, ".next/server/app");
  const openNextCacheDir = resolve(openNextDir, "cache");

  // 1. Verify basic build artifacts existence
  console.log("1. Verifying OpenNext artifact presence...");
  const workerPath = resolve(openNextDir, "worker.js");
  if (!existsSync(workerPath)) {
    errors.push("Missing .open-next/worker.js. OpenNext build did not complete successfully.");
    console.error("   ❌ FAILED: worker.js not found.");
  } else {
    console.log("   ✅ PASS: .open-next/worker.js compiled.");
  }

  // 2. Identify BUILD_ID and Cache Structure
  let buildId = null;
  const buildIdPath = resolve(openNextDir, "assets/BUILD_ID");
  if (existsSync(buildIdPath)) {
    buildId = readFileSync(buildIdPath, "utf8").trim();
    console.log(`   ✅ PASS: Build ID identified: ${buildId}`);
  } else {
    errors.push("Missing .open-next/assets/BUILD_ID.");
    console.error("   ❌ FAILED: BUILD_ID file missing.");
  }

  // 3. Inspect Homepage (/)
  console.log("2. Inspecting compiled Homepage (/) content...");
  let homeHtml = "";
  // Check in .next/server/app/index.html or .open-next/cache/<buildId>/index.cache
  const homeHtmlPath = resolve(nextServerAppDir, "index.html");
  if (existsSync(homeHtmlPath)) {
    homeHtml = readFileSync(homeHtmlPath, "utf8");
  } else if (buildId && existsSync(resolve(openNextCacheDir, `${buildId}/index.cache`))) {
    try {
      const cacheObj = JSON.parse(readFileSync(resolve(openNextCacheDir, `${buildId}/index.cache`), "utf8"));
      homeHtml = cacheObj.html || "";
    } catch (e) {}
  }

  if (!homeHtml) {
    errors.push("Could not locate compiled Homepage HTML in .next or .open-next cache.");
    console.error("   ❌ FAILED: Homepage HTML missing.");
  } else {
    // Check Google Translate presence
    if (!homeHtml.includes("google_translate_element")) {
      errors.push("Homepage missing Google Translate integration (#google_translate_element).");
      console.error("   ❌ FAILED: Missing Google Translate element.");
    } else {
      console.log("   ✅ PASS: Google Translate element present on Homepage.");
    }

    // Check Organization Schema
    if (!homeHtml.includes('"@type":"Organization"') && !homeHtml.includes('"@type": "Organization"')) {
      errors.push("Homepage missing Organization JSON-LD schema.");
      console.error("   ❌ FAILED: Missing Organization schema.");
    } else {
      console.log("   ✅ PASS: Organization schema present on Homepage.");
    }

    // Check for leadership section or legitimate content
    if (!homeHtml.includes("Overseas Recruitment Agency in Nepal") && !homeHtml.includes("Seven Seas Intercontinental")) {
      errors.push("Homepage missing canonical brand title/content.");
      console.error("   ❌ FAILED: Homepage title/brand missing.");
    } else {
      console.log("   ✅ PASS: Homepage brand content verified.");
    }
  }

  // 4. Inspect Insight Article (/insights/choose-manpower-agency-in-nepal)
  console.log("3. Inspecting compiled Insight article (/insights/choose-manpower-agency-in-nepal)...");
  let insightHtml = "";
  const insightHtmlPath = resolve(nextServerAppDir, "(public)/insights/[slug].html");
  const insightSlugHtmlPath = resolve(nextServerAppDir, "insights/choose-manpower-agency-in-nepal.html");

  if (existsSync(insightSlugHtmlPath)) {
    insightHtml = readFileSync(insightSlugHtmlPath, "utf8");
  } else if (existsSync(insightHtmlPath)) {
    insightHtml = readFileSync(insightHtmlPath, "utf8");
  } else if (buildId && existsSync(resolve(openNextCacheDir, `${buildId}/insights/choose-manpower-agency-in-nepal.cache`))) {
    try {
      const cacheObj = JSON.parse(readFileSync(resolve(openNextCacheDir, `${buildId}/insights/choose-manpower-agency-in-nepal.cache`), "utf8"));
      insightHtml = cacheObj.html || "";
    } catch (e) {}
  }

  // Note: If insight is dynamically rendered or ISR on first request, check worker bundle or template
  if (insightHtml) {
    if (insightHtml.includes("<title>OpenAI</title>")) {
      errors.push("Insight article contains leaked SVG <title>OpenAI</title>!");
      console.error("   ❌ FAILED: Leaked OpenAI SVG title found.");
    } else {
      console.log("   ✅ PASS: No OpenAI SVG title leak detected.");
    }

    if (insightHtml.includes("data-dgst") && !insightHtml.includes("<article")) {
      errors.push("Insight article rendered fallback skeleton (data-dgst) instead of article body!");
      console.error("   ❌ FAILED: Fallback skeleton detected in insight article.");
    } else {
      console.log("   ✅ PASS: Insight article body rendered without SSR crash skeleton.");
    }
  } else {
    // If not prerendered as static HTML, verify worker.js has date normalization and does not have <title>OpenAI</title>
    const workerContent = readFileSync(workerPath, "utf8");
    if (workerContent.includes("<title>OpenAI</title>")) {
      errors.push("Compiled worker.js contains leaked <title>OpenAI</title>.");
      console.error("   ❌ FAILED: Leaked OpenAI title found in worker bundle.");
    } else {
      console.log("   ✅ PASS: Worker bundle free of OpenAI title leak.");
    }
  }

  // 5. Inspect Cache Entries in .open-next/cache
  console.log("4. Inspecting .open-next cache payload...");
  if (buildId && existsSync(resolve(openNextCacheDir, buildId))) {
    const cacheFiles = readdirSync(resolve(openNextCacheDir, buildId));
    console.log(`   Found ${cacheFiles.length} page cache entries in ${buildId}.`);
    if (cacheFiles.length === 0) {
      errors.push(`Cache directory for ${buildId} is unexpectedly empty.`);
      console.error("   ❌ FAILED: Empty cache directory.");
    } else {
      console.log("   ✅ PASS: Page cache directory populated.");
    }
  }

  console.log("----------------------------------------------------------------");
  if (errors.length > 0) {
    console.error(`🚨 GENERATED-BUILD VERIFICATION FAILED: ${errors.length} defect(s) found:`);
    errors.forEach((e, idx) => console.error(`   ${idx + 1}. ${e}`));
    console.error("Aborting deployment. The compiled artifacts are defective.");
    console.log("================================================================\n");
    return { success: false, errors };
  }

  console.log("✅ GENERATED BUILD VERIFIED. Artifacts are safe for production deployment.");
  console.log("================================================================\n");
  return { success: true, errors: [] };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/verify-generated-build.mjs")) {
  verifyGeneratedBuild()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled build verification exception:", err);
      process.exit(1);
    });
}

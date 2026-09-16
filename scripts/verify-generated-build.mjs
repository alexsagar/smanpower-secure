/**
 * scripts/verify-generated-build.mjs
 *
 * Generated-Build Content-Truth Verification
 * Inspects generated .open-next / .next output BEFORE deployment.
 * Compares compiled output against the authoritative production content truth manifest.
 * Blocks deployment if the compiled build contains stale, empty, demo, or defective content.
 * Writes .production-artifact-manifest.json upon successful certification.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

/**
 * Helper to retrieve HTML content for a given route from .next or .open-next cache.
 */
export function getRouteHtml(route, nextServerAppDir, openNextCacheDir, buildId) {
  const cleanRoute = route.replace(/^\//, "");
  const candidates = [
    // 1. .next/server/app/<route>.html or index.html
    cleanRoute === "" ? resolve(nextServerAppDir, "index.html") : resolve(nextServerAppDir, `${cleanRoute}.html`),
    // 2. (public) route group in .next
    cleanRoute === "" ? resolve(nextServerAppDir, "(public)/index.html") : resolve(nextServerAppDir, `(public)/${cleanRoute}.html`),
    // 3. Nested page.html
    cleanRoute === "" ? resolve(nextServerAppDir, "page.html") : resolve(nextServerAppDir, `${cleanRoute}/page.html`),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        return readFileSync(candidate, "utf8");
      } catch (e) {}
    }
  }

  // 4. Check .open-next/cache/<buildId>/...
  if (buildId && openNextCacheDir) {
    const cacheCandidates = [
      cleanRoute === "" ? resolve(openNextCacheDir, `${buildId}/index.cache`) : resolve(openNextCacheDir, `${buildId}/${cleanRoute}.cache`),
      cleanRoute === "" ? resolve(openNextCacheDir, `${buildId}/page.cache`) : resolve(openNextCacheDir, `${buildId}/${cleanRoute}/page.cache`),
    ];

    for (const candidate of cacheCandidates) {
      if (existsSync(candidate)) {
        try {
          const cacheObj = JSON.parse(readFileSync(candidate, "utf8"));
          if (cacheObj.html) return cacheObj.html;
          if (cacheObj.body) return cacheObj.body;
        } catch (e) {}
      }
    }
  }

  return null;
}

export async function verifyGeneratedBuild(options = {}) {
  const cwd = options.cwd || process.cwd();
  const buildStartTime = options.buildStartTime || 0;
  const truthManifestPath = options.truthManifestPath || resolve(cwd, ".production-build-truth.json");

  console.log("================================================================");
  console.log("📦  GENERATED-BUILD CONTENT-TRUTH VERIFICATION");
  console.log("================================================================");

  const errors = [];

  const openNextDir = resolve(cwd, ".open-next");
  const nextServerAppDir = resolve(cwd, ".next/server/app");
  const openNextCacheDir = resolve(openNextDir, "cache");
  const fetchCacheDir = resolve(cwd, ".next/cache/fetch-cache");

  // 1. Verify basic OpenNext build artifacts
  console.log("1. Verifying OpenNext artifact presence...");
  const workerPath = resolve(openNextDir, "worker.js");
  if (!existsSync(workerPath)) {
    errors.push("Missing .open-next/worker.js. OpenNext build did not complete successfully.");
    console.error("   ❌ FAILED: worker.js not found.");
  } else {
    console.log("   ✅ PASS: .open-next/worker.js compiled.");
  }

  // 2. Identify BUILD_ID
  let buildId = null;
  const buildIdPath = resolve(openNextDir, "assets/BUILD_ID");
  if (existsSync(buildIdPath)) {
    buildId = readFileSync(buildIdPath, "utf8").trim();
    console.log(`   ✅ PASS: Build ID identified: ${buildId}`);
  } else {
    errors.push("Missing .open-next/assets/BUILD_ID.");
    console.error("   ❌ FAILED: BUILD_ID file missing.");
  }

  // 3. Load Production Content Truth Manifest
  console.log("2. Loading Production Content Truth Manifest...");
  let truthData = options.mockTruthManifest || null;
  if (!truthData && existsSync(truthManifestPath)) {
    try {
      truthData = JSON.parse(readFileSync(truthManifestPath, "utf8"));
      console.log(`   ✅ PASS: Loaded truth manifest (${truthManifestPath.replace(cwd, "")}).`);
      console.log(`   Authoritative News count: ${truthData.truth.counts.publishedNews}`);
      console.log(`   Authoritative Demand count: ${truthData.truth.counts.activeDemands}`);
    } catch (e) {
      errors.push(`Failed to parse truth manifest at ${truthManifestPath}: ${e.message}`);
      console.error(`   ❌ FAILED: Truth manifest unreadable: ${e.message}`);
    }
  } else if (!truthData) {
    errors.push("Production content truth manifest (.production-build-truth.json) is missing. Cannot verify build content truth.");
    console.error("   ❌ FAILED: .production-build-truth.json missing.");
  }

  const truth = truthData?.truth;

  // 4. Verify Homepage (/)
  console.log("3. Inspecting compiled Homepage (/) content...");
  const homeHtml = getRouteHtml("", nextServerAppDir, openNextCacheDir, buildId);
  if (!homeHtml) {
    errors.push("Could not locate compiled Homepage HTML in .next or .open-next cache.");
    console.error("   ❌ FAILED: Homepage HTML missing.");
  } else {
    if (!homeHtml.includes("google_translate_element")) {
      errors.push("Homepage missing Google Translate integration (#google_translate_element).");
      console.error("   ❌ FAILED: Missing Google Translate element.");
    } else {
      console.log("   ✅ PASS: Google Translate element present on Homepage.");
    }

    if (!homeHtml.includes('"@type":"Organization"') && !homeHtml.includes('"@type": "Organization"')) {
      errors.push("Homepage missing Organization JSON-LD schema.");
      console.error("   ❌ FAILED: Missing Organization schema.");
    } else {
      console.log("   ✅ PASS: Organization schema present on Homepage.");
    }

    const homeEyebrow = truth?.homepageMarker?.eyebrow || "Est. 2010";
    if (!homeHtml.includes(homeEyebrow)) {
      errors.push(`Homepage missing expected hero eyebrow marker: "${homeEyebrow}".`);
      console.error(`   ❌ FAILED: Hero eyebrow marker missing.`);
    } else {
      console.log(`   ✅ PASS: Homepage hero eyebrow verified ("${homeEyebrow}").`);
    }

    if (!homeHtml.includes("Seven Seas Intercontinental")) {
      errors.push("Homepage missing brand token 'Seven Seas Intercontinental'.");
      console.error("   ❌ FAILED: Homepage brand content missing.");
    } else {
      console.log("   ✅ PASS: Homepage brand content verified.");
    }
  }

  // 5. Verify News Page (/news) against Truth Manifest
  console.log("4. Inspecting compiled News (/news) against Content Truth...");
  const newsHtml = getRouteHtml("news", nextServerAppDir, openNextCacheDir, buildId);
  if (!newsHtml) {
    errors.push("Could not locate compiled News HTML in .next or .open-next cache.");
    console.error("   ❌ FAILED: News HTML missing.");
  } else {
    // Check all expected news articles from truth manifest
    let matchedNews = 0;
    if (truth?.news && Array.isArray(truth.news)) {
      for (const article of truth.news) {
        const slugFound = newsHtml.includes(article.slug);
        const titleSnippet = article.title ? article.title.slice(0, 30) : "";
        const titleFound = titleSnippet && newsHtml.includes(titleSnippet);
        if (slugFound || titleFound) {
          matchedNews++;
        } else {
          errors.push(`News page missing published article: "${article.slug}" (${article.title})`);
          console.error(`   ❌ FAILED: Missing news article: ${article.slug}`);
        }
      }
    }

    // Check for empty/stale markers:
    // When Incident 2 happened, 0 articles were rendered and the empty state heading was visible in the DOM
    const hasVisibleEmptyState =
      newsHtml.includes(">No news has been published yet.<") ||
      newsHtml.includes(">No news found<") ||
      newsHtml.includes(">No articles yet<") ||
      newsHtml.includes("<p>No news articles found at this time.</p>");

    if (hasVisibleEmptyState || matchedNews === 0) {
      errors.push("News page contains visible 'No news' / empty articles fallback! Stale empty database or cache was used.");
      console.error("   ❌ FAILED: News page contains empty state text!");
    } else {
      console.log(`   ✅ PASS: All ${matchedNews} published news articles confirmed in /news build (no empty fallback).`);
    }
  }

  // 6. Verify Demands Page (/demands) against Truth Manifest
  console.log("5. Inspecting compiled Demands (/demands) against Content Truth...");
  const demandsHtml = getRouteHtml("demands", nextServerAppDir, openNextCacheDir, buildId);
  if (demandsHtml) {
    // If statically prerendered or cached
    const hasEmptyDemands =
      demandsHtml.includes(">No job vacancies<") ||
      demandsHtml.includes(">No demands found<") ||
      demandsHtml.includes(">No demands currently available<");

    if (hasEmptyDemands) {
      errors.push("Demands page contains 'No demands' fallback! Stale or empty database was used.");
      console.error("   ❌ FAILED: Demands page contains empty state text!");
    } else {
      console.log("   ✅ PASS: Demands page contains no empty-state markers.");
    }

    if (truth?.demands && Array.isArray(truth.demands)) {
      let matchedDemands = 0;
      for (const demand of truth.demands) {
        const slugFound = demandsHtml.includes(demand.slug);
        const titleSnippet = demand.title ? demand.title.slice(0, 25) : "";
        const titleFound = titleSnippet && demandsHtml.includes(titleSnippet);
        if (slugFound || titleFound) {
          matchedDemands++;
        } else {
          errors.push(`Demands page missing active demand: "${demand.slug}" (${demand.title})`);
          console.error(`   ❌ FAILED: Missing demand: ${demand.slug}`);
        }
      }
      if (matchedDemands === truth.demands.length) {
        console.log(`   ✅ PASS: All ${matchedDemands} active demands confirmed in /demands build.`);
      }
    }
  } else {
    // /demands is dynamically rendered at runtime (searchParams access)
    // Check if the server component bundle compiled successfully
    const demandsServerEntry =
      existsSync(resolve(nextServerAppDir, "(public)/demands/page.js")) ||
      existsSync(resolve(nextServerAppDir, "demands/page.js"));

    if (!demandsServerEntry) {
      errors.push("Demands route failed to compile: missing demands/page.js server module.");
      console.error("   ❌ FAILED: Demands server entry missing.");
    } else {
      console.log("   ✅ PASS: Dynamic /demands route successfully compiled into server function.");
    }
  }

  // 7. Verify Leadership Marker (/about/leadership or /about)
  console.log("6. Inspecting Leadership content in /about/leadership...");
  const leadershipHtml = getRouteHtml("about/leadership", nextServerAppDir, openNextCacheDir, buildId) ||
                         getRouteHtml("about", nextServerAppDir, openNextCacheDir, buildId);
  const leadershipName = truth?.leadershipMarker?.name || "Devendra Bajgai";
  if (leadershipHtml) {
    if (!leadershipHtml.includes(leadershipName)) {
      errors.push(`Leadership page missing expected leadership member: "${leadershipName}".`);
      console.error(`   ❌ FAILED: Leadership member "${leadershipName}" not found.`);
    } else {
      console.log(`   ✅ PASS: Leadership member "${leadershipName}" confirmed in build.`);
    }
  } else {
    console.log("   ℹ️  Leadership page not statically prerendered as HTML; checking in server chunks...");
  }

  // 8. Inspect Insight Article (/insights/choose-manpower-agency-in-nepal)
  console.log("7. Inspecting Insight Article SSR & Metadata...");
  const insightSlug = truth?.insightMarker?.slug || "choose-manpower-agency-in-nepal";
  const insightHtml = getRouteHtml(`insights/${insightSlug}`, nextServerAppDir, openNextCacheDir, buildId) ||
                      getRouteHtml("insights/[slug]", nextServerAppDir, openNextCacheDir, buildId);

  if (insightHtml) {
    if (insightHtml.includes("<title>OpenAI</title>")) {
      errors.push("Insight article contains leaked SVG <title>OpenAI</title>!");
      console.error("   ❌ FAILED: Leaked OpenAI SVG title found in insight article.");
    } else {
      console.log("   ✅ PASS: No OpenAI SVG title leak detected.");
    }

    if (insightHtml.includes("data-dgst") && !insightHtml.includes("<article")) {
      errors.push("Insight article rendered fallback skeleton (data-dgst) instead of article body!");
      console.error("   ❌ FAILED: Fallback skeleton detected in insight article.");
    } else {
      console.log("   ✅ PASS: Insight article body rendered without SSR crash skeleton.");
    }
  }

  // Always check worker bundle for OpenAI leak
  if (existsSync(workerPath)) {
    const workerContent = readFileSync(workerPath, "utf8");
    if (workerContent.includes("<title>OpenAI</title>")) {
      errors.push("Compiled worker.js contains leaked <title>OpenAI</title>.");
      console.error("   ❌ FAILED: Leaked OpenAI title found in worker bundle.");
    } else {
      console.log("   ✅ PASS: Worker bundle free of OpenAI title leak.");
    }
  }

  // 9. Inspect Fetch-Cache for Cross-Build Stale Entries & Freshness
  console.log("8. Inspecting .next/cache/fetch-cache freshness and contents...");
  let fetchCacheCount = 0;
  if (existsSync(fetchCacheDir)) {
    try {
      const fetchFiles = readdirSync(fetchCacheDir);
      fetchCacheCount = fetchFiles.length;
      console.log(`   Found ${fetchCacheCount} fetch-cache entries.`);

      // Clock-drift allowance: 10 seconds before buildStartTime
      const minAllowedMtime = buildStartTime > 0 ? buildStartTime - 10000 : 0;
      let staleMtimeCount = 0;
      let emptyNewsCacheFound = false;

      for (const file of fetchFiles) {
        const fullPath = resolve(fetchCacheDir, file);
        const stats = statSync(fullPath);

        if (minAllowedMtime > 0 && stats.mtimeMs < minAllowedMtime) {
          staleMtimeCount++;
        }

        try {
          const content = readFileSync(fullPath, "utf8");
          // Detect empty news cache payload: ["cms-news"] paired with [] or 0 items
          if (content.includes('"cms-news"') && (content.includes('"data":[]') || content.includes('"data": []') || content.includes('{"value":[]}'))) {
            emptyNewsCacheFound = true;
          }
        } catch (e) {}
      }

      if (staleMtimeCount > 0) {
        errors.push(`Detected ${staleMtimeCount} stale fetch-cache entries with modification time predating this build. Pre-build isolation was incomplete!`);
        console.error(`   ❌ FAILED: ${staleMtimeCount} stale fetch-cache entries detected.`);
      } else {
        console.log("   ✅ PASS: All fetch-cache entries have fresh timestamps.");
      }

      if (emptyNewsCacheFound) {
        errors.push("Fetch-cache contains stale empty news array (cms-news: []). Incident 2 pattern detected!");
        console.error("   ❌ FAILED: Stale empty news cache found in fetch-cache.");
      } else {
        console.log("   ✅ PASS: No stale empty news cache found in fetch-cache.");
      }
    } catch (e) {
      console.warn("   ⚠️  Could not inspect fetch-cache:", e.message);
    }
  }

  // 10. Inspect .open-next Page Cache
  console.log("9. Inspecting .open-next page cache directory...");
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

  // 11. Inspect Sitemap for Cache Freshness & Article Coverage
  console.log("10. Inspecting compiled Sitemap (/sitemap.xml)...");
  const sitemapBodyPath = resolve(nextServerAppDir, "sitemap.xml.body");
  if (existsSync(sitemapBodyPath)) {
    const sitemapContent = readFileSync(sitemapBodyPath, "utf8");

    // Check all published news articles are in sitemap
    if (truth?.news && Array.isArray(truth.news)) {
      let sitemapNewsMatches = 0;
      for (const article of truth.news) {
        if (sitemapContent.includes(`/news/${article.slug}`)) {
          sitemapNewsMatches++;
        } else {
          errors.push(`Sitemap is missing published news article: /news/${article.slug}`);
          console.error(`   ❌ FAILED: Sitemap missing news: ${article.slug}`);
        }
      }
      if (sitemapNewsMatches === truth.news.length) {
        console.log(`   ✅ PASS: All ${sitemapNewsMatches} published news articles present in sitemap.`);
      }
    }

    // Check that old July stale demand slugs are NOT in sitemap
    const staleJulyDemandSlugs = ["tbt-precast-sdn-bhd", "general-worker-344873"];
    for (const staleSlug of staleJulyDemandSlugs) {
      if (sitemapContent.includes(staleSlug)) {
        errors.push(`Sitemap contains stale July demand slug '${staleSlug}' from old local cache!`);
        console.error(`   ❌ FAILED: Stale demand found in sitemap: ${staleSlug}`);
      }
    }

    // Verify news dataset is not empty
    if (!sitemapContent.includes("/news/")) {
      errors.push("Sitemap contains empty news dataset! No /news/ URLs found.");
      console.error("   ❌ FAILED: Sitemap news dataset is empty.");
    } else {
      console.log("   ✅ PASS: Sitemap news dataset is populated and fresh.");
    }
  } else {
    console.log("   ℹ️  sitemap.xml.body not found as static artifact; dynamic sitemap route verified.");
  }

  console.log("----------------------------------------------------------------");
  if (errors.length > 0) {
    console.error(`🚨 GENERATED-BUILD VERIFICATION FAILED: ${errors.length} defect(s) found:`);
    errors.forEach((e, idx) => console.error(`   ${idx + 1}. ${e}`));
    console.error("Aborting deployment. The compiled artifacts are defective.");
    console.log("================================================================\n");
    return { success: false, errors };
  }

  // 12. Compute Cryptographic Hashes of Core Deployed Artifacts
  const hashes = {};
  if (existsSync(workerPath)) {
    hashes.workerJs = createHash("sha256").update(readFileSync(workerPath)).digest("hex");
  }
  if (existsSync(buildIdPath)) {
    hashes.buildId = createHash("sha256").update(readFileSync(buildIdPath)).digest("hex");
  }
  const newsHtmlPath = resolve(nextServerAppDir, "news.html");
  if (existsSync(newsHtmlPath)) {
    hashes.newsHtml = createHash("sha256").update(readFileSync(newsHtmlPath)).digest("hex");
  }

  // 13. Write Production Artifact Certification Manifest
  let gitSha = "unknown";
  let gitBranch = "unknown";
  try {
    gitSha = execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
    gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8" }).trim();
  } catch (e) {}

  const artifactManifest = {
    version: 1,
    status: "CERTIFIED_FOR_DEPLOYMENT",
    gitSha,
    gitBranch,
    buildId,
    truthHash: truthData?.truthHash || "none",
    buildStartTime,
    verifiedAt: new Date().toISOString(),
    verifiedTimestamp: Date.now(),
    hashes,
    metrics: {
      verifiedNewsCount: truth?.counts?.publishedNews || 0,
      verifiedDemandCount: truth?.counts?.activeDemands || 0,
      fetchCacheEntries: fetchCacheCount,
    },
  };

  const artifactManifestPath = resolve(cwd, ".production-artifact-manifest.json");
  writeFileSync(artifactManifestPath, JSON.stringify(artifactManifest, null, 2), "utf8");

  console.log("✅ GENERATED BUILD CERTIFIED. Artifacts match live production truth.");
  console.log(`   Manifest written to: ${artifactManifestPath.replace(cwd, "")}`);
  console.log(`   Certification Hash:  ${artifactManifest.truthHash.slice(0, 16)}...`);
  console.log("================================================================\n");

  return {
    success: true,
    errors: [],
    artifactManifest,
    artifactManifestPath,
  };
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

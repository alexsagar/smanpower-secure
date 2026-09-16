#!/usr/bin/env node

/**
 * scripts/production-smoke-test.mjs
 *
 * Post-Deployment Health Gate
 * Executes automated read-only smoke tests against live production (https://smanpower.com).
 * If checks fail, clearly surfaces the rollback command.
 */

import https from "node:https";

export async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 Production-Smoke-Test/1.0",
          "Cache-Control": "no-cache",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export async function runProductionSmokeTest(options = {}) {
  const baseUrl = options.baseUrl || "https://smanpower.com";
  const previousVersionId = options.previousVersionId;

  console.log("================================================================");
  console.log(`🌐  PRODUCTION POST-DEPLOYMENT SMOKE TEST: ${baseUrl}`);
  console.log("================================================================");

  const errors = [];

  try {
    // 1. Homepage Smoke Test
    console.log("1. Probing Homepage (/) ...");
    const homeRes = await fetchUrl(`${baseUrl}/`);
    if (homeRes.status !== 200) {
      errors.push(`Homepage returned HTTP ${homeRes.status}`);
      console.error(`   ❌ FAILED: Homepage status ${homeRes.status}`);
    } else {
      if (!homeRes.body.includes("google_translate_element")) {
        errors.push("Homepage missing Google Translate integration.");
        console.error("   ❌ FAILED: Missing Google Translate element.");
      } else {
        console.log("   ✅ PASS: Google Translate element present.");
      }

      if (!homeRes.body.includes('"@type":"Organization"') && !homeRes.body.includes('"@type": "Organization"')) {
        errors.push("Homepage missing Organization schema.");
        console.error("   ❌ FAILED: Missing Organization schema.");
      } else {
        console.log("   ✅ PASS: Organization schema present.");
      }
    }

    // 2. /about Smoke Test
    console.log("2. Probing About Page (/about) ...");
    const aboutRes = await fetchUrl(`${baseUrl}/about`);
    if (aboutRes.status !== 200) {
      errors.push(`/about returned HTTP ${aboutRes.status}`);
      console.error(`   ❌ FAILED: /about status ${aboutRes.status}`);
    } else {
      console.log("   ✅ PASS: /about returned HTTP 200.");
    }

    // 3. /demands Smoke Test with Content Verification
    console.log("3. Probing Demands (/demands) ...");
    const demandsRes = await fetchUrl(`${baseUrl}/demands`);
    if (demandsRes.status !== 200) {
      errors.push(`/demands returned HTTP ${demandsRes.status}`);
      console.error(`   ❌ FAILED: /demands status ${demandsRes.status}`);
    } else {
      console.log("   ✅ PASS: /demands returned HTTP 200.");
      // Assert active demands content
      const requiredDemandSlugs = ["job-vacancy-in-kuwait-lt-322061-2", "general-worker-lt-345209"];
      let demandsFound = 0;
      for (const slug of requiredDemandSlugs) {
        if (demandsRes.body.includes(slug)) {
          demandsFound++;
        } else {
          errors.push(`/demands is missing active demand: ${slug}`);
          console.error(`   ❌ FAILED: Active demand '${slug}' not rendered on /demands.`);
        }
      }
      if (demandsFound === requiredDemandSlugs.length) {
        console.log(`   ✅ PASS: All ${demandsFound} active demands verified live on /demands.`);
      }

      if (demandsRes.body.includes("No job vacancies") || demandsRes.body.includes("No demands found")) {
        errors.push("/demands rendered empty-state fallback!");
        console.error("   ❌ FAILED: Empty demands fallback rendered.");
      }
    }

    // 4. /news Smoke Test with Content Verification
    console.log("4. Probing News (/news) ...");
    const newsRes = await fetchUrl(`${baseUrl}/news`);
    if (newsRes.status !== 200) {
      errors.push(`/news returned HTTP ${newsRes.status}`);
      console.error(`   ❌ FAILED: /news status ${newsRes.status}`);
    } else {
      console.log("   ✅ PASS: /news returned HTTP 200.");
      if (newsRes.body.includes(">No news has been published yet.<") || newsRes.body.includes(">No news found<")) {
        errors.push("/news rendered empty-state fallback! Stale database or empty cache used.");
        console.error("   ❌ FAILED: Empty news fallback rendered.");
      } else {
        console.log("   ✅ PASS: /news contains published articles (no empty-state fallback).");
      }
    }

    // 5. Insight Article Smoke Test
    const insightSlug = "choose-manpower-agency-in-nepal";
    console.log(`5. Probing Insight Article (/insights/${insightSlug}) ...`);
    const insightRes = await fetchUrl(`${baseUrl}/insights/${insightSlug}`);
    if (insightRes.status !== 200) {
      errors.push(`Insight article returned HTTP ${insightRes.status}`);
      console.error(`   ❌ FAILED: Insight returned HTTP ${insightRes.status}`);
    } else {
      const titleMatch = insightRes.body.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";
      if (title.includes("OpenAI")) {
        errors.push(`Insight article contains leaked <title>OpenAI</title>!`);
        console.error(`   ❌ FAILED: Leaked OpenAI title detected.`);
      } else {
        console.log(`   ✅ PASS: Title verified: "${title}"`);
      }

      if (insightRes.body.includes("data-dgst") && !insightRes.body.includes("<article")) {
        errors.push("Insight article rendered fallback skeleton (SSR crash).");
        console.error("   ❌ FAILED: SSR fallback skeleton detected.");
      } else {
        console.log("   ✅ PASS: Insight article content rendered.");
      }

      if (!insightRes.body.includes("BlogPosting")) {
        errors.push("Insight article missing BlogPosting JSON-LD schema.");
        console.error("   ❌ FAILED: BlogPosting schema missing.");
      } else {
        console.log("   ✅ PASS: BlogPosting schema present.");
      }
    }

  } catch (err) {
    errors.push(`Network or probe failure: ${err.message}`);
    console.error(`   ❌ Probe exception: ${err.message}`);
  }

  console.log("----------------------------------------------------------------");
  if (errors.length > 0) {
    console.error(`🚨 PRODUCTION HEALTH GATE FAILED: ${errors.length} issue(s) detected:`);
    errors.forEach((e, idx) => console.error(`   ${idx + 1}. ${e}`));
    console.error("\n================================================================");
    console.error("🚨 CRITICAL: IMMEDIATE ROLLBACK REQUIRED!");
    if (previousVersionId) {
      console.error("Execute the following command immediately to restore the prior good version:");
      console.error(`\n   npx wrangler rollback ${previousVersionId} --yes\n`);
    } else {
      console.error("Execute a wrangler rollback immediately:");
      console.error("\n   npx wrangler rollback --yes\n");
    }
    console.error("================================================================\n");
    return { success: false, errors };
  }

  console.log("✅ ALL POST-DEPLOYMENT SMOKE TESTS PASSED.");
  console.log("Live production website is fully healthy and verified.");
  console.log("================================================================\n");
  return { success: true, errors: [] };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/production-smoke-test.mjs")) {
  runProductionSmokeTest()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled smoke test exception:", err);
      process.exit(1);
    });
}

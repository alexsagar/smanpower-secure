#!/usr/bin/env node

/**
 * scripts/production-content-sanity.mjs
 *
 * Production Content Sanity Gate
 * Reads the targeted database to verify it contains current live production content,
 * preventing any build from using an outdated snapshot (e.g. July 2026).
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { parseEnvContent } from "./deployment-safety-common.mjs";

const require = createRequire(import.meta.url);

export async function runContentSanityCheck(options = {}) {
  const cwd = options.cwd || process.cwd();
  let dbUrl = options.databaseUrl || process.env.DATABASE_URL;

  if (!dbUrl) {
    const envProdPath = resolve(cwd, ".env.production");
    if (existsSync(envProdPath)) {
      const parsed = parseEnvContent(readFileSync(envProdPath, "utf8"));
      dbUrl = parsed.DATABASE_URL;
    }
  }

  if (!dbUrl) {
    console.error("❌ Content Sanity Gate Failed: No DATABASE_URL found to verify.");
    return { success: false, errors: ["No DATABASE_URL found to verify."] };
  }

  console.log("================================================================");
  console.log("🔍  PRODUCTION CONTENT SANITY GATE");
  console.log("================================================================");

  let PrismaClient;
  try {
    // Dynamic import PrismaClient from local node_modules
    const prismaModule = require(resolve(cwd, "node_modules/@prisma/client"));
    PrismaClient = prismaModule.PrismaClient;
  } catch (err) {
    console.error(`❌ Content Sanity Gate Failed: Could not load PrismaClient: ${err.message}`);
    return { success: false, errors: [`Could not load PrismaClient: ${err.message}`] };
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: ["error"],
  });

  const errors = [];

  try {
    // 1. News Articles Verification (Crucial marker: July snapshot has 0, Live prod has 4)
    console.log("1. Checking published NewsArticle records...");
    const newsCount = await prisma.newsArticle.count();
    console.log(`   Found ${newsCount} news article(s).`);
    if (newsCount < 1) {
      errors.push(
        `NewsArticle count is ${newsCount}. Live production requires >= 1 active articles. (Matches old July snapshot with 0 news).`
      );
      console.error(`   ❌ FAILED: Zero news articles detected.`);
    } else {
      console.log(`   ✅ PASS: News articles present.`);
    }

    // 2. Active Demands Verification (July snapshot has 2, Live prod has 4)
    console.log("2. Checking Demands records...");
    const demandCount = await prisma.demand.count();
    console.log(`   Found ${demandCount} demand record(s).`);
    if (demandCount < 3) {
      errors.push(
        `Demand count is ${demandCount}. Live production requires >= 3 demands. (Matches old July snapshot with 2 demands).`
      );
      console.error(`   ❌ FAILED: Insufficient demand records.`);
    } else {
      console.log(`   ✅ PASS: Demands count verified.`);
    }

    // 3. CMS Pages Count (July snapshot and prod both have ~59)
    console.log("3. Checking CmsPage records...");
    const pageCount = await prisma.cmsPage.count();
    console.log(`   Found ${pageCount} CMS page(s).`);
    if (pageCount < 50) {
      errors.push(`CmsPage count is ${pageCount}, expected >= 50.`);
      console.error(`   ❌ FAILED: Incomplete CMS page database.`);
    } else {
      console.log(`   ✅ PASS: CMS pages count verified.`);
    }

    // 4. Insight Article Recency (July snapshot updated 2026-07-24; Prod updated 2026-08-04)
    console.log("4. Checking Insight Article update recency...");
    const augustCutoff = new Date("2026-08-01T00:00:00Z");
    const recentInsights = await prisma.insightArticle.findMany({
      where: {
        updatedAt: { gte: augustCutoff },
      },
      select: { slug: true, updatedAt: true },
    });
    console.log(`   Found ${recentInsights.length} insight(s) updated after 2026-08-01.`);
    if (recentInsights.length === 0) {
      errors.push(
        `Zero insights updated after 2026-08-01. Live production has August 2026 insight revisions. (Matches old July snapshot).`
      );
      console.error(`   ❌ FAILED: Stale insight articles detected.`);
    } else {
      console.log(`   ✅ PASS: Recent insight updates verified.`);
    }

    // 5. Media Assets Count (July snapshot has 139, Prod has 143)
    console.log("5. Checking MediaAsset records...");
    const mediaCount = await prisma.mediaAsset.count();
    console.log(`   Found ${mediaCount} media asset(s).`);
    if (mediaCount < 140) {
      errors.push(
        `MediaAsset count is ${mediaCount}, expected >= 140. (Matches old July snapshot with 139 assets).`
      );
      console.error(`   ❌ FAILED: Media assets count indicates older snapshot.`);
    } else {
      console.log(`   ✅ PASS: Media assets count verified.`);
    }

  } catch (err) {
    errors.push(`Database query error during sanity check: ${err.message}`);
    console.error(`   ❌ ERROR: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("----------------------------------------------------------------");
  if (errors.length > 0) {
    console.error(`🚨 CONTENT SANITY GATE FAILED: ${errors.length} violation(s) detected:`);
    errors.forEach((e, idx) => console.error(`   ${idx + 1}. ${e}`));
    console.error("Aborting build. Target database appears to be an outdated or corrupt snapshot.");
    console.log("================================================================\n");
    return { success: false, errors };
  }

  console.log("✅ CONTENT SANITY GATE PASSED. Target database confirmed to be current live production.");
  console.log("================================================================\n");
  return { success: true, errors: [] };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/production-content-sanity.mjs")) {
  runContentSanityCheck()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled sanity check exception:", err);
      process.exit(1);
    });
}

#!/usr/bin/env node

/**
 * scripts/generate-production-truth-manifest.mjs
 *
 * Production Content Truth Manifest Generator
 *
 * Immediately before compilation, queries the production database read-only and
 * writes a temporary, non-secret validation manifest (.production-build-truth.json).
 *
 * This manifest captures authoritative production content truth markers that the
 * generated build artifacts MUST contain after compilation.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { parseEnvContent } from "./deployment-safety-common.mjs";

export async function generateProductionTruthManifest(options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log("📋  Generating production content truth manifest...");

  let dbUrl = options.databaseUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    const envProdPath = resolve(cwd, ".env.production");
    if (existsSync(envProdPath)) {
      const parsed = parseEnvContent(readFileSync(envProdPath, "utf8"));
      dbUrl = parsed.DATABASE_URL;
      process.env.DATABASE_URL = dbUrl;
    }
  }

  const buildStartTime = options.buildStartTime || Date.now();
  const prisma = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);

  try {
    const [newsArticles, demands, homeHero, homeIntroBlock, insight, teamSetting] = await Promise.all([
      prisma.newsArticle.findMany({
        where: { status: "PUBLISHED", isPublished: true, deletedAt: null, noIndex: false },
        select: { slug: true, title: true },
        orderBy: { publishDate: "desc" },
      }),
      prisma.demand.findMany({
        where: { status: "PUBLISHED", isPublic: true, deletedAt: null },
        select: { slug: true, title: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cmsHeroSection.findFirst({
        where: { page: { slug: "home" } },
        select: { eyebrow: true },
      }),
      prisma.cmsContentBlock.findFirst({
        where: { page: { slug: "home" }, blockKey: "home-introduction", visible: true },
        select: { content: true },
      }),
      prisma.insightArticle.findFirst({
        where: { status: "PUBLISHED", deletedAt: null, noIndex: false },
        select: { slug: true, title: true },
        orderBy: { publishDate: "desc" },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "team_members" },
        select: { value: true },
      }),
    ]);

    if (newsArticles.length === 0) {
      throw new Error("Production truth check failed: 0 published news articles found in database.");
    }
    if (demands.length === 0) {
      throw new Error("Production truth check failed: 0 active demands found in database.");
    }

    // Extract leadership name marker
    let leadershipName = "Devendra Bajgai";
    if (Array.isArray(teamSetting?.value) && teamSetting.value.length > 0) {
      const firstLeader = teamSetting.value.find((m) => m && m.isPublished && m.name);
      if (firstLeader) leadershipName = firstLeader.name;
    }

    const truthPayload = {
      version: 1,
      buildStartTime,
      generatedAt: new Date().toISOString(),
      counts: {
        publishedNews: newsArticles.length,
        activeDemands: demands.length,
      },
      news: newsArticles.map((n) => ({ slug: n.slug, title: n.title })),
      demands: demands.map((d) => ({ slug: d.slug, title: d.title })),
      homepageMarker: {
        eyebrow: homeHero?.eyebrow || "Est. 2010 · Kathmandu, Nepal",
        titleToken: "Seven Seas Intercontinental",
      },
      leadershipMarker: {
        name: leadershipName,
      },
      insightMarker: insight
        ? { slug: insight.slug, title: insight.title }
        : { slug: "choose-manpower-agency-in-nepal", title: "How to Choose the Right Manpower Agency in Nepal" },
    };

    const payloadString = JSON.stringify(truthPayload, null, 2);
    const truthHash = createHash("sha256").update(payloadString).digest("hex");

    const manifestData = {
      truthHash,
      truth: truthPayload,
    };

    const manifestPath = resolve(cwd, ".production-build-truth.json");
    writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), "utf8");

    console.log(`   ✅ Truth Manifest generated with ${newsArticles.length} News, ${demands.length} Demands.`);
    console.log(`   ✅ Manifest hash: ${truthHash.slice(0, 16)}...`);
    console.log(`   ✅ Written to: ${manifestPath.replace(cwd, "")}\n`);

    return {
      success: true,
      manifestPath,
      truthHash,
      truth: truthPayload,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// If invoked from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/generate-production-truth-manifest.mjs")) {
  generateProductionTruthManifest()
    .then((res) => {
      if (!res.success) process.exit(1);
    })
    .catch((err) => {
      console.error("Failed to generate truth manifest:", err.message);
      process.exit(1);
    });
}

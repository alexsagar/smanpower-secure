#!/usr/bin/env node

/**
 * scripts/update-production-cms-statistics.mjs
 *
 * Scoped, idempotent update script to reconcile CMS statistics on Homepage
 * and About page with approved management facts:
 *   Homepage:
 *     - stat-1: "2010" / "Since 2010" (was "19+", "Years Experience")
 *     - stat-6: "RBA" / "Aligned Framework" (was "100%", "RBA Committed")
 *   About page:
 *     - item 0: "Since 2010", "Established" (was "15+", "Years Experience")
 *     - item 1: "350+", "Employer Partners" (was "50+", "Global Partners")
 *     - item 2: "150,000+", "Workers Deployed" (was "10k+", "Workers Deployed")
 *
 * Safety features:
 *   - Defaults to DRY-RUN mode (requires explicit `--execute` to write).
 *   - Strict baseline validation: stops if existing records deviate from expected values.
 *   - Atomic Prisma transaction: both blocks update together or neither does.
 *   - Automatic pre-update snapshot written to `prisma/backups/cms-statistics/`.
 *   - Complete rollback capability: `--rollback <snapshot-path> [--execute]`.
 *   - Never exposes database credentials.
 *   - Standalone CLI: never runs during ordinary builds or CI.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { parseEnvContent } from "./deployment-safety-common.mjs";

const require = createRequire(import.meta.url);

export const BASELINE = {
  home: {
    id: "block-home-stats",
    blockKey: "home-statistics",
    blockType: "statistics",
    pageSlug: "home",
    stat1: { value: "19", suffix: "+", description: "Years Experience" },
    stat6: { value: "100", suffix: "%", description: "RBA Committed" },
  },
  about: {
    id: "block_about_2",
    blockKey: "stats",
    blockType: "stats_grid",
    pageSlug: "about",
    item0: { value: "15+", label: "Years Experience" },
    item1: { value: "50+", label: "Global Partners" },
    item2: { value: "10k+", label: "Workers Deployed" },
    item3: { value: "7", label: "Provinces Covered" },
  },
};

export const TARGET = {
  home: {
    stat1: {
      id: "stat-1",
      label: "Global Operations",
      value: "2010",
      suffix: "",
      description: "Since 2010",
      source: "Company Records",
      order: 1,
    },
    stat6: {
      id: "stat-6",
      label: "Ethical Standard",
      value: "RBA",
      suffix: "",
      description: "Aligned Framework",
      source: "Compliance Records",
      order: 6,
    },
  },
  about: {
    item0: { value: "Since 2010", label: "Established" },
    item1: { value: "350+", label: "Employer Partners" },
    item2: { value: "150,000+", label: "Workers Deployed" },
    item3: { value: "7", label: "Provinces Covered" },
  },
};

export function transformHomeStats(currentContent) {
  const stats = Array.isArray(currentContent?.stats) ? [...currentContent.stats] : [];
  if (stats.length !== 6) {
    throw new Error(`Expected exactly 6 homepage stats, found ${stats.length}`);
  }

  const updated = stats.map((stat) => {
    if (stat.id === "stat-1") {
      return {
        ...stat,
        label: TARGET.home.stat1.label,
        value: TARGET.home.stat1.value,
        suffix: TARGET.home.stat1.suffix,
        description: TARGET.home.stat1.description,
        source: stat.source || TARGET.home.stat1.source,
        order: stat.order ?? 1,
      };
    }
    if (stat.id === "stat-6") {
      return {
        ...stat,
        label: TARGET.home.stat6.label,
        value: TARGET.home.stat6.value,
        suffix: TARGET.home.stat6.suffix,
        description: TARGET.home.stat6.description,
        source: stat.source || TARGET.home.stat6.source,
        order: stat.order ?? 6,
      };
    }
    return stat;
  });

  return { ...currentContent, stats: updated };
}

export function transformAboutStats(currentContent) {
  const stats = Array.isArray(currentContent?.stats) ? [...currentContent.stats] : [];
  if (stats.length !== 4) {
    throw new Error(`Expected exactly 4 about page stats, found ${stats.length}`);
  }

  const updated = [
    { ...stats[0], ...TARGET.about.item0 },
    { ...stats[1], ...TARGET.about.item1 },
    { ...stats[2], ...TARGET.about.item2 },
    { ...stats[3], ...TARGET.about.item3 },
  ];

  return { ...currentContent, stats: updated };
}

export function validateHomeBaseline(homeBlock) {
  if (!homeBlock) {
    throw new Error(`Homepage statistics block '${BASELINE.home.id}' not found in database.`);
  }
  if (homeBlock.blockType !== BASELINE.home.blockType) {
    throw new Error(`Homepage blockType mismatch: expected '${BASELINE.home.blockType}', got '${homeBlock.blockType}'`);
  }
  const stats = homeBlock.content?.stats;
  if (!Array.isArray(stats) || stats.length !== 6) {
    throw new Error(`Homepage stats array invalid or unexpected length: ${stats?.length}`);
  }

  const stat1 = stats.find((s) => s.id === "stat-1");
  const stat6 = stats.find((s) => s.id === "stat-6");

  const stat1IsBaseline =
    stat1?.value === BASELINE.home.stat1.value &&
    stat1?.suffix === BASELINE.home.stat1.suffix &&
    stat1?.description === BASELINE.home.stat1.description;

  const stat1IsTarget =
    stat1?.value === TARGET.home.stat1.value &&
    stat1?.description === TARGET.home.stat1.description;

  const stat6IsBaseline =
    stat6?.value === BASELINE.home.stat6.value &&
    stat6?.suffix === BASELINE.home.stat6.suffix &&
    stat6?.description === BASELINE.home.stat6.description;

  const stat6IsTarget =
    stat6?.value === TARGET.home.stat6.value &&
    stat6?.description === TARGET.home.stat6.description;

  if (!stat1IsBaseline && !stat1IsTarget) {
    throw new Error(
      `Homepage stat-1 does not match expected baseline or target. Current: ${JSON.stringify(stat1)}`
    );
  }
  if (!stat6IsBaseline && !stat6IsTarget) {
    throw new Error(
      `Homepage stat-6 does not match expected baseline or target. Current: ${JSON.stringify(stat6)}`
    );
  }

  return {
    alreadyUpToDate: stat1IsTarget && stat6IsTarget,
  };
}

export function validateAboutBaseline(aboutBlock) {
  if (!aboutBlock) {
    throw new Error(`About statistics block '${BASELINE.about.id}' not found in database.`);
  }
  if (aboutBlock.blockType !== BASELINE.about.blockType) {
    throw new Error(`About blockType mismatch: expected '${BASELINE.about.blockType}', got '${aboutBlock.blockType}'`);
  }
  const stats = aboutBlock.content?.stats;
  if (!Array.isArray(stats) || stats.length !== 4) {
    throw new Error(`About stats array invalid or unexpected length: ${stats?.length}`);
  }

  const item0IsBaseline =
    stats[0]?.value === BASELINE.about.item0.value &&
    stats[0]?.label === BASELINE.about.item0.label;
  const item0IsTarget =
    stats[0]?.value === TARGET.about.item0.value &&
    stats[0]?.label === TARGET.about.item0.label;

  const item1IsBaseline =
    stats[1]?.value === BASELINE.about.item1.value &&
    stats[1]?.label === BASELINE.about.item1.label;
  const item1IsTarget =
    stats[1]?.value === TARGET.about.item1.value &&
    stats[1]?.label === TARGET.about.item1.label;

  const item2IsBaseline =
    stats[2]?.value === BASELINE.about.item2.value &&
    stats[2]?.label === BASELINE.about.item2.label;
  const item2IsTarget =
    stats[2]?.value === TARGET.about.item2.value &&
    stats[2]?.label === TARGET.about.item2.label;

  const item3Matches =
    stats[3]?.value === BASELINE.about.item3.value &&
    stats[3]?.label === BASELINE.about.item3.label;

  if (!item0IsBaseline && !item0IsTarget) {
    throw new Error(`About item 0 does not match expected baseline/target: ${JSON.stringify(stats[0])}`);
  }
  if (!item1IsBaseline && !item1IsTarget) {
    throw new Error(`About item 1 does not match expected baseline/target: ${JSON.stringify(stats[1])}`);
  }
  if (!item2IsBaseline && !item2IsTarget) {
    throw new Error(`About item 2 does not match expected baseline/target: ${JSON.stringify(stats[2])}`);
  }
  if (!item3Matches) {
    throw new Error(`About item 3 unexpected value: ${JSON.stringify(stats[3])}`);
  }

  return {
    alreadyUpToDate: item0IsTarget && item1IsTarget && item2IsTarget && item3Matches,
  };
}

async function run() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const rollbackIdx = args.indexOf("--rollback");
  const rollbackFile = rollbackIdx !== -1 ? args[rollbackIdx + 1] : null;

  const cwd = process.cwd();
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    const envProdPath = resolve(cwd, ".env.production");
    if (existsSync(envProdPath)) {
      const parsed = parseEnvContent(readFileSync(envProdPath, "utf8"));
      dbUrl = parsed.DATABASE_URL;
    }
  }

  if (!dbUrl) {
    console.error("❌ Error: No DATABASE_URL available in environment or .env.production");
    process.exit(1);
  }

  const prismaModule = require(resolve(cwd, "node_modules/@prisma/client"));
  const { PrismaClient } = prismaModule;
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: ["error"],
  });

  try {
    console.log("================================================================");
    console.log(`🔧 CMS STATISTICS UPDATE TOOL [Mode: ${isExecute ? "EXECUTE (LIVE WRITE)" : "DRY-RUN (READ-ONLY)"}]`);
    console.log("================================================================");

    if (rollbackFile) {
      console.log(`\n⏪ ROLLBACK REQUESTED FROM SNAPSHOT: ${rollbackFile}`);
      if (!existsSync(rollbackFile)) {
        throw new Error(`Snapshot file not found at: ${rollbackFile}`);
      }
      const snapshot = JSON.parse(readFileSync(rollbackFile, "utf8"));
      if (!snapshot.homeBlock || !snapshot.aboutBlock) {
        throw new Error("Invalid snapshot format: missing homeBlock or aboutBlock");
      }

      console.log("\nSnapshot Metadata:");
      console.log(`  Created: ${snapshot.timestamp}`);
      console.log(`  Target DB host: ${snapshot.dbHost || "unspecified"}`);

      console.log("\nPlanned Rollback Changes:");
      console.log("--- Home Statistics Block Restore ---");
      console.log(JSON.stringify(snapshot.homeBlock.content, null, 2));
      console.log("\n--- About Stats Grid Block Restore ---");
      console.log(JSON.stringify(snapshot.aboutBlock.content, null, 2));

      if (!isExecute) {
        console.log("\n[DRY RUN COMPLETE] No records were modified. Add --execute to perform rollback.");
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.cmsContentBlock.update({
          where: { id: snapshot.homeBlock.id },
          data: { content: snapshot.homeBlock.content },
        });
        await tx.cmsContentBlock.update({
          where: { id: snapshot.aboutBlock.id },
          data: { content: snapshot.aboutBlock.content },
        });
      });

      console.log("\n✅ ROLLBACK SUCCESSFUL: Database restored to snapshot state.");
      return;
    }

    // Standard Forward Update
    console.log("\n1. Fetching target CMS blocks...");
    const [homeBlock, aboutBlock] = await Promise.all([
      prisma.cmsContentBlock.findUnique({
        where: { id: BASELINE.home.id },
        include: { page: { select: { slug: true } } },
      }),
      prisma.cmsContentBlock.findUnique({
        where: { id: BASELINE.about.id },
        include: { page: { select: { slug: true } } },
      }),
    ]);

    console.log("2. Validating baseline integrity...");
    const homeValidation = validateHomeBaseline(homeBlock);
    const aboutValidation = validateAboutBaseline(aboutBlock);

    if (homeValidation.alreadyUpToDate && aboutValidation.alreadyUpToDate) {
      console.log("ℹ️  Both blocks are already up to date with approved statistics. No change required.");
      return;
    }

    const nextHomeContent = transformHomeStats(homeBlock.content);
    const nextAboutContent = transformAboutStats(aboutBlock.content);

    console.log("\n3. BEFORE-AND-AFTER DIFF:");
    console.log("----------------------------------------------------------------");
    console.log(`Homepage Block [${BASELINE.home.id}]`);
    console.log("----------------------------------------------------------------");
    console.log("BEFORE (stat-1):", homeBlock.content.stats.find((s) => s.id === "stat-1"));
    console.log("AFTER  (stat-1):", nextHomeContent.stats.find((s) => s.id === "stat-1"));
    console.log("BEFORE (stat-6):", homeBlock.content.stats.find((s) => s.id === "stat-6"));
    console.log("AFTER  (stat-6):", nextHomeContent.stats.find((s) => s.id === "stat-6"));

    console.log("\n----------------------------------------------------------------");
    console.log(`About Page Block [${BASELINE.about.id}]`);
    console.log("----------------------------------------------------------------");
    console.log("BEFORE (items 0-2):");
    console.log(homeBlock.content.stats ? aboutBlock.content.stats.slice(0, 3) : []);
    console.log("AFTER  (items 0-2):");
    console.log(nextAboutContent.stats.slice(0, 3));
    console.log("UNCHANGED (item 3):", nextAboutContent.stats[3]);

    if (!isExecute) {
      console.log("\n================================================================");
      console.log("✅ [DRY RUN COMPLETED SUCCESSFULLY]");
      console.log("No changes were written to the database.");
      console.log("To apply these changes, rerun with: node scripts/update-production-cms-statistics.mjs --execute");
      console.log("================================================================");
      return;
    }

    // EXECUTE MODE: Create snapshot first
    console.log("\n4. Creating pre-update recovery snapshot...");
    const backupDir = resolve(cwd, "prisma/backups/cms-statistics");
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotPath = resolve(backupDir, `snapshot-${timestamp}.json`);

    const snapshotData = {
      timestamp: new Date().toISOString(),
      homeBlock: {
        id: homeBlock.id,
        content: homeBlock.content,
      },
      aboutBlock: {
        id: aboutBlock.id,
        content: aboutBlock.content,
      },
    };

    writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2), "utf8");
    console.log(`   ✅ Snapshot saved to: ${snapshotPath}`);

    console.log("\n5. Executing database transaction...");
    await prisma.$transaction(async (tx) => {
      await tx.cmsContentBlock.update({
        where: { id: BASELINE.home.id },
        data: { content: nextHomeContent },
      });
      await tx.cmsContentBlock.update({
        where: { id: BASELINE.about.id },
        data: { content: nextAboutContent },
      });
    });

    console.log("   ✅ Database transaction committed successfully.");
    console.log(`\n🎉 UPDATE COMPLETE. Rollback available via:`);
    console.log(`   node scripts/update-production-cms-statistics.mjs --rollback "${snapshotPath}" --execute`);
  } catch (err) {
    console.error(`\n❌ ERROR: ${err.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only execute when run directly from CLI
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || process.argv[1])) {
  run();
}

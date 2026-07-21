/**
 * Repairs homepage statistics blocks that were seeded with empty content.
 *
 * The Prisma repository reads statistics from `content.stats` on the `statistics`
 * block, but the original seed wrote `content: {}` and kept the figures in the
 * demo-data array only. Databases seeded before that mismatch was fixed render no
 * statistics section at all.
 *
 * Safe to re-run: blocks that already contain statistics are left untouched, so
 * figures edited by an admin are never overwritten.
 *
 * Usage: npm run cms:repair-statistics [-- --dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { demoStatistics } from "@/demo-data/homepage";

const prisma = new PrismaClient();

function readStats(content: unknown): unknown[] {
  let parsed = content;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  if (!parsed || typeof parsed !== "object") return [];

  const stats = (parsed as Record<string, unknown>).stats;
  return Array.isArray(stats) ? stats : [];
}

async function repairStatistics(dryRun: boolean) {
  const blocks = await prisma.cmsContentBlock.findMany({
    where: { blockType: "statistics" },
    include: { page: { select: { slug: true } } },
  });

  if (blocks.length === 0) {
    console.log("No statistics blocks found. Nothing to repair.");
    return;
  }

  let repaired = 0;

  for (const block of blocks) {
    const existing = readStats(block.content);
    const label = `${block.page?.slug ?? "unknown"} / ${block.blockKey}`;

    if (existing.length > 0) {
      console.log(`[SKIP]   ${label} already has ${existing.length} statistic(s).`);
      continue;
    }

    if (dryRun) {
      console.log(`[DRY]    ${label} would be populated with ${demoStatistics.length} statistic(s).`);
      repaired++;
      continue;
    }

    const content =
      block.content && typeof block.content === "object" && !Array.isArray(block.content)
        ? (block.content as Record<string, unknown>)
        : {};

    await prisma.cmsContentBlock.update({
      where: { id: block.id },
      data: { content: { ...content, stats: demoStatistics } as never },
    });

    console.log(`[FIXED]  ${label} populated with ${demoStatistics.length} statistic(s).`);
    repaired++;
  }

  console.log(
    `\n${dryRun ? "Would repair" : "Repaired"} ${repaired} of ${blocks.length} statistics block(s).`
  );
}

repairStatistics(process.argv.includes("--dry-run"))
  .catch((error) => {
    console.error("Statistics repair failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

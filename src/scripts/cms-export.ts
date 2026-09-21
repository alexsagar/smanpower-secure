import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * CMS JSON export.
 *
 * INCLUDES (full table dumps): CmsPage (+ its CmsHeroSection and CmsContentBlock
 * rows), SEOPageMeta, MediaAsset, NavigationItem, SiteSetting, Industry,
 * TrainingFacility, ComplianceDocument, SuccessStory, InsightArticle.
 *
 * EXCLUDES (NOT recoverable from this file): every other table, notably users,
 * accounts/sessions, MFA data, audit logs, applicants/candidates, demands,
 * partners, permissions/roles, and all binary media in R2 — this file stores
 * only MediaAsset metadata rows, never the objects themselves.
 *
 * Therefore this export is a CMS-content backup, not a database backup. Full
 * database recovery uses the Neon branch/point-in-time restore path documented
 * in docs/runbooks/cms-backup-restore.md.
 */
const EXPORTED_MODELS = [
  ["pages", "cmsPage"],
  ["seoMeta", "sEOPageMeta"],
  ["mediaAssets", "mediaAsset"],
  ["navigationItems", "navigationItem"],
  ["siteSettings", "siteSetting"],
  ["industries", "industry"],
  ["facilities", "trainingFacility"],
  ["complianceDocs", "complianceDocument"],
  ["successStories", "successStory"],
  ["insightArticles", "insightArticle"],
] as const;

async function exportCmsData() {
  console.log("Exporting CMS data...");

  const data = {
    pages: await prisma.cmsPage.findMany({ include: { hero: true, blocks: true } }),
    seoMeta: await prisma.sEOPageMeta.findMany(),
    mediaAssets: await prisma.mediaAsset.findMany(),
    navigationItems: await prisma.navigationItem.findMany(),
    siteSettings: await prisma.siteSetting.findMany(),
    industries: await prisma.industry.findMany(),
    facilities: await prisma.trainingFacility.findMany(),
    complianceDocs: await prisma.complianceDocument.findMany(),
    successStories: await prisma.successStory.findMany(),
    insightArticles: await prisma.insightArticle.findMany(),
  };

  const backupsDir = path.join(process.cwd(), "prisma", "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(backupsDir, `cms-backup-${timestamp}.json`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  const readBack = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const report = await verifyBackup(readBack);

  if (report.problems.length > 0) {
    throw new Error(
      `Export verification FAILED for ${filePath}:\n - ${report.problems.join("\n - ")}`
    );
  }

  console.log(`✅ CMS export verified against live source counts:`);
  console.log(`   - File path: ${filePath}`);
  for (const line of report.lines) console.log(`   - ${line}`);
  console.log("   - EXCLUDED (not recoverable from this file): users/auth, audit logs,");
  console.log("     applicants, demands, partners, permissions, and R2 binary media.");
}

/**
 * Verifies the written file against read-only source counts and the
 * relationships cms-import.ts depends on. Counts are read live, never hard-coded.
 */
export async function verifyBackup(
  backup: Record<string, unknown[]>,
  client: { [k: string]: { count: () => Promise<number> } } = prisma as never
) {
  const problems: string[] = [];
  const lines: string[] = [];

  for (const [key, model] of EXPORTED_MODELS) {
    const exported = Array.isArray(backup[key]) ? backup[key].length : -1;
    if (exported < 0) {
      problems.push(`${key}: missing or not an array in export`);
      continue;
    }
    const source = await client[model].count();
    lines.push(`${key}: ${exported} exported / ${source} in source`);
    if (exported !== source) {
      problems.push(`${key}: exported ${exported} rows but source has ${source}`);
    }
  }

  // Relationships cms-import.ts replays: heroes/blocks must be nested under pages,
  // and navigation parents must be present for every child.
  const pages = (backup.pages ?? []) as Array<{
    id: string;
    hero?: { pageId: string } | null;
    blocks?: Array<{ pageId: string }>;
  }>;
  const pageIds = new Set(pages.map((p) => p.id));
  let heroes = 0;
  let blocks = 0;
  for (const page of pages) {
    if (page.hero) {
      heroes++;
      if (!pageIds.has(page.hero.pageId)) problems.push(`hero of page ${page.id} references missing page`);
    }
    for (const block of page.blocks ?? []) {
      blocks++;
      if (!pageIds.has(block.pageId)) problems.push(`block of page ${page.id} references missing page`);
    }
  }

  const sourceHeroes = await client.cmsHeroSection.count();
  const sourceBlocks = await client.cmsContentBlock.count();
  lines.push(`heroSections: ${heroes} exported / ${sourceHeroes} in source`);
  lines.push(`contentBlocks: ${blocks} exported / ${sourceBlocks} in source`);
  if (heroes !== sourceHeroes) problems.push(`heroSections: exported ${heroes} but source has ${sourceHeroes}`);
  if (blocks !== sourceBlocks) problems.push(`contentBlocks: exported ${blocks} but source has ${sourceBlocks}`);

  const nav = (backup.navigationItems ?? []) as Array<{ id: string; parentId?: string | null }>;
  const navIds = new Set(nav.map((n) => n.id));
  for (const item of nav) {
    if (item.parentId && !navIds.has(item.parentId)) {
      problems.push(`navigation item ${item.id} references missing parent ${item.parentId}`);
    }
  }

  return { problems, lines };
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("src/scripts/cms-export.ts")) {
  exportCmsData()
    .catch((e) => {
      console.error("❌ Export failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

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

  // Verify backup completeness and recoverability
  const stats = fs.statSync(filePath);
  if (stats.size < 1024) {
    throw new Error(`Backup file is suspiciously small (${stats.size} bytes). Export verification failed.`);
  }

  const readBack = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!Array.isArray(readBack.pages) || readBack.pages.length === 0) {
    throw new Error("Export verification failed: No pages found in backup.");
  }
  if (!Array.isArray(readBack.seoMeta) || readBack.seoMeta.length === 0) {
    throw new Error("Export verification failed: No SEO metadata found in backup.");
  }
  if (!Array.isArray(readBack.navigationItems) || readBack.navigationItems.length === 0) {
    throw new Error("Export verification failed: No navigation items found in backup.");
  }

  console.log(`✅ CMS data successfully exported and verified:`);
  console.log(`   - File path:        ${filePath}`);
  console.log(`   - File size:        ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   - CMS Pages:        ${readBack.pages.length}`);
  console.log(`   - SEO Page Meta:    ${readBack.seoMeta.length}`);
  console.log(`   - Navigation Items: ${readBack.navigationItems.length}`);
}

exportCmsData()
  .catch((e) => {
    console.error("❌ Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

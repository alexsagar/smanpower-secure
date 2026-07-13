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

  console.log(`✅ CMS data successfully exported to: ${filePath}`);
}

exportCmsData()
  .catch((e) => {
    console.error("❌ Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

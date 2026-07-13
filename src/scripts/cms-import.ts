import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function importCmsData(filePath: string) {
  console.log(`Importing CMS data from ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  await prisma.$transaction(async (tx) => {
    console.log("Clearing existing CMS data...");
    
    // Clear in correct order due to foreign keys
    await tx.cmsContentBlock.deleteMany();
    await tx.cmsHeroSection.deleteMany();
    await tx.sEOPageMeta.deleteMany();
    await tx.cmsPage.deleteMany();
    await tx.navigationItem.deleteMany();
    await tx.siteSetting.deleteMany();
    await tx.industry.deleteMany();
    await tx.trainingFacility.deleteMany();
    await tx.complianceDocument.deleteMany();
    await tx.insightArticle.deleteMany();
    await tx.successStory.deleteMany();
    await tx.mediaAsset.deleteMany(); // May fail if related to other non-CMS tables, but we'll try

    console.log("Restoring Media Assets...");
    if (data.mediaAssets) {
      for (const item of data.mediaAssets) {
        await tx.mediaAsset.create({ data: item });
      }
    }

    console.log("Restoring Industries...");
    if (data.industries) {
      for (const item of data.industries) {
        await tx.industry.create({ data: item });
      }
    }

    console.log("Restoring Training Facilities...");
    if (data.facilities) {
      for (const item of data.facilities) {
        await tx.trainingFacility.create({ data: item });
      }
    }

    console.log("Restoring Compliance Documents...");
    if (data.complianceDocs) {
      for (const item of data.complianceDocs) {
        await tx.complianceDocument.create({ data: item });
      }
    }

    console.log("Restoring Site Settings...");
    if (data.siteSettings) {
      for (const item of data.siteSettings) {
        await tx.siteSetting.create({ data: item });
      }
    }

    console.log("Restoring Navigation Items...");
    if (data.navigationItems) {
      // Restore parents first (where parentId is null)
      const parents = data.navigationItems.filter((i: any) => !i.parentId);
      const children = data.navigationItems.filter((i: any) => i.parentId);
      
      for (const item of parents) {
        await tx.navigationItem.create({ data: item });
      }
      for (const item of children) {
        await tx.navigationItem.create({ data: item });
      }
    }

    console.log("Restoring CMS Pages, Heroes, and Blocks...");
    if (data.pages) {
      for (const page of data.pages) {
        const { hero, blocks, ...pageData } = page;
        
        await tx.cmsPage.create({ data: pageData });

        if (hero) {
            await tx.cmsHeroSection.create({ data: hero });
        }

        if (blocks && blocks.length > 0) {
            for (const block of blocks) {
                await tx.cmsContentBlock.create({ data: block });
            }
        }
      }
    }

    console.log("Restoring SEO Metadata...");
    if (data.seoMeta) {
      for (const item of data.seoMeta) {
        await tx.sEOPageMeta.create({ data: item });
      }
    }

    console.log("Restoring Success Stories...");
    if (data.successStories) {
      for (const item of data.successStories) {
        await tx.successStory.create({ data: item });
      }
    }

    console.log("Restoring Insight Articles...");
    if (data.insightArticles) {
      for (const item of data.insightArticles) {
        await tx.insightArticle.create({ data: item });
      }
    }
  });

  console.log("✅ CMS data successfully restored.");
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Please provide the path to the backup file.");
  console.log("Usage: npm run cms:import <path-to-file>");
  process.exit(1);
}

importCmsData(args[0])
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

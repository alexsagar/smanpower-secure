import { PrismaClient } from "@prisma/client";
import { demoPages } from "../src/demo-data/pages";
import { demoHomepageBlocks, demoHomepageHero } from "../src/demo-data/homepage";
import { demoHeaderNavigation, demoFooterNavigation } from "../src/demo-data/navigation";
import { demoFooterSettings as footerSettings, demoSiteSettings } from "../src/demo-data/site-settings";
import { getAllDemoMedia } from "../src/demo-data/media";
import { demoIndustries } from "../src/demo-data/industries";
import { demoFacilities } from "../src/demo-data/facilities";
import { demoComplianceDocs } from "../src/demo-data/compliance";

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const forceOverwrite = process.argv.includes("--force-overwrite");
  console.log(`Seeding CMS data from demo fixtures... ${isDryRun ? "[DRY RUN]" : ""}`);

  const stats = { created: 0, skipped: 0, overwritten: 0 };

  function track(action: "created" | "skipped" | "overwritten") {
    stats[action]++;
  }

  // 1. Seed Media Assets
  console.log("Seeding Media Assets...");
  const mediaList = getAllDemoMedia();
  for (const media of mediaList) {
    if (isDryRun) { track("skipped"); continue; }
    await prisma.mediaAsset.upsert({
      where: { id: media.id },
      update: forceOverwrite ? {
        fileName: media.fileName || "unknown.png",
        fileUrl: media.secureUrl || media.localPath || "",
        altText: media.altText,
        caption: media.caption,
        folder: media.folder,
        width: media.width,
        height: media.height,
        status: media.mediaStatus === "REAL_APPROVED" ? "REAL_APPROVED" : "AI_PLACEHOLDER",
      } : {},
      create: {
        id: media.id,
        fileName: media.fileName || "unknown.png",
        fileUrl: media.secureUrl || media.localPath || "",
        altText: media.altText,
        caption: media.caption,
        folder: media.folder,
        width: media.width,
        height: media.height,
        status: media.mediaStatus === "REAL_APPROVED" ? "REAL_APPROVED" : "AI_PLACEHOLDER",
      }
    });
    track("created");
  }

  // 2. Seed Navigation (Header & Footer)
  console.log("Seeding Navigation...");
  const existingNavCount = await prisma.navigationItem.count();
  if (existingNavCount > 0 && !forceOverwrite) {
    console.log("Navigation exists, skipping...");
    track("skipped");
  } else {
    if (!isDryRun) {
      if (forceOverwrite) await prisma.navigationItem.deleteMany({});
      const allNav = [...demoHeaderNavigation];
      for (const navGroup of allNav) {
        const parent = await prisma.navigationItem.create({
          data: {
            label: navGroup.label,
            location: "header",
          }
        });
        for (const item of navGroup.items) {
          await prisma.navigationItem.create({
            data: { label: item.label, href: item.href, parentId: parent.id, location: "header" }
          });
        }
      }

      if (footerSettings.sections) {
        for (const section of footerSettings.sections) {
          const parent = await prisma.navigationItem.create({
            data: {
              label: section.title,
              location: "footer",
            }
          });
          for (const item of section.links) {
            await prisma.navigationItem.create({
              data: { label: item.label, href: item.href, parentId: parent.id, location: "footer" }
            });
          }
        }
      }
      track(forceOverwrite ? "overwritten" : "created");
    }
  }

  // 3. Seed Footer Settings
  console.log("Seeding Site Settings...");
  if (!isDryRun) {
    await prisma.siteSetting.upsert({
      where: { key: "footer_mission" },
      update: forceOverwrite ? { value: footerSettings.tagline } : {},
      create: { key: "footer_mission", value: footerSettings.tagline || "", group: "footer" }
    });
    await prisma.siteSetting.upsert({
      where: { key: "footer_contact" },
      update: forceOverwrite ? { value: { address: demoSiteSettings.address, phone: demoSiteSettings.phone, email: demoSiteSettings.email } } : {},
      create: { key: "footer_contact", value: { address: demoSiteSettings.address, phone: demoSiteSettings.phone, email: demoSiteSettings.email }, group: "footer" }
    });
    track("created");
  }

  // 4. Seed Industries
  console.log("Seeding Industries...");
  for (const industry of demoIndustries) {
    if (isDryRun) { track("skipped"); continue; }
    const imageUrl = industry.image && typeof industry.image === "object" ? (industry.image.secureUrl || industry.image.localPath) : industry.image;
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: forceOverwrite ? {
        name: industry.name, description: industry.description, icon: industry.icon, image: imageUrl as string,
      } : {},
      create: {
        id: industry.id, name: industry.name, slug: industry.slug, description: industry.description, icon: industry.icon, image: imageUrl as string,
      }
    });
    track("created");
  }

  // 5. Seed Training Facilities
  console.log("Seeding Training Facilities...");
  for (const facility of demoFacilities) {
    if (isDryRun) { track("skipped"); continue; }
    const imageUrls = facility.images ? facility.images.map((img: any) => img.secureUrl || img.localPath) : [];
    await prisma.trainingFacility.upsert({
      where: { slug: facility.slug },
      update: forceOverwrite ? {
        name: facility.name, description: facility.description, location: facility.location, capacity: facility.capacity, images: imageUrls,
      } : {},
      create: {
        id: facility.id, name: facility.name, slug: facility.slug, description: facility.description, location: facility.location, capacity: facility.capacity, images: imageUrls,
      }
    });
    track("created");
  }

  // 6. Seed Compliance Documents
  console.log("Seeding Compliance Documents...");
  const existingDocsCount = await prisma.complianceDocument.count();
  if (existingDocsCount > 0 && !forceOverwrite) {
    console.log("Compliance Docs exist, skipping...");
    track("skipped");
  } else {
    if (!isDryRun) {
      if (forceOverwrite) await prisma.complianceDocument.deleteMany({});
      for (const doc of demoComplianceDocs) {
        await prisma.complianceDocument.create({
          data: {
            id: doc.id, title: doc.title, description: doc.description, documentType: doc.documentType,
            issueDate: doc.issueDate ? new Date(doc.issueDate) : null, expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            fileUrl: doc.file?.secureUrl || doc.file?.localPath || "", isPublic: doc.isPublic, isVerified: doc.isVerified,
          }
        });
      }
      track(forceOverwrite ? "overwritten" : "created");
    }
  }

  // 7. Seed Pages (Homepage & Demo Pages)
  console.log("Seeding CMS Pages...");
  const allPagesToSeed = [
    { slug: "home", title: "Homepage", hero: demoHomepageHero, blocks: demoHomepageBlocks },
    ...demoPages
  ];

  for (const p of allPagesToSeed) {
    console.log(`Seeding page: ${p.slug}`);
    if (isDryRun) { track("skipped"); continue; }
    const page = await prisma.cmsPage.upsert({
      where: { slug: p.slug },
      update: forceOverwrite ? { title: p.title, status: "PUBLISHED" } : {},
      create: { id: (p as any).id || `page_${p.slug}`, slug: p.slug, title: p.title, status: "PUBLISHED" }
    });

    if (p.hero) {
      if (p.hero.image) {
        const m = p.hero.image as any;
        await prisma.mediaAsset.upsert({
          where: { id: m.id },
          update: forceOverwrite ? { fileName: m.fileName || "unknown.png", fileUrl: m.secureUrl || m.localPath || m.fileUrl || "", altText: m.altText } : {},
          create: { id: m.id, fileName: m.fileName || "unknown.png", fileUrl: m.secureUrl || m.localPath || m.fileUrl || "", altText: m.altText }
        });
      }
      await prisma.cmsHeroSection.upsert({
        where: { pageId: page.id },
        update: forceOverwrite ? {
          eyebrow: p.hero.eyebrow, richHeading: p.hero.richHeading as any, richDescription: p.hero.richDescription as any,
          primaryCtaText: p.hero.primaryCta?.text, primaryCtaHref: p.hero.primaryCta?.href, secondaryCtaText: p.hero.secondaryCta?.text,
          secondaryCtaHref: p.hero.secondaryCta?.href, overlayEnabled: p.hero.overlayEnabled ?? true, overlayOpacity: p.hero.overlayOpacity ?? 60, imageId: p.hero.image?.id,
        } : {},
        create: {
          pageId: page.id, eyebrow: p.hero.eyebrow, richHeading: p.hero.richHeading as any, richDescription: p.hero.richDescription as any,
          primaryCtaText: p.hero.primaryCta?.text, primaryCtaHref: p.hero.primaryCta?.href, secondaryCtaText: p.hero.secondaryCta?.text,
          secondaryCtaHref: p.hero.secondaryCta?.href, overlayEnabled: p.hero.overlayEnabled ?? true, overlayOpacity: p.hero.overlayOpacity ?? 60, imageId: p.hero.image?.id,
        }
      });
    }

    if (p.blocks && p.blocks.length > 0) {
      const existingBlocks = await prisma.cmsContentBlock.count({ where: { pageId: page.id } });
      if (existingBlocks > 0 && !forceOverwrite) {
        console.log(`Blocks exist for ${p.slug}, skipping...`);
        track("skipped");
      } else {
        if (forceOverwrite) await prisma.cmsContentBlock.deleteMany({ where: { pageId: page.id } });
        for (let i = 0; i < p.blocks.length; i++) {
          const block = p.blocks[i];
          if (block.image) {
            const m = block.image as any;
            await prisma.mediaAsset.upsert({
              where: { id: m.id },
              update: forceOverwrite ? { fileName: m.fileName || "unknown.png", fileUrl: m.secureUrl || m.localPath || m.fileUrl || "", altText: m.altText } : {},
              create: { id: m.id, fileName: m.fileName || "unknown.png", fileUrl: m.secureUrl || m.localPath || m.fileUrl || "", altText: m.altText }
            });
          }
          await prisma.cmsContentBlock.create({
            data: {
              id: block.id, pageId: page.id, blockKey: block.blockKey || block.id, blockType: (block as any).type || block.blockType,
              order: block.order !== undefined ? block.order : i, visible: block.visible !== undefined ? block.visible : true,
              richHeading: block.richHeading as any, content: (block.content || block) as any, imageId: (block as any).mediaId || block.image?.id,
            }
          });
        }
        track(forceOverwrite ? "overwritten" : "created");
      }
    }
  }

  console.log(`\nCMS seeding completed successfully. Stats:`, stats);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

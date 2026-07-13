import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLIENTS = [
  "Emirates Gateway", "Falcon Zinc Metal", "Naturelle LLC",
  "Royal Falcon", "QBG Facilities", "Al Falah Security",
  "Qatar Airways", "Dubai Metro", "Al Marai", "Saudi Aramco"
];

const GROUP_COMPANIES = [
  "DAI Hotel Pvt. Ltd.", "Cyclope Smart Security", "Smart Builder",
  "DAI Business Management", "Yojala Japanese Academy", "Seven Seas Group",
  "DAI Trading Ltd."
];

async function main() {
  console.log("Seeding Global Partners and Group Companies...");

  let created = 0;
  let skipped = 0;

  // Insert Clients
  for (let i = 0; i < CLIENTS.length; i++) {
    const name = CLIENTS[i];
    const existing = await prisma.clientPartner.findFirst({ where: { name } });
    if (!existing) {
      await prisma.clientPartner.create({
        data: {
          name,
          category: 'CLIENT',
          isPublic: true,
          isVerified: true,
          order: i * 10
        }
      });
      created++;
    } else {
      skipped++;
    }
  }

  // Insert Group Companies
  for (let i = 0; i < GROUP_COMPANIES.length; i++) {
    const name = GROUP_COMPANIES[i];
    const existing = await prisma.clientPartner.findFirst({ where: { name } });
    if (!existing) {
      await prisma.clientPartner.create({
        data: {
          name,
          category: 'GROUP_COMPANY',
          isPublic: true,
          isVerified: true,
          order: i * 10
        }
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`Partners seeded: ${created} created, ${skipped} skipped.`);

  // Update CmsContentBlock heading if it's the partner block
  // The block type for ClientMarqueeBlock is usually 'CLIENT_MARQUEE'
  const blocks = await prisma.cmsContentBlock.findMany({
    where: { blockType: 'client_marquee' }
  });

  let updatedBlocks = 0;
  for (const block of blocks) {
    const content = block.content as any;
    if (content.heading === "Trusted by Industry Leaders Worldwide" || !content.heading) {
      content.heading = "Global Network";
      content.subheading = "Companies and group entities connected with our recruitment network";
      await prisma.cmsContentBlock.update({
        where: { id: block.id },
        data: { content }
      });
      updatedBlocks++;
    }
  }
  
  console.log(`Updated ${updatedBlocks} CMS blocks for Global Network headings.`);
  
  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

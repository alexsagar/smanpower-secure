import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "about" },
    include: { blocks: true }
  });
  console.log(JSON.stringify(page?.blocks, null, 2));
}

main().finally(() => prisma.$disconnect());

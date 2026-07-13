import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const settings = await prisma.siteSetting.findMany({ select: { key: true } });
  console.log(settings);
}
run().finally(() => prisma.$disconnect());

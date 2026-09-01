const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasourceUrl: process.env.URL_PROD});
prisma.$queryRawUnsafe(`SELECT provider, COUNT(*) as cnt FROM "MediaAsset" GROUP BY provider`)
  .then(res => console.log(res.map(r => ({ provider: r.provider, cnt: Number(r.cnt) }))))
  .finally(() => prisma.$disconnect());

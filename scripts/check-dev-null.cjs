const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasourceUrl: process.env.URL_LOCAL});
prisma.mediaAsset.findMany({where: {publicId: null}}).then(res => console.log(res.map(a => `${a.id} -> provider: ${a.provider}, key: ${a.storageKey}`))).finally(() => prisma.$disconnect());

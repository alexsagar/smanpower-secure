const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasourceUrl: process.env.URL_PROD});
prisma.cmsPage.findMany().then(res => console.log(res.map(p => p.slug))).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasourceUrl: process.env.URL_PROD});
async function run() {
    const page = await prisma.cmsPage.findFirst({where: {slug: 'home'}});
    if (page) {
        const hero = await prisma.cmsHeroSection.findUnique({where: {pageId: page.id}, include: {video: true, posterImage: true}});
        console.log("Homepage video:", hero.video);
        console.log("Homepage poster:", hero.posterImage);
    }
}
run().finally(() => prisma.$disconnect());

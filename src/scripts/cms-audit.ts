import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function auditCms() {
  console.log("Auditing CMS Integrity...\n");

  let healthy = true;
  let warnings = 0;
  let errors = 0;

  function report(status: "OK" | "WARN" | "ERROR", message: string) {
    if (status === "ERROR") { healthy = false; errors++; console.error(`[ERROR] ${message}`); }
    else if (status === "WARN") { warnings++; console.warn(`[WARN]  ${message}`); }
    else { console.log(`[OK]    ${message}`); }
  }

  // 1. Homepage Check
  const home = await prisma.cmsPage.findUnique({
    where: { slug: "home" },
    include: { hero: true, blocks: true }
  });

  if (!home) {
    report("ERROR", "Homepage ('home') is completely missing.");
  } else {
    report("OK", "Homepage exists.");
    if (!home.hero) report("ERROR", "Homepage is missing a Hero Section. Top of page will be empty.");
    if (home.blocks.length === 0) report("WARN", "Homepage has zero Content Blocks.");
    const homeSeo = await prisma.sEOPageMeta.findFirst({ where: { pagePath: "/" } });
    if (!homeSeo) report("WARN", "Homepage is missing SEO Metadata (path: '/').");
  }

  // 2. Global Pages Check
  const pages = await prisma.cmsPage.findMany({
    include: { blocks: true }
  });
  const allSeo = await prisma.sEOPageMeta.findMany();

  if (pages.length === 0) {
    report("ERROR", "Zero CMS pages exist in the database.");
  } else {
    const emptyPages = pages.filter(p => p.blocks.length === 0);
    if (emptyPages.length > 0) {
      report("WARN", `${emptyPages.length} pages have zero content blocks: ${emptyPages.map(p => p.slug).join(", ")}`);
    } else {
      report("OK", `All ${pages.length} pages have content blocks.`);
    }

    // Check SEO for each page (assuming pagePath matches /slug or / for home)
    const unoptimizedPages = pages.filter(p => {
      const path = p.slug === "home" ? "/" : `/${p.slug}`;
      return !allSeo.find(s => s.pagePath === path);
    });
    if (unoptimizedPages.length > 0) {
      report("WARN", `${unoptimizedPages.length} pages are missing SEO Metadata: ${unoptimizedPages.map(p => p.slug).join(", ")}`);
    }
  }

  // 3. Navigation Check
  const navItems = await prisma.navigationItem.count();
  if (navItems === 0) report("ERROR", "No Navigation Items found. Menus will be empty.");
  else report("OK", `Found ${navItems} Navigation Items.`);

  // 4. Site Settings Check
  const settings = await prisma.siteSetting.count();
  if (settings === 0) report("WARN", "No Site Settings found (e.g. footer contact info).");
  else report("OK", `Found ${settings} Site Settings.`);

  console.log(`\nAudit Complete: ${healthy ? "HEALTHY" : "NEEDS ATTENTION"}`);
  console.log(`Errors: ${errors} | Warnings: ${warnings}`);
}

auditCms()
  .catch((e) => {
    console.error("❌ Audit failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

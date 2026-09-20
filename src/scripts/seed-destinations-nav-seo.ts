/**
 * Seeds the CMS records the destination and Kathmandu pages need beyond their
 * page content: one navigation child under Workforce Solutions, and the
 * SEOPageMeta rows editors will tune.
 *
 * Idempotent: existing rows are updated in place, never duplicated. Run against
 * a single environment at a time.
 *
 * Usage: npx dotenv -e .env.development.local -- npx tsx src/scripts/seed-destinations-nav-seo.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAV_CHILD = {
  label: "Recruitment by Destination",
  labelNe: "गन्तव्य अनुसार भर्ना",
  href: "/destinations",
  description: "Destinations we currently recruit for",
  order: 9,
};

const SEO_ROWS = [
  {
    pagePath: "/destinations",
    metaTitle: "Recruitment by Destination | Nepali Workforce | Seven Seas Intercontinental",
    metaDescription:
      "Seven Seas Intercontinental recruits and mobilises Nepali workers for employers in Saudi Arabia, the UAE and Qatar. See our sectors, Nepal-side process and employer-pays recruitment standards.",
    focusKeyword: "recruitment by destination",
  },
  {
    pagePath: "/destinations/saudi-arabia",
    metaTitle: "Nepali Workforce Recruitment for Saudi Arabia | Seven Seas Intercontinental",
    metaDescription:
      "Licensed Nepal recruitment agency sourcing, screening and trade-testing Nepali workers for employers in Saudi Arabia. Employer-pays recruitment, RBA-compliant practices, Kathmandu trade testing.",
    focusKeyword: "recruitment agency nepal saudi arabia",
  },
  {
    pagePath: "/destinations/united-arab-emirates",
    metaTitle: "Nepali Workforce Recruitment for the UAE | Seven Seas Intercontinental",
    metaDescription:
      "Licensed Nepal recruitment agency sourcing, screening and trade-testing Nepali workers for employers in the United Arab Emirates. Employer-pays recruitment and Kathmandu-based trade testing.",
    focusKeyword: "recruitment agency nepal uae",
  },
  {
    pagePath: "/destinations/qatar",
    metaTitle: "Nepali Workforce Recruitment for Qatar | Seven Seas Intercontinental",
    metaDescription:
      "Licensed Nepal recruitment agency sourcing, screening and trade-testing Nepali workers for employers in Qatar. Employer-pays recruitment, documented process, Kathmandu trade testing.",
    focusKeyword: "recruitment agency nepal qatar",
  },
  {
    pagePath: "/manpower-agency-in-kathmandu",
    metaTitle: "Manpower Agency in Kathmandu, Nepal | Seven Seas Intercontinental",
    metaDescription:
      "Seven Seas Intercontinental is a licensed manpower and overseas employment agency in Guheswori, Kathmandu. Employers can request workforce; jobseekers should apply only through published demands.",
    focusKeyword: "manpower agency in kathmandu",
  },
];

async function seed(dryRun: boolean) {
  // ── Navigation child under the existing Workforce Solutions group ──
  const parent = await prisma.navigationItem.findFirst({
    where: { location: "header", parentId: null, label: { contains: "Workforce", mode: "insensitive" } },
  });

  if (!parent) {
    console.log("[SKIP] No 'Workforce Solutions' header group found — navigation unchanged.");
  } else {
    const existing = await prisma.navigationItem.findFirst({
      where: { parentId: parent.id, href: NAV_CHILD.href },
    });

    if (dryRun) {
      console.log(`[DRY-${existing ? "UPD" : "NEW"}] nav child ${NAV_CHILD.href} under "${parent.label}"`);
    } else if (existing) {
      await prisma.navigationItem.update({
        where: { id: existing.id },
        data: { ...NAV_CHILD, location: parent.location, isActive: true },
      });
      console.log(`[UPD]     nav child ${NAV_CHILD.href}`);
    } else {
      await prisma.navigationItem.create({
        data: { ...NAV_CHILD, location: parent.location, parentId: parent.id, isActive: true },
      });
      console.log(`[NEW]     nav child ${NAV_CHILD.href}`);
    }
  }

  // ── SEO metadata rows ──
  for (const row of SEO_ROWS) {
    const existing = await prisma.sEOPageMeta.findUnique({
      where: { pagePath_lang: { pagePath: row.pagePath, lang: "en" } },
    });

    if (dryRun) {
      console.log(`[DRY-${existing ? "UPD" : "NEW"}] seo ${row.pagePath}`);
      continue;
    }

    await prisma.sEOPageMeta.upsert({
      where: { pagePath_lang: { pagePath: row.pagePath, lang: "en" } },
      create: { ...row, lang: "en" },
      update: row,
    });
    console.log(`[${existing ? "UPD" : "NEW"}]     seo ${row.pagePath}`);
  }
}

seed(process.argv.includes("--dry-run"))
  .catch((error) => {
    console.error("Destination nav/SEO seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

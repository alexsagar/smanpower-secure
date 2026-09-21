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
import { createHash } from "node:crypto";
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

async function seedNavigation(dryRun: boolean) {
  console.log("\n--- NAVIGATION SEED ---");
  const parent = await prisma.navigationItem.findFirst({
    where: { location: "header", parentId: null, label: { contains: "Workforce", mode: "insensitive" } },
  });

  if (!parent) {
    console.log("[SKIP] No 'Workforce Solutions' header group found — navigation unchanged.");
    return;
  }

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

async function seedSeo(dryRun: boolean) {
  console.log("\n--- SEO METADATA SEED ---");
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

function isProductionDatabase(): boolean {
  if (process.env.APP_ENV === "production" || process.env.NODE_ENV === "production") return true;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;
  try {
    const parsed = new URL(dbUrl);
    const normalized = `${parsed.host.toLowerCase()}${(parsed.pathname || "").toLowerCase()}`;
    const hash = createHash("sha256").update(normalized).digest("hex");
    return (
      hash === "389b7880bc322e77d463cf45c8c8006509347f93fb05eff4990be91f3332e549" ||
      hash === "7912e6663ac6f6f2c0d962547637713dee426f4c6e232a4b4b520a39c0a9c713"
    );
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const includeSeo = args.includes("--seo-only") || args.includes("--seo") || args.includes("--all");
  const includeNav = args.includes("--nav-only") || args.includes("--nav") || args.includes("--all");

  // FAIL-CLOSED RULE 1: Scope is mandatory.
  if (!includeSeo && !includeNav) {
    console.error("\n❌ SAFETY ABORT: Missing scope!");
    console.error("You must explicitly specify what to seed: --seo-only, --nav-only, or --all.");
    console.error("Unscoped executions are strictly forbidden.\n");
    process.exitCode = 1;
    return;
  }

  // FAIL-CLOSED RULE 2: Default to DRY-RUN mode. Writes require explicit --apply or --execute.
  const isApply = args.includes("--apply") || args.includes("--execute");
  const dryRun = !isApply;

  // FAIL-CLOSED RULE 3: Production safety gate.
  const isProd = isProductionDatabase();
  const hasConfirmProd = args.includes("--confirm-production");

  if (isProd && isApply && !hasConfirmProd) {
    console.error("\n🚨 SAFETY ABORT: Target is PRODUCTION database!");
    console.error("Writing to production requires explicit --confirm-production.");
    console.error("Execution aborted to prevent unintended production write.\n");
    process.exitCode = 1;
    return;
  }

  const scopeDesc = includeSeo && includeNav
    ? "ALL (SEO Metadata + Navigation Child)"
    : includeSeo
    ? "SEO METADATA ONLY (Navigation Child DEFERRED)"
    : "NAVIGATION CHILD ONLY";

  console.log("================================================================");
  console.log("🛡️  DESTINATIONS & KATHMANDU SEO / NAV SEED");
  console.log("================================================================");
  console.log(`Execution Mode: ${dryRun ? "DRY-RUN (Safe: no database writes)" : "APPLY (LIVE WRITES AUTHORIZED)"}`);
  console.log(`Target Scope:   ${scopeDesc}`);
  console.log(`Environment:    ${isProd ? "PRODUCTION" : "NON-PRODUCTION"}`);
  console.log("================================================================\n");

  if (includeSeo) {
    await seedSeo(dryRun);
  }
  if (includeNav) {
    await seedNavigation(dryRun);
  }
}

main()
  .catch((error) => {
    console.error("Destination nav/SEO seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

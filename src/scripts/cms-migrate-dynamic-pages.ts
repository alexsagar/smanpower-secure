/**
 * Migrates the `[slug]` marketing pages from src/lib/content.ts into the CMS.
 *
 * The LIVE WEBSITE IS THE SOURCE OF TRUTH. Those routes currently render from
 * content.ts, so content.ts values are written into the CMS verbatim — never the
 * other way around. Where an existing CMS record has drifted from what the site
 * shows, the CMS record is realigned to the live copy so the migration cannot
 * change a single visible character.
 *
 * Re-runnable: existing CMS pages and blocks are updated in place by slug, so
 * page ids, block ids and block keys are preserved. No page is recreated.
 *
 * Usage: npm run cms:migrate-dynamic-pages [-- --dry-run]
 */
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  employersContent,
  ethicalContent,
  industriesContent,
  trainingContent,
  trustContent,
  destinationsContent,
  standaloneContent,
  type PageContent,
} from "@/lib/content";
import { buildDynamicPageBlockContent } from "@/lib/dynamic-page-content";

const prisma = new PrismaClient();

const CONTENT_GROUPS: Record<string, PageContent[]> = {
  employers: employersContent,
  "ethical-recruitment": ethicalContent,
  industries: industriesContent,
  "training-facilities": trainingContent,
  "trust-centre": trustContent,
  destinations: destinationsContent,
  // Root-level pages: their CMS slug is the bare page slug, not category/slug.
  standalone: standaloneContent,
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Structural equality that ignores object key order. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a as Record<string, unknown>).sort();
    const bKeys = Object.keys(b as Record<string, unknown>).sort();
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((k, i) => k === bKeys[i]) &&
      aKeys.every((k) =>
        deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
      )
    );
  }
  return false;
}

type Outcome = "created" | "updated" | "unchanged";

async function migrate(dryRun: boolean, only?: string[]) {
  const counts: Record<Outcome, number> = { created: 0, updated: 0, unchanged: 0 };

  for (const [category, entries] of Object.entries(CONTENT_GROUPS)) {
    // `--only=destinations,standalone` limits the run to those categories, so
    // adding a new page group cannot rewrite unrelated CMS records.
    if (only && !only.includes(category)) continue;
    for (const entry of entries) {
      const slug = category === "standalone" ? entry.slug : `${category}/${entry.slug}`;
      const desired = buildDynamicPageBlockContent(entry);

      const page = await prisma.cmsPage.findUnique({
        where: { slug },
        include: { blocks: { orderBy: { order: "asc" } } },
      });

      const existingBlock = page?.blocks.find((b) => b.blockType === "image_text");
      const current = existingBlock
        ? typeof existingBlock.content === "string"
          ? JSON.parse(existingBlock.content)
          : existingBlock.content
        : null;

      // Order-insensitive: Prisma returns JSON object keys in storage order, so a
      // plain stringify comparison would report every page as changed on re-run.
      const identical = current !== null && deepEqual(current, desired);

      if (identical) {
        counts.unchanged++;
        console.log(`[SAME]    ${slug}`);
        continue;
      }

      const outcome: Outcome = page ? "updated" : "created";
      counts[outcome]++;

      if (dryRun) {
        console.log(`[DRY-${outcome === "created" ? "NEW" : "UPD"}] ${slug}`);
        continue;
      }

      // Preserve the existing page record (id, title, status) when present.
      const targetPage =
        page ??
        (await prisma.cmsPage.create({
          data: {
            slug,
            title: entry.title || titleCase(entry.slug),
            status: "PUBLISHED",
          },
          include: { blocks: true },
        }));

      if (existingBlock) {
        await prisma.cmsContentBlock.update({
          where: { id: existingBlock.id },
          data: { content: desired as never },
        });
      } else {
        await prisma.cmsContentBlock.create({
          data: {
            pageId: targetPage.id,
            blockKey: `${entry.slug}-content`,
            blockType: "image_text",
            order: 0,
            visible: true,
            content: desired as never,
          },
        });
      }

      console.log(`[${outcome === "created" ? "NEW" : "UPD"}]     ${slug}`);
    }
  }

  console.log(
    `\n${dryRun ? "Would create" : "Created"} ${counts.created}, ` +
      `${dryRun ? "would update" : "updated"} ${counts.updated}, ` +
      `unchanged ${counts.unchanged}.`
  );
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

  // 1. Parse scope
  const onlyCategories: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--only=")) {
      onlyCategories.push(...arg.slice("--only=".length).split(",").filter(Boolean));
    } else if (arg === "--only" && args[i + 1] && !args[i + 1].startsWith("-")) {
      onlyCategories.push(...args[i + 1].split(",").filter(Boolean));
      i++;
    }
  }

  const hasAllFlag = args.includes("--all");

  // FAIL-CLOSED RULE 1: Scope is mandatory.
  if (onlyCategories.length === 0 && !hasAllFlag) {
    console.error("\n❌ SAFETY ABORT: Missing scope!");
    console.error("You must explicitly provide --only=<category,category> or --all.");
    console.error(`Valid categories: ${Object.keys(CONTENT_GROUPS).join(", ")}`);
    console.error("Unscoped executions are strictly forbidden.\n");
    process.exitCode = 1;
    return;
  }

  // Validate categories
  if (!hasAllFlag) {
    const validCategories = new Set(Object.keys(CONTENT_GROUPS));
    for (const cat of onlyCategories) {
      if (!validCategories.has(cat)) {
        console.error(`\n❌ SAFETY ABORT: Unrecognized category '${cat}'!`);
        console.error(`Valid categories: ${Object.keys(CONTENT_GROUPS).join(", ")}\n`);
        process.exitCode = 1;
        return;
      }
    }
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

  console.log("================================================================");
  console.log("🛡️  CMS DYNAMIC PAGES MIGRATION");
  console.log("================================================================");
  console.log(`Execution Mode: ${dryRun ? "DRY-RUN (Safe: no database writes)" : "APPLY (LIVE WRITES AUTHORIZED)"}`);
  console.log(`Target Scope:   ${hasAllFlag ? "ALL CATEGORIES" : onlyCategories.join(", ")}`);
  console.log(`Environment:    ${isProd ? "PRODUCTION" : "NON-PRODUCTION"}`);
  console.log("================================================================\n");

  await migrate(dryRun, hasAllFlag ? undefined : onlyCategories);
}

main()
  .catch((error) => {
    console.error("Dynamic page migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

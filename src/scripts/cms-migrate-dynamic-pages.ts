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
import { PrismaClient } from "@prisma/client";
import {
  employersContent,
  ethicalContent,
  industriesContent,
  trainingContent,
  trustContent,
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

async function migrate(dryRun: boolean) {
  const counts: Record<Outcome, number> = { created: 0, updated: 0, unchanged: 0 };

  for (const [category, entries] of Object.entries(CONTENT_GROUPS)) {
    for (const entry of entries) {
      const slug = `${category}/${entry.slug}`;
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

migrate(process.argv.includes("--dry-run"))
  .catch((error) => {
    console.error("Dynamic page migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

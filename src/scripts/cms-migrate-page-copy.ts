/**
 * Migrates editable copy for public pages that render their own JSX into the CMS.
 *
 * The LIVE WEBSITE IS THE SOURCE OF TRUTH: the defaults in src/lib/page-copy.ts
 * were extracted verbatim from the page components, and are written into the CMS
 * unchanged. Nothing is rewritten, and the same defaults stay in code as the
 * fallback, so a missing CMS record renders exactly what the site shows today.
 *
 * Re-runnable: pages and blocks are matched by slug and updated in place, so ids
 * and block keys are preserved and no page is recreated.
 *
 * Usage: npm run cms:migrate-page-copy [-- --dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { PAGE_COPY_DEFAULTS } from "@/lib/page-copy";

const prisma = new PrismaClient();

const PAGE_COPY_BLOCK_TYPE = "page_copy";

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

function titleFromSlug(slug: string): string {
  const last = slug.split("/").pop() ?? slug;
  return last
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function migrate(dryRun: boolean) {
  let created = 0;
  let unchanged = 0;

  for (const [slug, defaults] of Object.entries(PAGE_COPY_DEFAULTS)) {
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
      include: { blocks: { orderBy: { order: "asc" } } },
    });

    const existingBlock = page?.blocks.find((b) => b.blockType === PAGE_COPY_BLOCK_TYPE);
    const current = existingBlock
      ? typeof existingBlock.content === "string"
        ? JSON.parse(existingBlock.content)
        : existingBlock.content
      : null;

    if (current !== null && deepEqual(current, defaults)) {
      unchanged++;
      console.log(`[SAME]    ${slug}`);
      continue;
    }

    // Never overwrite copy an editor has already customised.
    if (current !== null) {
      unchanged++;
      console.log(`[KEEP]    ${slug} (already edited in CMS, left untouched)`);
      continue;
    }

    if (dryRun) {
      created++;
      console.log(`[DRY-NEW] ${slug}`);
      continue;
    }

    const targetPage =
      page ??
      (await prisma.cmsPage.create({
        data: { slug, title: titleFromSlug(slug), status: "PUBLISHED" },
        include: { blocks: true },
      }));

    await prisma.cmsContentBlock.create({
      data: {
        pageId: targetPage.id,
        blockKey: `${slug.replace(/\//g, "-")}-copy`,
        blockType: PAGE_COPY_BLOCK_TYPE,
        order: page?.blocks.length ?? 0,
        visible: true,
        content: defaults as never,
      },
    });

    created++;
    console.log(`[NEW]     ${slug}`);
  }

  console.log(
    `\n${dryRun ? "Would create" : "Created"} ${created}, unchanged ${unchanged}.`
  );
}

migrate(process.argv.includes("--dry-run"))
  .catch((error) => {
    console.error("Page copy migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

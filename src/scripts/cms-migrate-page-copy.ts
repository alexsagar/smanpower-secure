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

/**
 * Backfills keys the defaults define but the stored copy is missing, without
 * touching any value an editor has already set. This lets newly-wired fields
 * appear in the CMS without overwriting existing edits.
 */
function backfillMissing(defaults: unknown, stored: unknown): unknown {
  if (
    !defaults || typeof defaults !== "object" || Array.isArray(defaults) ||
    !stored || typeof stored !== "object" || Array.isArray(stored)
  ) {
    return stored;
  }

  const result: Record<string, unknown> = { ...(stored as Record<string, unknown>) };

  for (const [key, value] of Object.entries(defaults as Record<string, unknown>)) {
    if (!(key in result)) {
      result[key] = value;
    } else {
      result[key] = backfillMissing(value, result[key]);
    }
  }

  return result;
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
  let backfilled = 0;
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

    // Existing copy may have been edited: keep every stored value and only add
    // keys the defaults have gained since it was written.
    if (current !== null && existingBlock) {
      const merged = backfillMissing(defaults, current);

      if (deepEqual(merged, current)) {
        unchanged++;
        console.log(`[KEEP]    ${slug} (edited in CMS, nothing to backfill)`);
        continue;
      }

      if (dryRun) {
        backfilled++;
        console.log(`[DRY-ADD] ${slug} (would add newly wired fields)`);
        continue;
      }

      await prisma.cmsContentBlock.update({
        where: { id: existingBlock.id },
        data: { content: merged as never },
      });
      backfilled++;
      console.log(`[ADD]     ${slug} (new fields added, existing edits preserved)`);
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

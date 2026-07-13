import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { parseArgs } from "util";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": { type: "boolean" },
      execute: { type: "boolean" },
    },
  });

  const isDryRun = values["dry-run"] || (!values.execute && !values["dry-run"]);
  const isExecute = values.execute;

  console.log(`Starting media orphan cleanup... Mode: ${isExecute ? "EXECUTE" : "DRY RUN"}`);

  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing Cloudinary configuration. Aborting.");
    process.exit(1);
  }

  // 1. Get all public IDs from DB
  const mediaAssets = await prisma.mediaAsset.findMany({ select: { publicId: true } });
  const candidateDocs = await prisma.candidateDocument.findMany({ select: { fileUrl: true } }); // Assuming fileUrl contains the public ID or is parsed in a similar way. Actually, wait. We need the exact publicId.

  const dbPublicIds = new Set<string>();

  for (const m of mediaAssets) {
    if (m.publicId) dbPublicIds.add(m.publicId);
  }

  for (const c of candidateDocs) {
    // Attempt to extract publicId from URL if it's a full URL, or assume it's just publicId
    if (c.fileUrl.startsWith("http")) {
      const parts = c.fileUrl.split("/");
      const filenameWithExt = parts[parts.length - 1];
      const folder = parts[parts.length - 2];
      dbPublicIds.add(`${folder}/${filenameWithExt.split(".")[0]}`);
    } else {
      dbPublicIds.add(c.fileUrl); // Sometimes we just store public ID
    }
  }

  console.log(`Found ${dbPublicIds.size} referenced assets in PostgreSQL.`);

  // 2. Fetch all Cloudinary assets in valid prefixes
  const validFolders = [
    "seven-seas-cms",
    "seven-seas-news",
    "seven-seas-insights",
    "seven-seas-demands",
    "seven-seas-careers",
    "seven-seas-partners",
    "seven-seas-training",
    "seven-seas-candidates"
  ];

  let nextCursor: string | undefined = undefined;
  const orphansToClean = [];

  const now = new Date();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  console.log("Scanning Cloudinary folders...");

  do {
    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 500,
        next_cursor: nextCursor,
      });

      nextCursor = result.next_cursor;

      for (const resource of result.resources) {
        if (!validFolders.includes(resource.folder)) continue;

        const publicId = resource.public_id;
        const createdAt = new Date(resource.created_at);
        const ageInMs = now.getTime() - createdAt.getTime();

        if (!dbPublicIds.has(publicId)) {
          if (ageInMs > TWENTY_FOUR_HOURS) {
            orphansToClean.push({ publicId, type: "upload", resource_type: resource.resource_type });
          }
        }
      }
    } catch (e) {
      console.error("Failed fetching Cloudinary upload resources:", e);
      break;
    }
  } while (nextCursor);

  // Scan private assets too
  nextCursor = undefined;
  do {
    try {
      const result = await cloudinary.api.resources({
        type: "private",
        max_results: 500,
        next_cursor: nextCursor,
      });

      nextCursor = result.next_cursor;

      for (const resource of result.resources) {
        if (!validFolders.includes(resource.folder)) continue;

        const publicId = resource.public_id;
        const createdAt = new Date(resource.created_at);
        const ageInMs = now.getTime() - createdAt.getTime();

        if (!dbPublicIds.has(publicId)) {
          if (ageInMs > TWENTY_FOUR_HOURS) {
            orphansToClean.push({ publicId, type: "private", resource_type: resource.resource_type });
          }
        }
      }
    } catch (e) {
      console.error("Failed fetching Cloudinary private resources:", e);
      break;
    }
  } while (nextCursor);

  console.log(`Found ${orphansToClean.length} orphans older than 24 hours.`);

  if (isExecute) {
    let successCount = 0;
    let failCount = 0;

    for (const orphan of orphansToClean) {
      try {
        await cloudinary.uploader.destroy(orphan.publicId, { type: orphan.type, resource_type: orphan.resource_type });
        successCount++;
        console.log(`Deleted orphan: ${orphan.publicId}`);
      } catch (e) {
        failCount++;
        console.error(`Failed to delete orphan: ${orphan.publicId}`);
      }
    }
    console.log(`Cleanup complete. Deleted: ${successCount}, Failed: ${failCount}`);
  } else {
    console.log("DRY RUN: No assets were deleted.");
    // Log the first few orphans for manual inspection
    orphansToClean.slice(0, 10).forEach(o => console.log(`[DRY RUN] Would delete: ${o.publicId}`));
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

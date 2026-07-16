import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { parseArgs } from "util";
import { pathToFileURL } from "url";
import {
  assertCloudinaryNamespaceConfiguration,
  resolveCloudinaryFolder,
} from "@/lib/cloudinary-namespace";
import {
  deleteManagedAsset,
  extractCloudinaryPublicIdFromUrl,
} from "@/services/cloudinary.service";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BASE_FOLDERS = [
  "seven-seas-cms",
  "seven-seas-news",
  "seven-seas-insights",
  "seven-seas-demands",
  "seven-seas-careers",
  "seven-seas-partners",
  "seven-seas-training",
  "seven-seas-candidates",
] as const;

type CloudinaryResourceRecord = {
  public_id: string;
  resource_type: "image" | "video" | "raw";
  created_at: string;
};

type OrphanRecord = {
  publicId: string;
  type: "upload" | "private";
  resource_type: "image" | "video" | "raw";
};

export function getScopedCleanupFolders(): string[] {
  assertCloudinaryNamespaceConfiguration();
  return BASE_FOLDERS.map((folder) => resolveCloudinaryFolder(folder));
}

export function buildReferencedPublicIdSet(values: Array<string | null>): Set<string> {
  const publicIds = new Set<string>();

  for (const value of values) {
    if (!value) continue;
    const normalized = value.trim();
    if (!normalized) continue;

    const extracted = extractCloudinaryPublicIdFromUrl(normalized);
    if (extracted) {
      publicIds.add(extracted.publicId);
      continue;
    }

    if (/^https?:\/\//i.test(normalized)) {
      continue;
    }

    publicIds.add(normalized);
  }

  return publicIds;
}

export function collectOrphansFromResources(
  resources: CloudinaryResourceRecord[],
  dbPublicIds: Set<string>,
  now: Date,
  deliveryType: "upload" | "private"
): OrphanRecord[] {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  return resources.flatMap((resource) => {
    const createdAt = new Date(resource.created_at);
    const ageInMs = now.getTime() - createdAt.getTime();

    if (dbPublicIds.has(resource.public_id) || ageInMs <= TWENTY_FOUR_HOURS) {
      return [];
    }

    return [
      {
        publicId: resource.public_id,
        type: deliveryType,
        resource_type: resource.resource_type,
      },
    ];
  });
}

async function fetchFolderResources(
  folder: string,
  deliveryType: "upload" | "private"
): Promise<CloudinaryResourceRecord[]> {
  const resources: CloudinaryResourceRecord[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: deliveryType,
      prefix: `${folder}/`,
      max_results: 500,
      next_cursor: nextCursor,
    });

    nextCursor = result.next_cursor;
    resources.push(
      ...(result.resources as CloudinaryResourceRecord[])
    );
  } while (nextCursor);

  return resources;
}

export async function scanCloudinaryOrphans(
  dbPublicIds: Set<string>,
  now: Date = new Date()
): Promise<OrphanRecord[]> {
  const scopedFolders = getScopedCleanupFolders();
  const orphans: OrphanRecord[] = [];

  for (const folder of scopedFolders) {
    const deliveryType =
      folder === resolveCloudinaryFolder("seven-seas-candidates")
        ? "private"
        : "upload";

    const resources = await fetchFolderResources(folder, deliveryType);
    orphans.push(
      ...collectOrphansFromResources(
        resources,
        dbPublicIds,
        now,
        deliveryType
      )
    );
  }

  return orphans;
}

export async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": { type: "boolean" },
      execute: { type: "boolean" },
    },
  });

  const isExecute = Boolean(values.execute);
  const isDryRun = values["dry-run"] || !isExecute;

  console.log(`Starting media orphan cleanup... Mode: ${isExecute ? "EXECUTE" : "DRY RUN"}`);

  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing Cloudinary configuration. Aborting.");
    process.exit(1);
  }

  const mediaAssets = await prisma.mediaAsset.findMany({
    select: { publicId: true },
  });
  const candidateDocs = await prisma.candidateDocument.findMany({
    select: { fileUrl: true },
  });

  const dbPublicIds = buildReferencedPublicIdSet([
    ...mediaAssets.map((asset) => asset.publicId),
    ...candidateDocs.map((doc) => doc.fileUrl),
  ]);

  console.log(`Found ${dbPublicIds.size} referenced assets in PostgreSQL.`);
  console.log("Scanning Cloudinary folders...");

  const orphansToClean = await scanCloudinaryOrphans(dbPublicIds);

  console.log(`Found ${orphansToClean.length} orphans older than 24 hours.`);

  if (isExecute) {
    let successCount = 0;
    let failCount = 0;

    for (const orphan of orphansToClean) {
      try {
        const deleted = await deleteManagedAsset(orphan.publicId, {
          deliveryType: orphan.type,
          resourceType: orphan.resource_type,
        });
        if (deleted) {
          successCount++;
          console.log(`Deleted orphan: ${orphan.publicId}`);
        } else {
          failCount++;
          console.error(`Failed to delete orphan: ${orphan.publicId}`);
        }
      } catch {
        failCount++;
        console.error(`Failed to delete orphan: ${orphan.publicId}`);
      }
    }

    console.log(`Cleanup complete. Deleted: ${successCount}, Failed: ${failCount}`);
  } else if (isDryRun) {
    console.log("DRY RUN: No assets were deleted.");
    orphansToClean
      .slice(0, 10)
      .forEach((orphan) => console.log(`[DRY RUN] Would delete: ${orphan.publicId}`));
  }

  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

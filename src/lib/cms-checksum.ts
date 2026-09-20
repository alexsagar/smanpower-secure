import { createHash } from "node:crypto";

/**
 * Deterministic canonical JSON serializer that recursively sorts all object keys.
 * Preserves array order and primitive types without omitting nested properties.
 */
export function canonicalJsonStringify(val: unknown): string {
  if (val === null || typeof val !== "object") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map(canonicalJsonStringify).join(",") + "]";
  }
  const sortedKeys = Object.keys(val as Record<string, unknown>).sort();
  const pairs = sortedKeys.map(
    (k) =>
      JSON.stringify(k) +
      ":" +
      canonicalJsonStringify((val as Record<string, unknown>)[k])
  );
  return "{" + pairs.join(",") + "}";
}

/**
 * Computes a deterministic SHA-256 checksum of an object's nested contents.
 */
export function computeObjectChecksum(obj: unknown): string {
  return createHash("sha256")
    .update(canonicalJsonStringify(obj), "utf8")
    .digest("hex");
}

export interface RollbackBlockItem {
  blockId: string;
  slug: string;
  content: unknown;
}

export interface RollbackValidationParams {
  snapshotDbHash?: string;
  currentDbHash: string;
  snapshotBlocks: RollbackBlockItem[];
  liveBlocks: Map<string, unknown>;
  getExpectedPostSyncContent: (slug: string, preSyncContent: unknown) => unknown;
  allowUnexpected?: boolean;
}

export interface RollbackAction {
  blockId: string;
  slug: string;
  content: unknown;
  status: "CLEAN" | "ALREADY_RESTORED" | "OVERWRITE_FORCED";
}

export interface RollbackValidationResult {
  success: boolean;
  actions: RollbackAction[];
  error?: string;
  alreadyRestoredCount: number;
}

/**
 * Validates a snapshot rollback plan against current live database records:
 * 1. Rejects wrong-database rollback attempts when snapshotDbHash does not match currentDbHash.
 * 2. Compares live record checksums against both pre-sync target content and expected post-sync content.
 * 3. Aborts if live records contain unexpected edits made after the snapshot, unless allowUnexpected is explicitly true.
 */
export function validateRollbackPlan(params: RollbackValidationParams): RollbackValidationResult {
  if (params.snapshotDbHash && params.snapshotDbHash !== params.currentDbHash) {
    return {
      success: false,
      actions: [],
      alreadyRestoredCount: 0,
      error: `Database identity mismatch: snapshot target DB hash (${params.snapshotDbHash.slice(0, 12)}...) does not match connected DB hash (${params.currentDbHash.slice(0, 12)}...). Aborting rollback because snapshot belongs to a different database.`,
    };
  }

  const actions: RollbackAction[] = [];
  let alreadyRestoredCount = 0;

  for (const item of params.snapshotBlocks) {
    if (!params.liveBlocks.has(item.blockId)) {
      return {
        success: false,
        actions: [],
        alreadyRestoredCount,
        error: `Target block ${item.blockId} (${item.slug}) does not exist in the connected database.`,
      };
    }

    const liveContent = params.liveBlocks.get(item.blockId);
    const currentChecksum = computeObjectChecksum(liveContent);
    const restoreChecksum = computeObjectChecksum(item.content);
    const expectedPostSyncContent = params.getExpectedPostSyncContent(item.slug, item.content);
    const expectedPostSyncChecksum = computeObjectChecksum(expectedPostSyncContent);

    if (currentChecksum === restoreChecksum) {
      alreadyRestoredCount++;
      continue;
    }

    if (currentChecksum === expectedPostSyncChecksum) {
      actions.push({
        blockId: item.blockId,
        slug: item.slug,
        content: item.content,
        status: "CLEAN",
      });
    } else {
      if (!params.allowUnexpected) {
        return {
          success: false,
          actions: [],
          alreadyRestoredCount,
          error: `Block ${item.blockId} (${item.slug}) contains unexpected edits made after the snapshot. Aborting rollback to protect subsequent legitimate edits. Pass --force-unmatched to override.`,
        };
      }
      actions.push({
        blockId: item.blockId,
        slug: item.slug,
        content: item.content,
        status: "OVERWRITE_FORCED",
      });
    }
  }

  return {
    success: true,
    actions,
    alreadyRestoredCount,
  };
}

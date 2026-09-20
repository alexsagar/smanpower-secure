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

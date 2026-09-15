/**
 * Safely normalizes a Date, ISO string, null, or undefined to a valid ISO 8601 string.
 *
 * Designed specifically for Next.js App Router and unstable_cache SSR scenarios
 * where cached Date objects are deserialized as JSON strings, or where malformed
 * date values must never cause SSR to throw an unhandled exception.
 *
 * @param date - Date object, ISO string, null, or undefined.
 * @returns A valid ISO 8601 string when possible, or undefined if missing/invalid.
 */
export function toSafeIsoString(date?: Date | string | null): string | undefined {
  if (date === null || date === undefined) {
    return undefined;
  }

  if (date instanceof Date) {
    const time = date.getTime();
    return isNaN(time) ? undefined : date.toISOString();
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = new Date(trimmed);
    const time = parsed.getTime();
    return isNaN(time) ? undefined : parsed.toISOString();
  }

  return undefined;
}

import { describe, expect, it } from "vitest";
import { toSafeIsoString } from "./date";

describe("toSafeIsoString", () => {
  it("normalizes a valid Date object to an ISO 8601 string", () => {
    const d = new Date("2025-01-15T12:00:00.000Z");
    expect(toSafeIsoString(d)).toBe("2025-01-15T12:00:00.000Z");
  });

  it("normalizes an ISO string input to a valid ISO 8601 string", () => {
    expect(toSafeIsoString("2025-01-15T12:00:00.000Z")).toBe("2025-01-15T12:00:00.000Z");
    expect(toSafeIsoString("2025-01-15")).toBe("2025-01-15T00:00:00.000Z");
  });

  it("returns undefined for null", () => {
    expect(toSafeIsoString(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(toSafeIsoString(undefined)).toBeUndefined();
    expect(toSafeIsoString()).toBeUndefined();
  });

  it("returns undefined for invalid date string without throwing", () => {
    expect(toSafeIsoString("invalid-date")).toBeUndefined();
    expect(toSafeIsoString("")).toBeUndefined();
    expect(toSafeIsoString("   ")).toBeUndefined();
  });

  it("returns undefined for an invalid Date instance without throwing", () => {
    const invalidDate = new Date("invalid-date-string");
    expect(toSafeIsoString(invalidDate)).toBeUndefined();
  });
});

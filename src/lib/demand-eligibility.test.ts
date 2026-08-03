import { describe, it, expect } from "vitest";
import { isDemandPubliclyViewable, isReadvertisable } from "./demand-eligibility";
import { DemandStatus } from "@prisma/client";

describe("isDemandPubliclyViewable", () => {
  it("keeps open, expired (PUBLISHED) and CLOSED public demands viewable as historical pages", () => {
    expect(isDemandPubliclyViewable({ status: DemandStatus.PUBLISHED, isPublic: true })).toBe(true);
    expect(isDemandPubliclyViewable({ status: DemandStatus.CLOSED, isPublic: true })).toBe(true);
  });

  it("hides draft, under-review, archived and private demands (they 404)", () => {
    expect(isDemandPubliclyViewable({ status: DemandStatus.DRAFT, isPublic: true })).toBe(false);
    expect(isDemandPubliclyViewable({ status: DemandStatus.UNDER_REVIEW, isPublic: true })).toBe(false);
    expect(isDemandPubliclyViewable({ status: DemandStatus.ARCHIVED, isPublic: true })).toBe(false);
    expect(isDemandPubliclyViewable({ status: DemandStatus.PUBLISHED, isPublic: false })).toBe(false);
    expect(isDemandPubliclyViewable({ status: DemandStatus.CLOSED, isPublic: false })).toBe(false);
  });
});

describe("isReadvertisable", () => {
  it("is true for CLOSED and expired PUBLISHED demands, false otherwise", () => {
    expect(isReadvertisable({ status: DemandStatus.CLOSED, applicationDeadline: null })).toBe(true);
    expect(isReadvertisable({ status: DemandStatus.PUBLISHED, applicationDeadline: new Date("2000-01-01") })).toBe(true);
    expect(isReadvertisable({ status: DemandStatus.PUBLISHED, applicationDeadline: new Date("2999-01-01") })).toBe(false);
    expect(isReadvertisable({ status: DemandStatus.DRAFT, applicationDeadline: null })).toBe(false);
    expect(isReadvertisable({ status: DemandStatus.CLOSED, applicationDeadline: null, deletedAt: new Date() })).toBe(false);
  });
});

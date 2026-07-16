import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildReferencedPublicIdSet,
  collectOrphansFromResources,
  getScopedCleanupFolders,
} from "./media-orphan-cleanup";

describe("media orphan cleanup staging isolation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("scopes staging cleanup to staging-owned folders only", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(getScopedCleanupFolders()).toEqual([
      "staging/seven-seas-cms",
      "staging/seven-seas-news",
      "staging/seven-seas-insights",
      "staging/seven-seas-demands",
      "staging/seven-seas-careers",
      "staging/seven-seas-partners",
      "staging/seven-seas-training",
      "staging/seven-seas-candidates",
    ]);
  });

  it("fails closed in staging without the exact prefix", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");

    expect(() => getScopedCleanupFolders()).toThrow(
      'Staging requires CLOUDINARY_FOLDER_PREFIX="staging".'
    );
  });

  it("keeps only orphaned scoped assets older than 24 hours", () => {
    const dbPublicIds = buildReferencedPublicIdSet([
      "staging/seven-seas-cms/claimed-image",
    ]);
    const now = new Date("2026-07-16T12:00:00.000Z");

    const result = collectOrphansFromResources(
      [
        {
          public_id: "staging/seven-seas-cms/claimed-image",
          resource_type: "image",
          created_at: "2026-07-14T10:00:00.000Z",
        },
        {
          public_id: "staging/seven-seas-cms/new-image",
          resource_type: "image",
          created_at: "2026-07-16T11:30:00.000Z",
        },
        {
          public_id: "staging/seven-seas-candidates/old-doc",
          resource_type: "raw",
          created_at: "2026-07-14T10:00:00.000Z",
        },
      ],
      dbPublicIds,
      now,
      "private"
    );

    expect(result).toEqual([
      {
        publicId: "staging/seven-seas-candidates/old-doc",
        type: "private",
        resource_type: "raw",
      },
    ]);
  });

  it("converts legacy candidate-document Cloudinary urls into referenced public ids", () => {
    const result = buildReferencedPublicIdSet([
      "staging/seven-seas-candidates/direct-doc",
      "https://res.cloudinary.com/demo/raw/private/v1720/seven-seas-candidates/legacy-doc.pdf",
      "https://example.com/not-cloudinary.pdf",
      null,
    ]);

    expect(result).toEqual(
      new Set([
        "staging/seven-seas-candidates/direct-doc",
        "seven-seas-candidates/legacy-doc",
      ])
    );
  });

  it("marks staging candidate orphans as private", () => {
    const result = collectOrphansFromResources(
      [
        {
          public_id: "staging/seven-seas-candidates/orphan-doc",
          resource_type: "raw",
          created_at: "2026-07-14T10:00:00.000Z",
        },
      ],
      new Set<string>(),
      new Date("2026-07-16T12:00:00.000Z"),
      "private"
    );

    expect(result).toEqual([
      {
        publicId: "staging/seven-seas-candidates/orphan-doc",
        type: "private",
        resource_type: "raw",
      },
    ]);
  });

  it("marks production candidate orphans as private", () => {
    const result = collectOrphansFromResources(
      [
        {
          public_id: "seven-seas-candidates/orphan-doc",
          resource_type: "raw",
          created_at: "2026-07-14T10:00:00.000Z",
        },
      ],
      new Set<string>(),
      new Date("2026-07-16T12:00:00.000Z"),
      "private"
    );

    expect(result).toEqual([
      {
        publicId: "seven-seas-candidates/orphan-doc",
        type: "private",
        resource_type: "raw",
      },
    ]);
  });

  it("marks normal CMS orphans as upload", () => {
    const result = collectOrphansFromResources(
      [
        {
          public_id: "seven-seas-cms/orphan-image",
          resource_type: "image",
          created_at: "2026-07-14T10:00:00.000Z",
        },
      ],
      new Set<string>(),
      new Date("2026-07-16T12:00:00.000Z"),
      "upload"
    );

    expect(result).toEqual([
      {
        publicId: "seven-seas-cms/orphan-image",
        type: "upload",
        resource_type: "image",
      },
    ]);
  });
});

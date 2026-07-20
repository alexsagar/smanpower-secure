import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  authMock,
  requirePermissionMock,
  findUniqueMock,
  txUpdateMock,
  txAuditCreateMock,
  deleteManagedAssetMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  requirePermissionMock: vi.fn(),
  findUniqueMock: vi.fn(),
  txUpdateMock: vi.fn(),
  txAuditCreateMock: vi.fn(),
  deleteManagedAssetMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/permissions", () => ({
  MEDIA_PERMISSIONS: {
    DELETE_OR_ARCHIVE: "media.delete_or_archive",
  },
  requirePermission: requirePermissionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mediaAsset: {
      findUnique: findUniqueMock,
    },
    auditLog: {
      create: txAuditCreateMock,
    },
    $transaction: vi.fn(async (callback) =>
      callback({
        mediaAsset: {
          update: txUpdateMock,
        },
        auditLog: {
          create: txAuditCreateMock,
        },
      })
    ),
  },
}));

vi.mock("@/services/cloudinary.service", async () => {
  const actual =
    await vi.importActual<typeof import("@/services/cloudinary.service")>(
      "@/services/cloudinary.service"
    );

  return {
    ...actual,
    deleteManagedAsset: deleteManagedAssetMock,
  };
});

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { POST } from "./route";

function buildAsset(folder: string, publicId: string) {
  return {
    id: "asset-1",
    folder,
    publicId,
    resourceType: "IMAGE",
    deletionState: "ACTIVE",
    _count: {
      heroImages: 0,
      heroVideos: 0,
      heroPosterImages: 0,
      heroMobileImages: 0,
      blockImages: 0,
      blockVideos: 0,
      blockPosterImages: 0,
      blockMobileImages: 0,
      demandLogos: 0,
      demandDocuments: 0,
      insightImages: 0,
      newsImages: 0,
      careerImages: 0,
      successStoryImages: 0,
    },
  };
}

describe("media delete route staging isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: { id: "admin-1" },
    });
    requirePermissionMock.mockResolvedValue({
      id: "admin-1",
    });
    txUpdateMock.mockResolvedValue({
      id: "asset-1",
      publicId: "staging/seven-seas-cms/image-1",
      resourceType: "IMAGE",
    });
    txAuditCreateMock.mockResolvedValue({});
    deleteManagedAssetMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects legacy shared media deletion in staging", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    findUniqueMock.mockResolvedValue(
      buildAsset("seven-seas-cms", "seven-seas-cms/image-1")
    );

    const response = await POST(
      new Request("http://localhost/api/admin/media/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "asset-1" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Cannot delete assets outside of approved project folders.",
    });
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });

  it("allows staging-owned deletion", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    findUniqueMock.mockResolvedValue(
      buildAsset(
        "staging/seven-seas-cms",
        "staging/seven-seas-cms/image-1"
      )
    );

    const response = await POST(
      new Request("http://localhost/api/admin/media/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "asset-1" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-cms/image-1",
      {
        resourceType: "image",
      }
    );
  });

  it("deletes staging-owned videos using the Cloudinary video resource type", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    findUniqueMock.mockResolvedValue({
      ...buildAsset(
        "staging/seven-seas-cms",
        "staging/seven-seas-cms/video-1"
      ),
      resourceType: "VIDEO",
    });
    txUpdateMock.mockResolvedValue({
      id: "asset-1",
      publicId: "staging/seven-seas-cms/video-1",
      resourceType: "VIDEO",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "asset-1" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-cms/video-1",
      {
        resourceType: "video",
      }
    );
  });

  it("rejects staging assets whose public id points to a legacy shared namespace", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    findUniqueMock.mockResolvedValue(
      buildAsset(
        "staging/seven-seas-cms",
        "seven-seas-cms/image-1"
      )
    );

    const response = await POST(
      new Request("http://localhost/api/admin/media/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "asset-1" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Cannot delete assets outside of the approved environment namespace.",
    });
    expect(txUpdateMock).not.toHaveBeenCalled();
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });

  it("keeps production deletion behavior unchanged", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");
    findUniqueMock.mockResolvedValue(
      buildAsset("seven-seas-cms", "seven-seas-cms/image-1")
    );
    txUpdateMock.mockResolvedValue({
      id: "asset-1",
      publicId: "seven-seas-cms/image-1",
      resourceType: "IMAGE",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "asset-1" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "seven-seas-cms/image-1",
      {
        resourceType: "image",
      }
    );
  });
});

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
  findFirstMock,
  createMock,
  cloudinaryResourceMock,
  deleteManagedAssetMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  requirePermissionMock: vi.fn(),
  findFirstMock: vi.fn(),
  createMock: vi.fn(),
  cloudinaryResourceMock: vi.fn(),
  deleteManagedAssetMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/permissions", () => ({
  MEDIA_PERMISSIONS: {
    VIEW: "media.view",
    UPLOAD: "media.upload",
    UPDATE: "media.update",
    DELETE_OR_ARCHIVE: "media.delete_or_archive",
  },
  requirePermission: requirePermissionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mediaAsset: {
      findFirst: findFirstMock,
      create: createMock,
    },
  },
}));

vi.mock("@/lib/cloudinary", () => ({
  default: {
    api: {
      resource: cloudinaryResourceMock,
    },
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
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { POST } from "./route";

function cloudinaryAsset(overrides: Record<string, unknown> = {}) {
  return {
    asset_folder: "staging/seven-seas-cms",
    resource_type: "image",
    format: "jpeg",
    bytes: 1024,
    width: 1200,
    height: 800,
    duration: null,
    tags: [],
    public_id: "staging/seven-seas-cms/cms_image",
    asset_id: "staging-asset-image",
    secure_url: "https://cdn.example.test/staging-image.jpeg",
    ...overrides,
  };
}

describe("media completion staging isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    authMock.mockResolvedValue({
      user: { id: "admin-1" },
    });
    requirePermissionMock.mockResolvedValue({
      id: "admin-1",
    });
    findFirstMock.mockResolvedValue(null);
    deleteManagedAssetMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a legacy shared public ID before Cloudinary lookup", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "seven-seas-cms/legacy-image",
          purpose: "cms_image",
          original_filename: "legacy.jpg",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Asset is outside the approved environment namespace",
    });
    expect(cloudinaryResourceMock).not.toHaveBeenCalled();
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });

  it("accepts Dynamic-folder cms_image metadata inside the staging namespace", async () => {
    cloudinaryResourceMock.mockResolvedValue(cloudinaryAsset());
    createMock.mockResolvedValue({
      id: "staging-media-image",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/cms_image",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          publicId: "staging/seven-seas-cms/cms_image",
          folder: "staging/seven-seas-cms",
        }),
      })
    );
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });

  it("accepts Dynamic-folder cms_video metadata inside the staging namespace", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        asset_folder: "staging/seven-seas-cms",
        resource_type: "video",
        format: "mp4",
        duration: 4,
        public_id: "staging/seven-seas-cms/lsghq77avthfu3t2nrqq",
        asset_id: "staging-asset-video",
        secure_url: "https://cdn.example.test/staging-video.mp4",
      })
    );
    createMock.mockResolvedValue({
      id: "staging-media-video",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/lsghq77avthfu3t2nrqq",
          purpose: "cms_video",
          original_filename: "0719.mp4",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          publicId: "staging/seven-seas-cms/lsghq77avthfu3t2nrqq",
          folder: "staging/seven-seas-cms",
          resourceType: "VIDEO",
        }),
      })
    );
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });

  it("uses asset_folder before legacy folder", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        asset_folder: "staging/seven-seas-cms",
        folder: "staging/seven-seas-news",
      })
    );
    createMock.mockResolvedValue({
      id: "staging-media-image",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/cms_image",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          folder: "staging/seven-seas-cms",
        }),
      })
    );
  });

  it("falls back to legacy fixed-folder metadata", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        asset_folder: undefined,
        folder: "staging/seven-seas-cms",
      })
    );
    createMock.mockResolvedValue({
      id: "staging-media-image",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/cms_image",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(200);
  });

  it("rejects resource type mismatch for cms_image", async () => {
    cloudinaryResourceMock.mockResolvedValue(cloudinaryAsset({
      resource_type: "video",
      format: "mp4",
      duration: 1,
      public_id: "staging/seven-seas-cms/cms_video",
      asset_id: "staging-asset-video",
      secure_url: "https://cdn.example.test/staging-video.mp4",
    }));

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/cms_video",
          purpose: "cms_image",
          original_filename: "profile.jpg",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid resource type",
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-cms/cms_video",
      {
        deliveryType: "upload",
        resourceType: "video",
      }
    );
  });

  it("rolls back only staging-owned uploads during validation failure", async () => {
    cloudinaryResourceMock.mockResolvedValue(cloudinaryAsset({
      asset_folder: "staging/seven-seas-news",
      public_id: "staging/seven-seas-news/news_image",
      asset_id: "staging-asset-image",
    }));

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-news/news_image",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Asset outside approved folder",
    });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-news/news_image",
      {
        deliveryType: "upload",
        resourceType: "image",
      }
    );
  });

  it("rejects missing Dynamic and legacy folder metadata", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        asset_folder: undefined,
        folder: undefined,
      })
    );

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/cms_image",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Asset outside approved folder",
    });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-cms/cms_image",
      {
        deliveryType: "upload",
        resourceType: "image",
      }
    );
  });

  it("rejects a malicious sibling public ID prefix", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        asset_folder: "staging/seven-seas-cms",
        public_id: "staging/seven-seas-cms-evil/file",
      })
    );

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms-evil/file",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Asset outside approved folder",
    });
    expect(deleteManagedAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-cms-evil/file",
      {
        deliveryType: "upload",
        resourceType: "image",
      }
    );
  });

  it("accepts nested public IDs only inside the approved path boundary", async () => {
    cloudinaryResourceMock.mockResolvedValue(
      cloudinaryAsset({
        public_id: "staging/seven-seas-cms/nested/file",
      })
    );
    createMock.mockResolvedValue({
      id: "staging-media-image",
    });

    const response = await POST(
      new Request("http://localhost/api/admin/media/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          public_id: "staging/seven-seas-cms/nested/file",
          purpose: "cms_image",
          original_filename: "hero.jpg",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(deleteManagedAssetMock).not.toHaveBeenCalled();
  });
});

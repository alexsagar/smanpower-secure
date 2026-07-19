import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, requirePermissionMock, generateUploadSignatureMock } =
  vi.hoisted(() => ({
    authMock: vi.fn(),
    requirePermissionMock: vi.fn(),
    generateUploadSignatureMock: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/permissions", () => ({
  requirePermission: requirePermissionMock,
}));

vi.mock("@/services/cloudinary.service", () => ({
  generateUploadSignature: generateUploadSignatureMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { GET } from "./route";

describe("Cloudinary signing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "admin-1" } });
    requirePermissionMock.mockResolvedValue({ id: "admin-1" });
    generateUploadSignatureMock.mockReturnValue({
      cloudName: "test-cloud",
      apiKey: "public-api-key",
      timestamp: 123,
      signature: "signed",
      folder: "seven-seas-cms",
      resourceType: "image",
      deliveryType: "upload",
    });
  });

  it("returns image resource type for cms_image without exposing the API secret", async () => {
    const response = await GET(
      new Request("http://localhost/api/admin/cloudinary/sign?purpose=cms_image")
    );

    expect(response.status).toBe(200);
    expect(generateUploadSignatureMock).toHaveBeenCalledWith(
      "seven-seas-cms",
      "upload",
      "image"
    );

    const body = await response.json();
    expect(body.resourceType).toBe("image");
    expect(body.resourceType).not.toBe("video");
    expect(body.apiKey).toBe("public-api-key");
    expect(body.apiSecret).toBeUndefined();
    expect(body.secret).toBeUndefined();
  });

  it("requires authentication and media permission", async () => {
    authMock.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/admin/cloudinary/sign?purpose=cms_image")
    );

    expect(response.status).toBe(401);
    expect(requirePermissionMock).not.toHaveBeenCalled();
  });
});

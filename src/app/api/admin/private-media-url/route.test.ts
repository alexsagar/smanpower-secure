import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requirePermissionMock,
  privateDownloadUrlMock,
  auditLogCreateMock,
  loggerWarnMock,
  loggerErrorMock,
} = vi.hoisted(() => ({
  requirePermissionMock: vi.fn(),
  privateDownloadUrlMock: vi.fn(),
  auditLogCreateMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  loggerErrorMock: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  requirePermission: requirePermissionMock,
  CANDIDATE_DOCUMENT_PERMISSIONS: { VIEW: "candidate_documents.view" },
}));

vi.mock("@/lib/cloudinary", () => ({
  default: {
    utils: {
      private_download_url: privateDownloadUrlMock,
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: auditLogCreateMock,
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: loggerWarnMock,
    error: loggerErrorMock,
  },
}));

describe("private media url route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue({ id: "admin-1" });
    privateDownloadUrlMock.mockReturnValue("https://signed.example.com/private.pdf");
    auditLogCreateMock.mockResolvedValue({});
    delete process.env.DEMO_MODE;
  });

  it("returns no-store headers and a signed url", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost:3000/api/admin/private-media-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ public_id: "private/doc", resource_type: "raw" }),
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, private");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    await expect(response.json()).resolves.toEqual({
      url: "https://signed.example.com/private.pdf",
    });
    expect(auditLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "admin-1",
          details: "Generated private media download URL",
        }),
      })
    );
  });

  it("returns a generic 500 without leaking internal errors", async () => {
    const { POST } = await import("./route");
    privateDownloadUrlMock.mockImplementationOnce(() => {
      throw new Error("cloudinary blew up");
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/private-media-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ public_id: "private/doc" }),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to generate URL",
    });
    expect(loggerErrorMock).toHaveBeenCalledOnce();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// We hoist mocks so they apply when the route module is imported.
vi.mock("@/lib/permissions", () => ({
  requirePermission: vi.fn(),
  CANDIDATE_DOCUMENT_PERMISSIONS: { VIEW: "candidate_documents.view" }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidateDocument: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() }
  }
}));

vi.mock("@/services/cloudinary.service", () => ({
  getSignedDocumentUrl: vi.fn()
}));

describe("Documents Integration Tests", () => {
  let GET: any;
  let requirePermissionMock: any;
  let mockPrisma: any;
  let getSignedDocumentUrlMock: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Dynamically import the route so it picks up the active mocks
    const routeModule = await import("../../src/app/api/documents/[id]/view/route");
    GET = routeModule.GET;
    
    const permissionsModule = await import("@/lib/permissions");
    requirePermissionMock = permissionsModule.requirePermission;
    requirePermissionMock.mockResolvedValue({ id: "user-123" });

    const prismaModule = await import("@/lib/prisma");
    mockPrisma = prismaModule.prisma;

    const cloudinaryModule = await import("@/services/cloudinary.service");
    getSignedDocumentUrlMock = cloudinaryModule.getSignedDocumentUrl;
    getSignedDocumentUrlMock.mockReturnValue("https://signed-url.example.com/test.pdf");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Denies access if document is PENDING_SCAN", async () => {
    mockPrisma.candidateDocument.findUnique.mockResolvedValue({
      id: "doc-1",
      status: "PENDING_SCAN",
      fileUrl: "https://res.cloudinary.com/demo/image/upload/v123/folder/file.pdf",
      candidate: { fullName: "Test Candidate" }
    });

    const req = new NextRequest("http://localhost:3000/api/documents/doc-1/view");
    const response = await GET(req, { params: Promise.resolve({ id: "doc-1" }) });

    expect(response.status).toBe(403);
    const text = await response.text();
    expect(text).toBe("Document is pending security scan or rejected.");
  });

  it("Allows access and sets security headers for SAFE document", async () => {
    mockPrisma.candidateDocument.findUnique.mockResolvedValue({
      id: "doc-1",
      status: "SAFE",
      fileUrl: "https://res.cloudinary.com/demo/image/upload/v123/folder/file.pdf",
      fileName: "file.pdf",
      candidate: { fullName: "Test Candidate" }
    });

    const req = new NextRequest("http://localhost:3000/api/documents/doc-1/view");
    const response = await GET(req, { params: Promise.resolve({ id: "doc-1" }) });

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("https://signed-url.example.com/test.pdf");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");

    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});

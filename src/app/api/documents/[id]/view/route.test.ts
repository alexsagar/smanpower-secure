import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  requirePermissionMock,
  candidateDocumentFindUniqueMock,
  auditLogCreateMock,
  getSignedDocumentUrlMock,
} = vi.hoisted(() => ({
  requirePermissionMock: vi.fn(),
  candidateDocumentFindUniqueMock: vi.fn(),
  auditLogCreateMock: vi.fn(),
  getSignedDocumentUrlMock: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  requirePermission: requirePermissionMock,
  CANDIDATE_DOCUMENT_PERMISSIONS: { VIEW: "candidate_documents.view" },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidateDocument: {
      findUnique: candidateDocumentFindUniqueMock,
    },
    auditLog: {
      create: auditLogCreateMock,
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
    getSignedDocumentUrl: getSignedDocumentUrlMock,
  };
});

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { GET } from "./route";

describe("candidate document view route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");
    requirePermissionMock.mockResolvedValue({ id: "admin-1" });
    auditLogCreateMock.mockResolvedValue({});
    getSignedDocumentUrlMock.mockReturnValue(
      "https://signed.example.com/document.pdf"
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps database-authorized legacy document urls readable", async () => {
    candidateDocumentFindUniqueMock.mockResolvedValue({
      id: "doc-1",
      status: "SAFE",
      fileName: "legacy.pdf",
      fileUrl:
        "https://res.cloudinary.com/demo/raw/private/v1720/seven-seas-candidates/legacy-doc.pdf",
      mimeType: "application/pdf",
      candidate: { id: "candidate-1" },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/documents/doc-1/view"),
      {
        params: Promise.resolve({ id: "doc-1" }),
      }
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://signed.example.com/document.pdf"
    );
    expect(getSignedDocumentUrlMock).toHaveBeenCalledWith(
      "seven-seas-candidates/legacy-doc",
      "pdf",
      {
        allowUnowned: true,
        resourceType: "raw",
      }
    );
  });

  it("signs staged candidate document public ids without url parsing", async () => {
    candidateDocumentFindUniqueMock.mockResolvedValue({
      id: "doc-2",
      status: "SAFE",
      fileName: "resume.pdf",
      fileUrl: "staging/seven-seas-candidates/folder/resume",
      mimeType: "application/pdf",
      candidate: { id: "candidate-1" },
    });

    await GET(
      new NextRequest("http://localhost/api/documents/doc-2/view"),
      {
        params: Promise.resolve({ id: "doc-2" }),
      }
    );

    expect(getSignedDocumentUrlMock).toHaveBeenCalledWith(
      "staging/seven-seas-candidates/folder/resume",
      "pdf",
      {
        allowUnowned: false,
        resourceType: "raw",
      }
    );
  });

  it("rejects malformed legacy urls", async () => {
    candidateDocumentFindUniqueMock.mockResolvedValue({
      id: "doc-3",
      status: "SAFE",
      fileName: "resume.pdf",
      fileUrl: "https://example.com/not-cloudinary.pdf",
      mimeType: "application/pdf",
      candidate: { id: "candidate-1" },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/documents/doc-3/view"),
      {
        params: Promise.resolve({ id: "doc-3" }),
      }
    );

    expect(response.status).toBe(500);
    expect(getSignedDocumentUrlMock).not.toHaveBeenCalled();
  });

  it("rejects direct legacy public ids in staging", async () => {
    candidateDocumentFindUniqueMock.mockResolvedValue({
      id: "doc-4",
      status: "SAFE",
      fileName: "resume.pdf",
      fileUrl: "seven-seas-candidates/legacy-doc",
      mimeType: "application/pdf",
      candidate: { id: "candidate-1" },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/documents/doc-4/view"),
      {
        params: Promise.resolve({ id: "doc-4" }),
      }
    );

    expect(response.status).toBe(500);
    expect(getSignedDocumentUrlMock).not.toHaveBeenCalled();
  });
});

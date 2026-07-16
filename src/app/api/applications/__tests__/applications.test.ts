import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ApplicationSubmissionService } from "@/services/applicationSubmission.service";

const {
  uploadBufferToCloudinaryMock,
  deletePrivateAssetMock,
  checkRateLimitMock,
  hashIpMock,
  hashUserAgentMock,
  verifyTurnstileTokenMock,
  resolveDocumentRequirementsMock,
  resolveCandidateMock,
  demandFindUniqueMock,
  candidateDocumentCreateMock,
  demandApplicationCreateMock,
} = vi.hoisted(() => ({
  uploadBufferToCloudinaryMock: vi.fn(),
  deletePrivateAssetMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
  hashIpMock: vi.fn(),
  hashUserAgentMock: vi.fn(),
  verifyTurnstileTokenMock: vi.fn(),
  resolveDocumentRequirementsMock: vi.fn(),
  resolveCandidateMock: vi.fn(),
  demandFindUniqueMock: vi.fn(),
  candidateDocumentCreateMock: vi.fn(),
  demandApplicationCreateMock: vi.fn(),
}));

vi.mock("@/services/cloudinary.service", () => ({
  uploadBufferToCloudinary: uploadBufferToCloudinaryMock,
  deletePrivateAsset: deletePrivateAssetMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/privacy", () => ({
  hashIp: hashIpMock,
  hashUserAgent: hashUserAgentMock,
}));

vi.mock("@/services/turnstile.service", () => ({
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock("@/lib/document-requirements", () => ({
  resolveDocumentRequirements: resolveDocumentRequirementsMock,
}));

vi.mock("@/lib/file-validation", () => ({
  validateCandidateFile: vi.fn().mockResolvedValue({ valid: true }),
}));

vi.mock("@/services/candidateMatching.service", () => ({
  CandidateMatchingService: {
    resolveCandidate: resolveCandidateMock,
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    candidateDocument: {
      create: candidateDocumentCreateMock,
    },
    demandApplication: {
      create: demandApplicationCreateMock,
    },
  };

  return {
    prisma: {
      demand: { findUnique: demandFindUniqueMock },
      $transaction: vi.fn(async (callback) => callback(tx)),
    },
  };
});

function buildPdfFile(name = "resume.pdf") {
  return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], name, {
    type: "application/pdf",
  });
}

function buildApplicationFormData() {
  const formData = new FormData();
  formData.append("demandId", "d-1");
  formData.append("positionId", "p-1");
  formData.append("fullName", "John Doe");
  formData.append("phone", "1234567890");
  formData.append("email", "john@example.com");
  formData.append("provinceDistrict", "Bagmati");
  formData.append("dateOfBirth", "1990-01-01");
  formData.append("educationLevel", "High School");
  formData.append("skillCategory", "IT");
  formData.append("workExperience", "2 years");
  formData.append("passportStatus", "VALID");
  formData.append("availableForInterview", "true");
  formData.append("demandDetailsRead", "true");
  formData.append("privacyConsentGiven", "true");
  formData.append("safetyAcknowledgement", "true");
  formData.append("cfTurnstileResponse", "VALID_MOCK_TOKEN");
  formData.append("cvFile", buildPdfFile());
  return formData;
}

describe("ApplicationSubmissionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TURNSTILE_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_ENABLED", "false");
    vi.stubEnv("PRIVACY_HASH_SECRET", "test-secret");

    checkRateLimitMock.mockResolvedValue({ success: true });
    hashIpMock.mockReturnValue("hashed-ip");
    hashUserAgentMock.mockReturnValue("hashed-ua");
    verifyTurnstileTokenMock.mockResolvedValue({ success: true });
    resolveDocumentRequirementsMock.mockResolvedValue([
      {
        documentType: "CV",
        required: true,
        maxSizeMb: 2,
        allowedMimeTypes: "application/pdf",
      },
    ]);
    resolveCandidateMock.mockResolvedValue({
      candidate: { id: "candidate-1" },
      isPossibleDuplicate: false,
    });
    uploadBufferToCloudinaryMock.mockResolvedValue({
      secureUrl: "https://cloudinary.example.com/staging/seven-seas-candidates/cv.pdf",
      publicId: "staging/seven-seas-candidates/candidate-cv",
      bytes: 1024,
      format: "pdf",
    });
    demandFindUniqueMock.mockResolvedValue({
      id: "d-1",
      title: "Demand Title",
      companyName: "Seven Seas",
      country: { name: "Nepal" },
      status: "PUBLISHED",
      enableApplication: true,
      positions: [{ id: "p-1", title: "Worker", status: "OPEN", isPublic: true }],
    });
    candidateDocumentCreateMock.mockResolvedValue({ id: "doc-1" });
    demandApplicationCreateMock.mockResolvedValue({ id: "app-1" });
    deletePrivateAssetMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unpublished demands", async () => {
    demandFindUniqueMock.mockResolvedValueOnce({
      id: "d-1",
      status: "DRAFT",
      enableApplication: true,
      positions: [{ id: "p-1", status: "OPEN", isPublic: true }],
    });

    const result = await ApplicationSubmissionService.submitApplication(
      buildApplicationFormData(),
      "127.0.0.1",
      "test-agent"
    );

    expect(result.success).toBe(false);
    expect(result.formError).toBe("CLOSED");
  });

  it("stores the uploaded candidate document public id", async () => {
    const result = await ApplicationSubmissionService.submitApplication(
      buildApplicationFormData(),
      "127.0.0.1",
      "test-agent"
    );

    expect(result.success).toBe(true);
    expect(candidateDocumentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileUrl: "staging/seven-seas-candidates/candidate-cv",
          fileName: "resume.pdf",
          isPrivate: true,
        }),
      })
    );
  });

  it("rejects a missing required candidate document", async () => {
    const formData = buildApplicationFormData();
    formData.delete("cvFile");

    const result = await ApplicationSubmissionService.submitApplication(
      formData,
      "127.0.0.1",
      "test-agent"
    );

    expect(result.success).toBe(false);
    expect(result.formError).toBe("MISSING_DOCUMENT");
    expect(uploadBufferToCloudinaryMock).not.toHaveBeenCalled();
  });

  it("rolls back uploaded documents when the transaction fails", async () => {
    demandApplicationCreateMock.mockRejectedValueOnce(
      Object.assign(new Error("db down"), { code: "P5000" })
    );

    const result = await ApplicationSubmissionService.submitApplication(
      buildApplicationFormData(),
      "127.0.0.1",
      "test-agent"
    );

    expect(result.success).toBe(false);
    expect(deletePrivateAssetMock).toHaveBeenCalledWith(
      "staging/seven-seas-candidates/candidate-cv"
    );
  });
});

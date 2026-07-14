import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  headersMock,
  getClientIpMock,
  checkRateLimitMock,
  verifyTurnstileTokenMock,
  hashIpMock,
  loggerErrorMock,
  findOpeningMock,
  createCareerApplicationMock,
  uploadBufferToCloudinaryMock,
} = vi.hoisted(() => ({
  headersMock: vi.fn(),
  getClientIpMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
  verifyTurnstileTokenMock: vi.fn(),
  hashIpMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  findOpeningMock: vi.fn(),
  createCareerApplicationMock: vi.fn(),
  uploadBufferToCloudinaryMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: getClientIpMock,
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/services/turnstile.service", () => ({
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock("@/lib/privacy", () => ({
  hashIp: hashIpMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

vi.mock("@/services/cloudinary.service", () => ({
  uploadBufferToCloudinary: uploadBufferToCloudinaryMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    careerOpening: {
      findUnique: findOpeningMock,
    },
    careerApplication: {
      create: createCareerApplicationMock,
    },
  },
}));

import { applyToCareerAction } from "./career-applications";

function buildPdfFile(name = "resume.pdf") {
  return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], name, {
    type: "application/pdf",
  });
}

function buildFormData() {
  const formData = new FormData();
  formData.set("careerOpeningId", "career-1");
  formData.set("fullName", "Alex Candidate");
  formData.set("phone", "+9779800000000");
  formData.set("email", "alex@example.com");
  formData.set("coverLetter", "Ready to work");
  formData.set("cf-turnstile-response", "turnstile-token");
  formData.set("cvFile", buildPdfFile());
  return formData;
}

describe("applyToCareerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers());
    getClientIpMock.mockReturnValue("203.0.113.9");
    checkRateLimitMock.mockResolvedValue({ success: true });
    verifyTurnstileTokenMock.mockResolvedValue({ success: true });
    hashIpMock.mockReturnValue("hashed-ip");
    findOpeningMock.mockResolvedValue({ id: "career-1", status: "OPEN" });
    uploadBufferToCloudinaryMock.mockResolvedValue({
      secureUrl: "https://cloudinary.example.com/resume.pdf",
    });
    createCareerApplicationMock.mockResolvedValue({ id: "app-1" });
  });

  it("stores a hashed ip instead of the raw client ip", async () => {
    const result = await applyToCareerAction(null, buildFormData());

    expect(result).toEqual({ success: true });
    expect(hashIpMock).toHaveBeenCalledWith("203.0.113.9");
    expect(createCareerApplicationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hashedIp: "hashed-ip",
        }),
      })
    );
    expect(createCareerApplicationMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hashedIp: "203.0.113.9",
        }),
      })
    );
  });

  it("returns a generic upload failure and logs server details privately", async () => {
    uploadBufferToCloudinaryMock.mockRejectedValueOnce(new Error("cloudinary down"));

    const result = await applyToCareerAction(null, buildFormData());

    expect(result).toEqual({
      success: false,
      formError: "UPLOAD_FAILED",
      message: "Failed to upload document. Please try again.",
    });
    expect(loggerErrorMock).toHaveBeenCalledOnce();
  });
});

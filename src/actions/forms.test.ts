import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  headersMock,
  checkRateLimitMock,
  getClientIpMock,
  verifyTurnstileTokenMock,
  sendEmailMock,
  employerLeadCreateMock,
  loggerWarnMock,
  loggerErrorMock,
} = vi.hoisted(() => ({
  headersMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
  getClientIpMock: vi.fn(),
  verifyTurnstileTokenMock: vi.fn(),
  sendEmailMock: vi.fn(),
  employerLeadCreateMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  loggerErrorMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: getClientIpMock,
}));

vi.mock("@/services/turnstile.service", () => ({
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock("@/services/email.service", () => ({
  sendEmail: sendEmailMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: loggerWarnMock,
    error: loggerErrorMock,
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    employerLead: {
      create: employerLeadCreateMock,
    },
  },
}));

import { submitEmployerLead } from "./forms";

function buildLeadFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const fields: Record<string, string> = {
    companyName: "Acme Workforce",
    contactPerson: "Jane Manager",
    designation: "HR Lead",
    businessEmail: "jane@acme.test",
    phone: "+9779800000000",
    country: "Qatar",
    industry: "Construction",
    workforceCategory: "Skilled",
    numberOfWorkers: "50",
    requiredSkills: "Welding",
    expectedMobilisation: "2026-08-01",
    message: "Need workers soon",
    consentGiven: "on",
    turnstileToken: "token-1",
    ...overrides,
  };

  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("submitEmployerLead", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    headersMock.mockReset();
    checkRateLimitMock.mockReset();
    getClientIpMock.mockReset();
    verifyTurnstileTokenMock.mockReset();
    sendEmailMock.mockReset();
    employerLeadCreateMock.mockReset();
    loggerWarnMock.mockReset();
    loggerErrorMock.mockReset();

    headersMock.mockResolvedValue(new Headers());
    getClientIpMock.mockReturnValue("127.0.0.1");
    checkRateLimitMock.mockResolvedValue({ success: true });
    verifyTurnstileTokenMock.mockResolvedValue({ success: true });
    employerLeadCreateMock.mockResolvedValue({ id: "lead-1" });
  });

  it("stores the lead and sends an admin notification when configured", async () => {
    vi.stubEnv("ADMIN_NOTIFICATION_EMAIL", "ops@smanpower.test");

    const result = await submitEmployerLead(
      { success: false },
      buildLeadFormData()
    );

    expect(result).toEqual({
      success: true,
      message:
        "Thank you for your enquiry. Our team will contact you within 2 business days.",
    });
    expect(employerLeadCreateMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ops@smanpower.test",
        replyTo: "jane@acme.test",
        subject: "New workforce request from Acme Workforce",
      })
    );
  });

  it("logs and preserves success when notification delivery fails after persistence", async () => {
    vi.stubEnv("ADMIN_NOTIFICATION_EMAIL", "ops@smanpower.test");
    sendEmailMock.mockRejectedValue(new Error("mail down"));

    const result = await submitEmployerLead(
      { success: false },
      buildLeadFormData()
    );

    expect(result.success).toBe(true);
    expect(employerLeadCreateMock).toHaveBeenCalledTimes(1);
    expect(loggerErrorMock).toHaveBeenCalledWith(
      "Employer lead notification failed after persistence",
      expect.any(Error)
    );
  });

  it("skips notification and logs a warning when no recipient is configured", async () => {
    const result = await submitEmployerLead(
      { success: false },
      buildLeadFormData()
    );

    expect(result.success).toBe(true);
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(loggerWarnMock).toHaveBeenCalledWith(
      "Employer lead notification skipped: no admin notification recipient configured."
    );
  });

  it("returns validation errors for invalid input", async () => {
    const result = await submitEmployerLead(
      { success: false },
      buildLeadFormData({
        companyName: "",
        businessEmail: "not-an-email",
      })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.companyName).toBeDefined();
    expect(result.errors?.businessEmail).toBeDefined();
    expect(employerLeadCreateMock).not.toHaveBeenCalled();
  });

  it("returns a generic error when persistence fails and does not fake success", async () => {
    employerLeadCreateMock.mockRejectedValue(new Error("db down"));

    const result = await submitEmployerLead(
      { success: false },
      buildLeadFormData()
    );

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again or contact us directly.",
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalledWith(
      "Failed to submit employer lead",
      expect.any(Error)
    );
  });
});

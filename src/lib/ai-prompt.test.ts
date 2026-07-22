import { describe, it, expect } from "vitest";
import { validateHttps, normalizeCompanyUrl, buildAiSummaryPrompt, generateAiServiceUrl, getOrderedServices } from "./ai-prompt";
import type { CmsAiSummarySettings } from "@/types/content";

describe("AI Prompt Utilities", () => {
  describe("validateHttps", () => {
    it("returns true for valid https URL", () => {
      expect(validateHttps("https://smanpower.com")).toBe(true);
      expect(validateHttps("https://www.google.com/path")).toBe(true);
    });

    it("returns false for non-https URLs", () => {
      expect(validateHttps("http://smanpower.com")).toBe(false);
      expect(validateHttps("ftp://smanpower.com")).toBe(false);
      expect(validateHttps("smanpower.com")).toBe(false);
    });

    it("returns false for URLs with credentials", () => {
      expect(validateHttps("https://user:pass@smanpower.com")).toBe(false);
    });
  });

  describe("normalizeCompanyUrl", () => {
    it("returns normalized URL without query params or fragments", () => {
      expect(normalizeCompanyUrl("https://smanpower.com/?foo=bar#section")).toBe("https://smanpower.com/");
      expect(normalizeCompanyUrl("https://smanpower.com/about?test=1")).toBe("https://smanpower.com/about/");
    });

    it("falls back to default if invalid", () => {
      expect(normalizeCompanyUrl("http://smanpower.com")).toBe("https://smanpower.com/");
    });
  });

  describe("buildAiSummaryPrompt", () => {
    it("combines prompt and URL", () => {
      const result = buildAiSummaryPrompt("Please summarize", "https://smanpower.com");
      expect(result).toBe("Please summarize\n\nCompany Website: https://smanpower.com/");
    });

    it("truncates prompt if over 1000 characters", () => {
      const longPrompt = "A".repeat(1500);
      const result = buildAiSummaryPrompt(longPrompt, "https://smanpower.com");
      expect(result.length).toBeLessThan(1100);
      expect(result).toContain("...");
    });
  });

  describe("generateAiServiceUrl", () => {
    it("generates prefilled link for chatgpt", () => {
      const url = generateAiServiceUrl("chatgpt", "test prompt");
      expect(url).toBe("https://chatgpt.com/?q=test+prompt");
    });

    it("generates prefilled link for gemini", () => {
      const url = generateAiServiceUrl("gemini", "test prompt");
      expect(url).toBe("https://www.google.com/search?udm=50&aep=11&q=test+prompt");
    });
  });

  describe("getOrderedServices", () => {
    it("filters disabled and orders by order property", () => {
      const config: CmsAiSummarySettings = {
        heading: "Test",
        companyUrl: "https://smanpower.com",
        basePrompt: "Test prompt",
        services: [
          { id: "gemini", enabled: true, order: 2 },
          { id: "chatgpt", enabled: true, order: 1 },
          { id: "claude", enabled: false, order: 3 },
        ],
      };
      
      const services = getOrderedServices(config);
      expect(services.length).toBe(2);
      expect(services[0].id).toBe("chatgpt");
      expect(services[0].behavior).toBe("prefilled-link");
      expect(services[1].id).toBe("gemini");
    });
  });
});

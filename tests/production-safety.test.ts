import { describe, it, expect } from "vitest";
import {
  validateGitState,
  validateEnvLocal,
  validateAppEnvironment,
  validateDatabaseIdentity,
  getDbIdentity,
  APPROVED_PROD_DB_HASHES,
  KNOWN_DEV_DB_HASH,
  validateContentCounts,
  validateArtifactHtml,
} from "../scripts/deployment-safety-common.mjs";

describe("Production Deployment Safety Hardening Tests", () => {
  describe("Git Branch & State Guard", () => {
    it("fails when current branch is 'dev'", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "dev",
          isDirty: false,
          localHead: "abc1234",
          remoteHead: "abc1234",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Production release MUST be on 'main'");
    });

    it("fails when current branch is 'staging'", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "staging",
          isDirty: false,
          localHead: "abc1234",
          remoteHead: "abc1234",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Production release MUST be on 'main'");
    });

    it("fails when working tree is dirty", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "main",
          isDirty: true,
          localHead: "abc1234",
          remoteHead: "abc1234",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Working tree is dirty");
    });

    it("fails when local main differs from origin/main", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "main",
          isDirty: false,
          localHead: "abc1234",
          remoteHead: "xyz9876",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match origin/main");
    });

    it("fails when local main has unpushed commits", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "main",
          isDirty: false,
          localHead: "abc1234",
          remoteHead: "abc1234",
          unpushedCount: 2,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("unpushed commits");
    });

    it("passes when branch is 'main', clean, and matches origin/main", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "main",
          isDirty: false,
          localHead: "abc1234",
          remoteHead: "abc1234",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(true);
    });
  });

  describe(".env.local Defense Guard", () => {
    it("fails when .env.local contains DATABASE_URL", () => {
      const mockContent = `
# Local test
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
SOME_OTHER_KEY="value"
`;
      const result = validateEnvLocal({ mockEnvLocalContent: mockContent });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("contains production-critical variables");
      expect(result.error).toContain("DATABASE_URL");
    });

    it("fails when .env.local contains APP_ENV or DEMO_MODE", () => {
      const mockContent = `
APP_ENV=local
DEMO_MODE=true
`;
      const result = validateEnvLocal({ mockEnvLocalContent: mockContent });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("APP_ENV");
      expect(result.error).toContain("DEMO_MODE");
    });

    it("passes when .env.local does not exist", () => {
      const result = validateEnvLocal({ mockEnvLocalContent: null });
      expect(result.valid).toBe(true);
    });

    it("passes when .env.local contains only non-critical variables", () => {
      const mockContent = `
DEBUG_TOOLS=true
LOCAL_PORT=3000
`;
      const result = validateEnvLocal({ mockEnvLocalContent: mockContent });
      expect(result.valid).toBe(true);
    });
  });

  describe("Database Identity & Fingerprint Guard", () => {
    it("fails when database is the development database (ep-rough-butterfly)", () => {
      const devDbUrl =
        "postgresql://user:secret@ep-rough-butterfly-aoa7977k-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(devDbUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("resolves to the DEVELOPMENT database");
      expect(result.error).toContain("Build ABORTED");
    });

    it("fails when database is an unknown or foreign database", () => {
      const unknownDbUrl =
        "postgresql://user:secret@ep-random-host-12345.c-2.ap-southeast-1.aws.neon.tech/neondb";
      const result = validateDatabaseIdentity(unknownDbUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match approved production databases");
    });

    it("fails when database URL is malformed or empty", () => {
      const result = validateDatabaseIdentity("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("missing or not a string");
    });

    it("passes when database URL matches approved production pooled database", () => {
      const prodPooledUrl =
        "postgresql://user:secret@ep-steep-wave-ao8565zn-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(prodPooledUrl);
      expect(result.valid).toBe(true);
      expect(result.host).toBe(
        "ep-steep-wave-ao8565zn-pooler.c-2.ap-southeast-1.aws.neon.tech"
      );
    });

    it("passes when database URL matches approved production direct database", () => {
      const prodDirectUrl =
        "postgresql://user:secret@ep-steep-wave-ao8565zn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(prodDirectUrl);
      expect(result.valid).toBe(true);
      expect(result.host).toBe(
        "ep-steep-wave-ao8565zn.c-2.ap-southeast-1.aws.neon.tech"
      );
    });
  });

  describe("Application Environment Guard", () => {
    it("fails when DEMO_MODE is true", () => {
      const env = {
        APP_ENV: "production",
        DEMO_MODE: "true",
        QA_MODE: "false",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      };
      const result = validateAppEnvironment(env);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("DEMO_MODE is \"true\", expected \"false\"");
    });

    it("fails when QA_MODE is true", () => {
      const env = {
        APP_ENV: "production",
        DEMO_MODE: "false",
        QA_MODE: "true",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      };
      const result = validateAppEnvironment(env);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("QA_MODE is \"true\", expected \"false\"");
    });

    it("fails when APP_ENV is 'local' or 'staging'", () => {
      const env = {
        APP_ENV: "local",
        DEMO_MODE: "false",
        QA_MODE: "false",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      };
      const result = validateAppEnvironment(env);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("APP_ENV is \"local\", expected \"production\"");
    });

    it("fails when SITE_URL is not https://smanpower.com", () => {
      const env = {
        APP_ENV: "production",
        DEMO_MODE: "false",
        QA_MODE: "false",
        SITE_URL: "http://localhost:3000",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      };
      const result = validateAppEnvironment(env);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("SITE_URL");
    });

    it("passes when all environment variables strictly match production requirements", () => {
      const env = {
        APP_ENV: "production",
        DEMO_MODE: "false",
        QA_MODE: "false",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      };
      const result = validateAppEnvironment(env);
      expect(result.valid).toBe(true);
    });
  });

  describe("Content Sanity Gate Logic", () => {
    it("fails when news count is 0 (simulating old July snapshot)", () => {
      const counts = {
        newsCount: 0,
        demandCount: 4,
        pageCount: 59,
        recentInsightCount: 3,
        mediaCount: 143,
      };
      const result = validateContentCounts(counts);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("NewsArticle count is 0"))).toBe(true);
    });

    it("fails when demands count is < 3 (simulating old July snapshot with 2 demands)", () => {
      const counts = {
        newsCount: 4,
        demandCount: 2,
        pageCount: 59,
        recentInsightCount: 3,
        mediaCount: 143,
      };
      const result = validateContentCounts(counts);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Demand count is 2"))).toBe(true);
    });

    it("fails when no insights were updated after August 2026", () => {
      const counts = {
        newsCount: 4,
        demandCount: 4,
        pageCount: 59,
        recentInsightCount: 0,
        mediaCount: 143,
      };
      const result = validateContentCounts(counts);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Zero insights updated after August 2026"))).toBe(true);
    });

    it("fails when media count is < 140 (simulating old July snapshot with 139 assets)", () => {
      const counts = {
        newsCount: 4,
        demandCount: 4,
        pageCount: 59,
        recentInsightCount: 3,
        mediaCount: 139,
      };
      const result = validateContentCounts(counts);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("MediaAsset count is 139"))).toBe(true);
    });

    it("passes when all production content counts meet or exceed live thresholds", () => {
      const counts = {
        newsCount: 4,
        demandCount: 4,
        pageCount: 59,
        recentInsightCount: 3,
        mediaCount: 143,
      };
      const result = validateContentCounts(counts);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Compiled Artifact HTML Verification Logic", () => {
    it("fails when homepage HTML is missing Google Translate", () => {
      const html = `<html><head><title>Overseas Recruitment Agency in Nepal | Seven Seas Intercontinental</title></head><body><script type="application/ld+json">{"@type":"Organization"}</script></body></html>`;
      const result = validateArtifactHtml(html, "homepage");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Google Translate"))).toBe(true);
    });

    it("fails when insight HTML contains leaked <title>OpenAI</title>", () => {
      const html = `<html><head><title>OpenAI</title><link rel="canonical" href="https://smanpower.com/insights/slug" /></head><body><article>Content</article><script type="application/ld+json">{"@type":"BlogPosting"}</script></body></html>`;
      const result = validateArtifactHtml(html, "insight");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("leaked SVG <title>OpenAI</title>"))).toBe(true);
    });

    it("fails when insight HTML contains SSR crash fallback skeleton (data-dgst)", () => {
      const html = `<html><head><title>Insight Title | Seven Seas</title><link rel="canonical" href="https://smanpower.com/insights/slug" /></head><body><div data-dgst="BAILOUT_SUSPENSE"></div><script type="application/ld+json">{"@type":"BlogPosting"}</script></body></html>`;
      const result = validateArtifactHtml(html, "insight");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("SSR crash fallback skeleton"))).toBe(true);
    });

    it("fails when homepage HTML contains leaked localhost reference", () => {
      const html = `<html><head><title>Overseas Recruitment Agency in Nepal | Seven Seas Intercontinental</title><link rel="canonical" href="http://localhost:3000" /></head><body><div id="google_translate_element"></div><script type="application/ld+json">{"@type":"Organization"}</script></body></html>`;
      const result = validateArtifactHtml(html, "homepage");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("leaked localhost or 127.0.0.1"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Homepage canonical does not use production apex"))).toBe(true);
    });

    it("fails when insight HTML contains leaked localhost canonical", () => {
      const html = `<html><head><title>Insight Title | Seven Seas</title><link rel="canonical" href="http://localhost:3000/insights/slug" /></head><body><article><h1>Full Article Body</h1></article><script type="application/ld+json">{"@type":"BlogPosting"}</script></body></html>`;
      const result = validateArtifactHtml(html, "insight");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("leaked localhost or 127.0.0.1"))).toBe(true);
    });

    it("passes when homepage HTML contains valid production canonical, Google Translate, and schema", () => {
      const html = `<html><head><title>Overseas Recruitment Agency in Nepal | Seven Seas Intercontinental</title><link rel="canonical" href="https://smanpower.com" /></head><body><div id="google_translate_element"></div><script type="application/ld+json">{"@type":"Organization"}</script></body></html>`;
      const result = validateArtifactHtml(html, "homepage");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("passes when insight HTML contains full article, canonical, and schema without leaks", () => {
      const html = `<html><head><title>Insight Title | Seven Seas</title><link rel="canonical" href="https://smanpower.com/insights/slug" /></head><body><article><h1>Full Article Body</h1></article><script type="application/ld+json">{"@type":"BlogPosting"}</script></body></html>`;
      const result = validateArtifactHtml(html, "insight");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

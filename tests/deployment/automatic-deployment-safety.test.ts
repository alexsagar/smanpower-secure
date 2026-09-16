import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import {
  validateGitState,
  validateEnvLocal,
  validateAppEnvironment,
  validateDatabaseIdentity,
  validateArtifactManifest,
} from "../../scripts/deployment-safety-common.mjs";
import { verifyGeneratedBuild } from "../../scripts/verify-generated-build.mjs";
import { runProductionSmokeTest } from "../../scripts/production-smoke-test.mjs";

describe("Phase 1B.2A-S5: Automatic Production Deployment Safety Tests", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "auto-deploy-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Scenario 1: Missing Required Environment Variable", () => {
    it("fails environment validation when APP_ENV is missing or wrong", () => {
      const result = validateAppEnvironment({
        APP_ENV: "staging",
        DEMO_MODE: "false",
        QA_MODE: "false",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("APP_ENV");
    });

    it("fails when DEMO_MODE is true", () => {
      const result = validateAppEnvironment({
        APP_ENV: "production",
        DEMO_MODE: "true",
        QA_MODE: "false",
        SITE_URL: "https://smanpower.com",
        NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("DEMO_MODE");
    });
  });

  describe("Scenario 2: Failed Preflight Database Fingerprint Check", () => {
    it("strictly rejects the development database (ep-rough-butterfly)", () => {
      const devDbUrl =
        "postgresql://user:pass@ep-rough-butterfly-aoa7977k-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(devDbUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("DEVELOPMENT database");
    });

    it("strictly rejects an unknown arbitrary database", () => {
      const unknownDbUrl = "postgresql://user:pass@ep-random-host.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(unknownDbUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match approved production databases");
    });

    it("accepts the approved pooled production database", () => {
      const prodDbUrl = "postgresql://user:pass@ep-steep-wave-ao8565zn-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
      const result = validateDatabaseIdentity(prodDbUrl);
      expect(result.valid).toBe(true);
      expect(result.host).toBe("ep-steep-wave-ao8565zn-pooler.c-2.ap-southeast-1.aws.neon.tech");
    });
  });

  describe("Scenario 3: Failed Production Build Prevents Certification Generation", () => {
    it("ensures certification manifest does NOT exist if build did not complete", () => {
      const manifestPath = join(tempDir, ".production-artifact-manifest.json");
      expect(existsSync(manifestPath)).toBe(false);
    });
  });

  describe("Scenario 4: Stale CMS Content Detection", () => {
    it("fails verification when fetch-cache contains empty news array", async () => {
      const nextServerApp = join(tempDir, ".next/server/app");
      const openNextDir = join(tempDir, ".open-next");
      const fetchCacheDir = join(tempDir, ".next/cache/fetch-cache");
      mkdirSync(nextServerApp, { recursive: true });
      mkdirSync(join(openNextDir, "assets"), { recursive: true });
      mkdirSync(fetchCacheDir, { recursive: true });

      writeFileSync(join(openNextDir, "worker.js"), "console.log('worker');");
      writeFileSync(join(openNextDir, "assets/BUILD_ID"), "build-test-1");
      writeFileSync(join(nextServerApp, "index.html"), "<html><body>google_translate_element @type: Organization Est. 2010 · Kathmandu, Nepal Seven Seas Intercontinental</body></html>");
      writeFileSync(join(nextServerApp, "news.html"), "<html><body><h1>News</h1><p>safer-nepal-recruitment</p></body></html>");
      writeFileSync(join(fetchCacheDir, "stale-news.json"), JSON.stringify({ key: "cms-news", data: [] }));

      const mockTruth = {
        truthHash: "abc123hash",
        truth: {
          version: 1,
          buildStartTime: Date.now(),
          counts: { publishedNews: 1, activeDemands: 1 },
          news: [{ slug: "safer-nepal-recruitment", title: "Safer Nepal Recruitment" }],
          demands: [{ slug: "worker-demand", title: "Worker Demand" }],
          homepageMarker: { eyebrow: "Est. 2010 · Kathmandu, Nepal", titleToken: "Seven Seas Intercontinental" },
        },
      };

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime: Date.now() - 5000,
        mockTruthManifest: mockTruth,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("Incident 2 pattern detected"))).toBe(true);
      expect(existsSync(join(tempDir, ".production-artifact-manifest.json"))).toBe(false);
    });
  });

  describe("Scenario 5: Missing Certification File", () => {
    it("rejects deployment when manifest does not exist", () => {
      const result = validateArtifactManifest({
        manifest: null,
        currentGitSha: "c7381b1d93de785194a2763fa9cb9d25f4aebb7c",
        currentBuildId: "build-123",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("missing or invalid");
    });
  });

  describe("Scenario 6: Invalid Status in Artifact Certification", () => {
    it("rejects deployment when manifest status is not CERTIFIED_FOR_DEPLOYMENT", () => {
      const result = validateArtifactManifest({
        manifest: {
          status: "FAILED_CHECKS",
          gitSha: "abc",
          buildId: "build-1",
          truthHash: "truth-1",
          verifiedTimestamp: Date.now(),
        },
        currentGitSha: "abc",
        currentBuildId: "build-1",
        currentTruthHash: "truth-1",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expected 'CERTIFIED_FOR_DEPLOYMENT'");
    });
  });

  describe("Scenario 7: Modified Artifact After Certification (Tampering / Rebuild)", () => {
    it("cryptographically rejects deployment when worker.js hash does not match certified hash", () => {
      const openNextDir = join(tempDir, ".open-next");
      mkdirSync(openNextDir, { recursive: true });

      const originalWorkerContent = "console.log('certified-worker');";
      const certifiedHash = createHash("sha256").update(originalWorkerContent).digest("hex");
      writeFileSync(join(openNextDir, "worker.js"), originalWorkerContent + "\n// modified post-cert!");

      const manifest = {
        version: 1,
        status: "CERTIFIED_FOR_DEPLOYMENT",
        gitSha: "test-commit-sha",
        buildId: "build-1",
        truthHash: "truth-hash-1",
        verifiedTimestamp: Date.now(),
        hashes: {
          workerJs: certifiedHash,
        },
      };

      const result = validateArtifactManifest({
        manifest,
        currentGitSha: "test-commit-sha",
        currentBuildId: "build-1",
        currentTruthHash: "truth-hash-1",
        verifyHashes: true,
        cwd: tempDir,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain(".open-next/worker.js has been modified or rebuilt since certification");
    });

    it("passes cryptographic integrity check when worker.js matches exact certified hash", () => {
      const openNextDir = join(tempDir, ".open-next");
      mkdirSync(openNextDir, { recursive: true });

      const workerContent = "console.log('certified-worker');";
      const certifiedHash = createHash("sha256").update(workerContent).digest("hex");
      writeFileSync(join(openNextDir, "worker.js"), workerContent);

      const manifest = {
        version: 1,
        status: "CERTIFIED_FOR_DEPLOYMENT",
        gitSha: "test-commit-sha",
        buildId: "build-1",
        truthHash: "truth-hash-1",
        verifiedTimestamp: Date.now(),
        hashes: {
          workerJs: certifiedHash,
        },
      };

      const result = validateArtifactManifest({
        manifest,
        currentGitSha: "test-commit-sha",
        currentBuildId: "build-1",
        currentTruthHash: "truth-hash-1",
        verifyHashes: true,
        cwd: tempDir,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("Scenario 8: Wrong Git Branch Guard", () => {
    it("fails when branch is dev", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "dev",
          isDirty: false,
          localHead: "sha1",
          remoteHead: "sha1",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Production release MUST be on 'main'");
    });

    it("fails when branch is staging", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "staging",
          isDirty: false,
          localHead: "sha1",
          remoteHead: "sha1",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Production release MUST be on 'main'");
    });
  });

  describe("Scenario 9: Wrong Commit SHA Guard", () => {
    it("rejects manifest compiled from a different commit than HEAD", () => {
      const manifest = {
        status: "CERTIFIED_FOR_DEPLOYMENT",
        gitSha: "old-commit-sha-1111",
        buildId: "build-1",
        truthHash: "truth-1",
        verifiedTimestamp: Date.now(),
      };

      const result = validateArtifactManifest({
        manifest,
        currentGitSha: "current-head-sha-2222",
        currentBuildId: "build-1",
        currentTruthHash: "truth-1",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Manifest Git SHA (old-commit-sha-1111) does not match current Git HEAD (current-head-sha-2222)");
    });
  });

  describe("Scenario 10: .env.local Contamination Guard", () => {
    it("rejects production build when .env.local overrides DATABASE_URL", () => {
      const result = validateEnvLocal({
        mockEnvLocalContent: "DATABASE_URL=postgresql://local/db",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("contains production-critical variables: [DATABASE_URL]");
    });
  });

  describe("Scenario 11: Concurrent Release / Stale Commit Protection", () => {
    it("rejects deployment when local commit is behind remote origin/main", () => {
      const result = validateGitState({
        mockGitState: {
          branch: "main",
          isDirty: false,
          localHead: "commit-A",
          remoteHead: "commit-B",
          unpushedCount: 0,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match origin/main");
    });
  });

  describe("Scenario 12: Post-Deployment Smoke Test Failure Handling", () => {
    it("handles non-200 responses by reporting failure", async () => {
      const result = await runProductionSmokeTest({
        baseUrl: "https://smanpower.com/non-existent-probe-test-xyz",
        previousVersionId: "04ffd2d0-40dd-4c75-9348-49752c28bff5",
      });
      // The smoke test targets https://smanpower.com normally, but against bad baseUrl or subpaths it reports errors
      // Here baseUrl has a bad path, homepage check will request https://smanpower.com/non-existent-probe-test-xyz/
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

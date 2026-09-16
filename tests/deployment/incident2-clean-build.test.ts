import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, utimesSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { cleanBuildDirectories, verifyCleanBuildState } from "../../scripts/clean-build-isolation.mjs";
import { verifyGeneratedBuild } from "../../scripts/verify-generated-build.mjs";
import { validateArtifactManifest } from "../../scripts/deployment-safety-common.mjs";

describe("Production Incident 2 Regression & Clean Build Isolation Tests", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "incident2-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Pre-Build Artifact Purge & Clean Guard", () => {
    it("successfully cleans .next, .open-next, .wrangler, and manifest files", () => {
      // Setup dirty build artifacts
      const nextDir = join(tempDir, ".next");
      const openNextDir = join(tempDir, ".open-next");
      const wranglerDir = join(tempDir, ".wrangler");
      const truthFile = join(tempDir, ".production-build-truth.json");
      const manifestFile = join(tempDir, ".production-artifact-manifest.json");

      mkdirSync(join(nextDir, "cache/fetch-cache"), { recursive: true });
      writeFileSync(join(nextDir, "cache/fetch-cache/stale.json"), "{}");
      mkdirSync(openNextDir, { recursive: true });
      mkdirSync(wranglerDir, { recursive: true });
      writeFileSync(truthFile, "{}");
      writeFileSync(manifestFile, "{}");

      expect(existsSync(nextDir)).toBe(true);
      expect(existsSync(openNextDir)).toBe(true);
      expect(existsSync(wranglerDir)).toBe(true);

      // Execute clean
      cleanBuildDirectories({ cwd: tempDir });

      expect(existsSync(nextDir)).toBe(false);
      expect(existsSync(openNextDir)).toBe(false);
      expect(existsSync(wranglerDir)).toBe(false);
      expect(existsSync(truthFile)).toBe(false);
      expect(existsSync(manifestFile)).toBe(false);

      const guard = verifyCleanBuildState({ cwd: tempDir });
      expect(guard.success).toBe(true);
      expect(guard.errors).toHaveLength(0);
    });

    it("fails clean guard when .next exists before build", () => {
      mkdirSync(join(tempDir, ".next"), { recursive: true });
      const result = verifyCleanBuildState({ cwd: tempDir });
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes(".NEXT EXISTS"))).toBe(true);
    });

    it("fails clean guard when .open-next exists before build", () => {
      mkdirSync(join(tempDir, ".open-next"), { recursive: true });
      const result = verifyCleanBuildState({ cwd: tempDir });
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes(".OPEN-NEXT EXISTS"))).toBe(true);
    });

    it("fails clean guard when .wrangler exists before build", () => {
      mkdirSync(join(tempDir, ".wrangler"), { recursive: true });
      const result = verifyCleanBuildState({ cwd: tempDir });
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes(".WRANGLER EXISTS"))).toBe(true);
    });
  });

  describe("Content-Truth Verification (Incident 2 Regression)", () => {
    const mockTruthManifest = {
      truthHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      truth: {
        version: 1,
        buildStartTime: Date.now(),
        counts: {
          publishedNews: 2,
          activeDemands: 1,
        },
        news: [
          { slug: "ilo-protection-migrant-workers", title: "ILO Standards for Migrant Workers" },
          { slug: "safer-nepal-recruitment", title: "Safer Recruitment in Nepal" },
        ],
        demands: [
          { slug: "job-vacancy-kuwait", title: "General Worker Kuwait" },
        ],
        homepageMarker: {
          eyebrow: "Est. 2010 · Kathmandu, Nepal",
          titleToken: "Seven Seas Intercontinental",
        },
        leadershipMarker: {
          name: "Devendra Bajgai",
        },
        insightMarker: {
          slug: "choose-manpower-agency-in-nepal",
          title: "How to Choose the Right Manpower Agency in Nepal",
        },
      },
    };

    function setupMockBuild(dir: string, overrides: {
      newsHtml?: string;
      demandsHtml?: string;
      homeHtml?: string;
      fetchCachePayload?: string;
      fetchCacheMtimeOffsetMs?: number;
    } = {}) {
      const buildId = "test-build-123";
      const openNextDir = join(dir, ".open-next");
      const assetsDir = join(openNextDir, "assets");
      const cacheDir = join(openNextDir, "cache", buildId);
      const nextServerApp = join(dir, ".next/server/app");
      const fetchCacheDir = join(dir, ".next/cache/fetch-cache");

      mkdirSync(assetsDir, { recursive: true });
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(join(cacheDir, "news.cache"), JSON.stringify({ html: "" }));
      mkdirSync(join(nextServerApp, "insights"), { recursive: true });
      mkdirSync(fetchCacheDir, { recursive: true });

      writeFileSync(join(openNextDir, "worker.js"), "export default {};");
      writeFileSync(join(assetsDir, "BUILD_ID"), buildId);

      // Homepage HTML
      const defaultHome = `
        <html>
          <head><title>Overseas Recruitment | Seven Seas Intercontinental</title></head>
          <body>
            <div id="google_translate_element"></div>
            <div>Est. 2010 · Kathmandu, Nepal</div>
            <script type="application/ld+json">{"@type":"Organization"}</script>
          </body>
        </html>
      `;
      writeFileSync(join(nextServerApp, "index.html"), overrides.homeHtml ?? defaultHome);

      // News HTML
      const defaultNews = `
        <html>
          <body>
            <h1>Latest News</h1>
            <a href="/news/ilo-protection-migrant-workers">ILO Standards for Migrant Workers</a>
            <a href="/news/safer-nepal-recruitment">Safer Recruitment in Nepal</a>
          </body>
        </html>
      `;
      writeFileSync(join(nextServerApp, "news.html"), overrides.newsHtml ?? defaultNews);

      // Demands HTML
      const defaultDemands = `
        <html>
          <body>
            <h1>Current Demands</h1>
            <a href="/demands/job-vacancy-kuwait">General Worker Kuwait</a>
          </body>
        </html>
      `;
      writeFileSync(join(nextServerApp, "demands.html"), overrides.demandsHtml ?? defaultDemands);

      // About HTML
      writeFileSync(join(nextServerApp, "about.html"), "<html><body>Devendra Bajgai - Managing Director</body></html>");

      // Insight HTML
      writeFileSync(
        join(nextServerApp, "insights/choose-manpower-agency-in-nepal.html"),
        `<html><body><article>Article Body</article><script type="application/ld+json">{"@type":"BlogPosting"}</script></body></html>`
      );

      // Fetch cache entry
      const fetchPayload = overrides.fetchCachePayload ?? JSON.stringify({
        kind: "FETCH",
        data: { tags: ["cms-news"], value: [{ title: "ILO Standards" }] },
      });
      const fetchFile = join(fetchCacheDir, "test-entry.json");
      writeFileSync(fetchFile, fetchPayload);

      if (overrides.fetchCacheMtimeOffsetMs !== undefined) {
        const targetTime = (Date.now() + overrides.fetchCacheMtimeOffsetMs) / 1000;
        utimesSync(fetchFile, targetTime, targetTime);
      }
    }

    it("fails verification when news contains 'No news' (Incident 2 reproduction)", async () => {
      setupMockBuild(tempDir, {
        newsHtml: "<html><body><p>No news articles found at this time.</p></body></html>",
      });

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime: Date.now(),
        mockTruthManifest,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("No news"))).toBe(true);
      expect(existsSync(join(tempDir, ".production-artifact-manifest.json"))).toBe(false);
    });

    it("fails verification when news HTML is missing an authoritative article from truth manifest", async () => {
      // News has 1 of the 2 articles
      setupMockBuild(tempDir, {
        newsHtml: `<html><body><a href="/news/ilo-protection-migrant-workers">ILO Standards</a></body></html>`,
      });

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime: Date.now(),
        mockTruthManifest,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("safer-nepal-recruitment"))).toBe(true);
    });

    it("fails verification when fetch-cache contains stale mtime from before build started", async () => {
      const buildStartTime = Date.now();
      setupMockBuild(tempDir, {
        // File modified 30 minutes before build start
        fetchCacheMtimeOffsetMs: -1800000,
      });

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime,
        mockTruthManifest,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("stale fetch-cache entries"))).toBe(true);
    });

    it("fails verification when fetch-cache contains empty cms-news array (Incident 2 root cause)", async () => {
      setupMockBuild(tempDir, {
        fetchCachePayload: JSON.stringify({
          tags: ["cms-news"],
          data: [],
        }),
      });

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime: Date.now(),
        mockTruthManifest,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("cms-news: []"))).toBe(true);
    });

    it("fails verification when sitemap contains stale July demand slug", async () => {
      setupMockBuild(tempDir);
      writeFileSync(
        join(tempDir, ".next/server/app/sitemap.xml.body"),
        `<urlset><url><loc>https://smanpower.com/demands/tbt-precast-sdn-bhd</loc></url><url><loc>https://smanpower.com/news/ilo-protection-migrant-workers</loc></url><url><loc>https://smanpower.com/news/safer-nepal-recruitment</loc></url></urlset>`
      );

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime: Date.now() - 5000,
        mockTruthManifest,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes("Sitemap contains stale July demand slug"))).toBe(true);
    });

    it("passes verification and writes artifact certification manifest when content matches truth", async () => {
      const buildStartTime = Date.now() - 5000;
      setupMockBuild(tempDir);

      const result = await verifyGeneratedBuild({
        cwd: tempDir,
        buildStartTime,
        mockTruthManifest,
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      const manifestPath = join(tempDir, ".production-artifact-manifest.json");
      expect(existsSync(manifestPath)).toBe(true);
      expect(result.artifactManifest.status).toBe("CERTIFIED_FOR_DEPLOYMENT");
      expect(result.artifactManifest.truthHash).toBe(mockTruthManifest.truthHash);
    });
  });

  describe("Deploy Artifact Manifest Binding Guard", () => {
    const validManifest = {
      version: 1,
      status: "CERTIFIED_FOR_DEPLOYMENT",
      gitSha: "abc1234567890abcdef",
      gitBranch: "main",
      buildId: "build-xyz-789",
      truthHash: "fedcba9876543210fedcba9876543210",
      verifiedTimestamp: Date.now(),
    };

    it("passes when all manifest fields match current build environment", () => {
      const result = validateArtifactManifest({
        manifest: validManifest,
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
        now: Date.now(),
      });
      expect(result.valid).toBe(true);
    });

    it("fails when Git SHA has diverged between build and deploy", () => {
      const result = validateArtifactManifest({
        manifest: validManifest,
        currentGitSha: "999diffcommithash999",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Manifest Git SHA");
      expect(result.error).toContain("different commit");
    });

    it("fails when BUILD_ID does not match", () => {
      const result = validateArtifactManifest({
        manifest: validManifest,
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "different-build-id",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("BUILD_ID");
    });

    it("fails when truth hash has diverged", () => {
      const result = validateArtifactManifest({
        manifest: validManifest,
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "altered-database-content-hash",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Manifest truth hash");
      expect(result.error).toContain("Content truth has changed");
    });

    it("fails when certification timestamp is expired (> 1 hour)", () => {
      const result = validateArtifactManifest({
        manifest: {
          ...validManifest,
          verifiedTimestamp: Date.now() - 4000000, // > 1 hour
        },
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
        now: Date.now(),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("fails when manifest status is not CERTIFIED_FOR_DEPLOYMENT", () => {
      const result = validateArtifactManifest({
        manifest: {
          ...validManifest,
          status: "FAILED",
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expected 'CERTIFIED_FOR_DEPLOYMENT'");
    });

    it("fails when worker.js has been modified after certification (hash mismatch)", () => {
      const workerFile = join(tempDir, ".open-next/worker.js");
      const buildIdFile = join(tempDir, ".open-next/assets/BUILD_ID");
      mkdirSync(join(tempDir, ".open-next/assets"), { recursive: true });
      writeFileSync(workerFile, "export default { modified: true };");
      writeFileSync(buildIdFile, "build-xyz-789");

      const manifestWithHashes = {
        ...validManifest,
        hashes: {
          workerJs: "different_hash_from_original_certified_build",
          buildId: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      };

      const result = validateArtifactManifest({
        manifest: manifestWithHashes,
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
        verifyHashes: true,
        cwd: tempDir,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Artifact integrity check failed");
      expect(result.error).toContain("worker.js has been modified");
    });

    it("fails when news.html has been modified after certification (hash mismatch)", () => {
      const workerFile = join(tempDir, ".open-next/worker.js");
      const buildIdFile = join(tempDir, ".open-next/assets/BUILD_ID");
      const newsHtmlFile = join(tempDir, ".next/server/app/news.html");
      mkdirSync(join(tempDir, ".open-next/assets"), { recursive: true });
      mkdirSync(join(tempDir, ".next/server/app"), { recursive: true });
      writeFileSync(workerFile, "export default {};");
      writeFileSync(buildIdFile, "build-xyz-789");
      writeFileSync(newsHtmlFile, "<html><body>Original news</body></html>");

      const correctWorkerHash = createHash("sha256").update("export default {};").digest("hex");
      const correctBuildIdHash = createHash("sha256").update("build-xyz-789").digest("hex");

      const manifestWithHashes = {
        ...validManifest,
        hashes: {
          workerJs: correctWorkerHash,
          buildId: correctBuildIdHash,
          newsHtml: "tampered_news_hash",
        },
      };

      const result = validateArtifactManifest({
        manifest: manifestWithHashes,
        currentGitSha: "abc1234567890abcdef",
        currentBuildId: "build-xyz-789",
        currentTruthHash: "fedcba9876543210fedcba9876543210",
        verifyHashes: true,
        cwd: tempDir,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Artifact integrity check failed");
      expect(result.error).toContain("news.html has been modified");
    });
  });
});

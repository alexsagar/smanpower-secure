import { describe, it, expect } from "vitest";
import { parseRunnerArgs, buildChildExecutionPlan, runCmsSeed } from "../../scripts/run-production-cms-seed.mjs";
import { verifyBackup } from "../../src/scripts/cms-export";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";

describe("Safe Production CMS Runner Contract & Argument Forwarding", () => {
  describe("1. Argument Parsing & Safety Defaults", () => {
    it("defaults to DRY-RUN mode when --apply is omitted", () => {
      const parsed = parseRunnerArgs(["--target=pages"]);
      expect(parsed.target).toBe("pages");
      expect(parsed.dryRun).toBe(true);
      expect(parsed.isApply).toBe(false);
      expect(parsed.hasConfirmProd).toBe(false);
    });

    it("parses --apply and --confirm-production accurately", () => {
      const parsed = parseRunnerArgs([
        "--target=seo",
        "--apply",
        "--confirm-production",
        "--env-file=.env.test",
      ]);
      expect(parsed.target).toBe("seo");
      expect(parsed.dryRun).toBe(false);
      expect(parsed.isApply).toBe(true);
      expect(parsed.hasConfirmProd).toBe(true);
      expect(parsed.envFile).toBe(".env.test");
    });

    it("parses short flags like -t nav", () => {
      const parsed = parseRunnerArgs(["-t", "nav"]);
      expect(parsed.target).toBe("nav");
      expect(parsed.dryRun).toBe(true);
    });
  });

  describe("2. Child Execution Plan Construction", () => {
    it("maps target 'pages' to cms-migrate-dynamic-pages with scoped --only flag", () => {
      const plan = buildChildExecutionPlan({
        target: "pages",
        isApply: false,
        hasConfirmProd: false,
        only: "destinations,standalone",
      });
      expect(plan.scriptPath).toContain("cms-migrate-dynamic-pages.ts");
      expect(plan.childArgs).toEqual(["--only=destinations,standalone"]);
    });

    it("maps target 'seo' to seed-destinations-nav-seo with --seo-only flag", () => {
      const plan = buildChildExecutionPlan({
        target: "seo",
        isApply: true,
        hasConfirmProd: true,
        only: "destinations,standalone",
      });
      expect(plan.scriptPath).toContain("seed-destinations-nav-seo.ts");
      expect(plan.childArgs).toEqual(["--seo-only", "--apply", "--confirm-production"]);
    });

    it("maps target 'nav' to seed-destinations-nav-seo with --nav-only flag", () => {
      const plan = buildChildExecutionPlan({
        target: "nav",
        isApply: false,
        hasConfirmProd: false,
        only: "destinations,standalone",
      });
      expect(plan.scriptPath).toContain("seed-destinations-nav-seo.ts");
      expect(plan.childArgs).toEqual(["--nav-only"]);
    });

    it("maps target 'backup' to cms-export.ts with empty child args", () => {
      const plan = buildChildExecutionPlan({
        target: "backup",
        isApply: false,
        hasConfirmProd: false,
      });
      expect(plan.scriptPath).toContain("cms-export.ts");
      expect(plan.childArgs).toEqual([]);
    });

    it("maps target 'restore' to cms-import.ts with file argument", () => {
      const plan = buildChildExecutionPlan({
        target: "restore",
        isApply: true,
        hasConfirmProd: true,
        file: "prisma/backups/test.json",
      });
      expect(plan.scriptPath).toContain("cms-import.ts");
      expect(plan.childArgs).toEqual(["prisma/backups/test.json"]);
    });
  });

  describe("3. Production Safety Abort Gate", () => {
    it("strictly aborts if --apply is requested against production without --confirm-production", async () => {
      const result = await runCmsSeed({
        parsed: {
          target: "pages",
          isApply: true,
          hasConfirmProd: false,
          envFile: ".env.production",
          only: "destinations,standalone",
          dryRun: false,
        },
        dryRunRunnerOnly: true,
      });
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it("rejects invalid targets", async () => {
      const result = await runCmsSeed({
        parsed: {
          target: "invalid-target",
          isApply: false,
          hasConfirmProd: false,
          envFile: ".env.production",
          only: "destinations,standalone",
          dryRun: true,
        },
      });
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });
  });

  describe("4. Child Process Argument Forwarding on Windows Shell", () => {
    it("delivers exact array of arguments to child process without flag dropping", () => {
      const tempEchoScript = resolve(process.cwd(), "tests/deployment/temp-echo-args.cjs");
      writeFileSync(
        tempEchoScript,
        `console.log("JSON_ARGS:" + JSON.stringify(process.argv.slice(2)));`
      );

      try {
        const testArgs = [
          "tsx",
          tempEchoScript,
          "--only=destinations,standalone",
          "--seo-only",
          "--apply",
          "--confirm-production",
        ];

        const spawnCmd = process.platform === "win32" ? "npx.cmd" : "npx";
        const res = spawnSync(spawnCmd, testArgs, {
          cwd: process.cwd(),
          encoding: "utf8",
          shell: process.platform === "win32",
        });

        expect(res.status).toBe(0);
        const match = (res.stdout || "").match(/JSON_ARGS:(.*)/);
        expect(match).toBeTruthy();
        const received = JSON.parse(match![1].trim());

        // Assert exact arguments arrived in child process
        expect(received).toEqual([
          "--only=destinations,standalone",
          "--seo-only",
          "--apply",
          "--confirm-production",
        ]);
      } finally {
        if (existsSync(tempEchoScript)) {
          unlinkSync(tempEchoScript);
        }
      }
    });
  });

  describe("5. Restore Target Safety", () => {
    const restoreParsed = (over = {}) => ({
      target: "restore",
      isApply: false,
      hasConfirmProd: false,
      envFile: ".env.test",
      only: "destinations,standalone",
      file: "prisma/backups/test.json",
      dryRun: true,
      ...over,
    });

    it("refuses restore without --apply (no dry-run restore exists)", async () => {
      const result = await runCmsSeed({
        parsed: restoreParsed({ hasConfirmProd: true }),
        dryRunRunnerOnly: true,
      });
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it("refuses restore without --confirm-production", async () => {
      const result = await runCmsSeed({
        parsed: restoreParsed({ isApply: true, dryRun: false }),
        dryRunRunnerOnly: true,
      });
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it("refuses restore against production even with --apply --confirm-production", async () => {
      const result = await runCmsSeed({
        parsed: restoreParsed({
          isApply: true,
          hasConfirmProd: true,
          dryRun: false,
          envFile: ".env.production",
        }),
        dryRunRunnerOnly: true,
      });
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it("allows a fully-flagged restore against a non-production database", async () => {
      const result = await runCmsSeed({
        parsed: restoreParsed({ isApply: true, hasConfirmProd: true, dryRun: false }),
        dryRunRunnerOnly: true,
      });
      expect(result.success).toBe(true);
      expect(result.plan!.scriptPath).toContain("cms-import.ts");
    });
  });

  describe("6. Backup Completeness Verification", () => {
    const counts = {
      cmsPage: 2,
      sEOPageMeta: 1,
      mediaAsset: 0,
      navigationItem: 2,
      siteSetting: 0,
      industry: 0,
      trainingFacility: 0,
      complianceDocument: 0,
      successStory: 0,
      insightArticle: 0,
      cmsHeroSection: 1,
      cmsContentBlock: 1,
    };
    const fakeClient = Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, { count: async () => v }])
    ) as never;

    const completeBackup = () => ({
      pages: [
        { id: "p1", hero: { pageId: "p1" }, blocks: [{ pageId: "p1" }] },
        { id: "p2", hero: null, blocks: [] },
      ],
      seoMeta: [{ id: "s1" }],
      mediaAssets: [],
      navigationItems: [{ id: "n1", parentId: null }, { id: "n2", parentId: "n1" }],
      siteSettings: [],
      industries: [],
      facilities: [],
      complianceDocs: [],
      successStories: [],
      insightArticles: [],
    });

    it("passes a complete backup", async () => {
      const report = await verifyBackup(completeBackup() as never, fakeClient);
      expect(report.problems).toEqual([]);
    });

    it("detects a short table (rows missing versus live source count)", async () => {
      const backup = completeBackup();
      backup.seoMeta = [];
      const report = await verifyBackup(backup as never, fakeClient);
      expect(report.problems.join(" ")).toContain("seoMeta: exported 0 rows but source has 1");
    });

    it("detects missing nested hero/block rows", async () => {
      const backup = completeBackup();
      backup.pages[0].blocks = [];
      const report = await verifyBackup(backup as never, fakeClient);
      expect(report.problems.join(" ")).toContain("contentBlocks: exported 0 but source has 1");
    });

    it("detects a broken navigation parent relationship", async () => {
      const backup = completeBackup();
      backup.navigationItems[1].parentId = "ghost";
      const report = await verifyBackup(backup as never, fakeClient);
      expect(report.problems.join(" ")).toContain("references missing parent ghost");
    });

    it("detects an entirely missing collection", async () => {
      const backup = completeBackup() as Record<string, unknown>;
      delete backup.navigationItems;
      const report = await verifyBackup(backup as never, fakeClient);
      expect(report.problems.join(" ")).toContain("navigationItems: missing or not an array");
    });
  });
});

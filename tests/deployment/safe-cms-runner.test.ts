import { describe, it, expect } from "vitest";
import { parseRunnerArgs, buildChildExecutionPlan, runCmsSeed } from "../../scripts/run-production-cms-seed.mjs";
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
});

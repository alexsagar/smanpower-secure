#!/usr/bin/env node

/**
 * scripts/run-production-cms-seed.mjs
 *
 * Hardened safe runner for production CMS migration and seed operations.
 * Solves Windows shell flag swallowing by executing child processes via Node's
 * child_process with explicit argument arrays, bypassing shell wrapper ambiguities.
 *
 * Safeguards:
 * 1. Mode defaults strictly to DRY-RUN (safe read-only inspection).
 * 2. Writes require explicit `--apply` AND `--confirm-production` when targeting production.
 * 3. Scope is strictly locked to destination/Kathmandu targets.
 * 4. Prints pre-execution audit banner detailing exact parsed arguments and DB identity.
 *
 * Usage:
 *   Dry-run pages migration:
 *     node scripts/run-production-cms-seed.mjs --target=pages
 *
 *   Dry-run SEO metadata seed (nav deferred):
 *     node scripts/run-production-cms-seed.mjs --target=seo
 *
 *   Dry-run Navigation child seed:
 *     node scripts/run-production-cms-seed.mjs --target=nav
 *
 *   Live execution (requires explicit confirmation):
 *     node scripts/run-production-cms-seed.mjs --target=pages --apply --confirm-production
 *     node scripts/run-production-cms-seed.mjs --target=seo --apply --confirm-production
 *     node scripts/run-production-cms-seed.mjs --target=nav --apply --confirm-production
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  parseEnvContent,
  getDbIdentity,
  APPROVED_PROD_DB_HASHES,
} from "./deployment-safety-common.mjs";

const VALID_TARGETS = new Set(["pages", "seo", "nav", "backup", "restore"]);

export function parseRunnerArgs(args = []) {
  let target = "";
  let isApply = false;
  let hasConfirmProd = false;
  let envFile = ".env.production";
  let only = "destinations,standalone";
  let file = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--target=")) {
      target = arg.slice("--target=".length);
    } else if (arg === "--target" || arg === "-t") {
      target = args[++i] || "";
    } else if (arg === "--apply" || arg === "--execute") {
      isApply = true;
    } else if (arg === "--confirm-production") {
      hasConfirmProd = true;
    } else if (arg.startsWith("--env-file=")) {
      envFile = arg.slice("--env-file=".length);
    } else if (arg === "--env-file") {
      envFile = args[++i] || envFile;
    } else if (arg.startsWith("--only=")) {
      only = arg.slice("--only=".length);
    } else if (arg === "--only") {
      only = args[++i] || only;
    } else if (arg.startsWith("--file=")) {
      file = arg.slice("--file=".length);
    } else if (arg === "--file") {
      file = args[++i] || file;
    }
  }

  return {
    target,
    isApply,
    hasConfirmProd,
    envFile,
    only,
    file,
    dryRun: !isApply && target !== "backup",
  };
}

export function buildChildExecutionPlan(options, cwd = process.cwd()) {
  const { target, isApply, hasConfirmProd, only, file } = options;

  let scriptPath = "";
  const childArgs = [];

  if (target === "pages") {
    scriptPath = resolve(cwd, "src/scripts/cms-migrate-dynamic-pages.ts");
    childArgs.push(`--only=${only}`);
    if (isApply) childArgs.push("--apply");
    if (hasConfirmProd) childArgs.push("--confirm-production");
  } else if (target === "seo") {
    scriptPath = resolve(cwd, "src/scripts/seed-destinations-nav-seo.ts");
    childArgs.push("--seo-only");
    if (isApply) childArgs.push("--apply");
    if (hasConfirmProd) childArgs.push("--confirm-production");
  } else if (target === "nav") {
    scriptPath = resolve(cwd, "src/scripts/seed-destinations-nav-seo.ts");
    childArgs.push("--nav-only");
    if (isApply) childArgs.push("--apply");
    if (hasConfirmProd) childArgs.push("--confirm-production");
  } else if (target === "backup") {
    scriptPath = resolve(cwd, "src/scripts/cms-export.ts");
  } else if (target === "restore") {
    scriptPath = resolve(cwd, "src/scripts/cms-import.ts");
    if (file) childArgs.push(file);
  }

  return { scriptPath, childArgs };
}

export async function runCmsSeed(options = {}) {
  const cwd = options.cwd || process.cwd();
  const parsed = options.parsed || parseRunnerArgs(process.argv.slice(2));

  console.log("================================================================");
  console.log("🛡️  SAFE PRODUCTION CMS RUNNER");
  console.log("================================================================");

  if (!VALID_TARGETS.has(parsed.target)) {
    console.error(`\n❌ ERROR: Invalid or missing --target.`);
    console.error("Valid targets: 'pages' (CMS pages), 'seo' (SEOPageMeta), 'nav' (Navigation child), 'backup' (CMS backup), 'restore' (CMS restore).");
    console.error("Example: node scripts/run-production-cms-seed.mjs --target=pages\n");
    return { success: false, exitCode: 1 };
  }

  if (parsed.target === "restore" && !parsed.file) {
    console.error(`\n❌ ERROR: Target 'restore' requires --file=<path-to-backup.json>\n`);
    return { success: false, exitCode: 1 };
  }

  // 1. Resolve environment
  const envPath = resolve(cwd, parsed.envFile);
  if (!existsSync(envPath)) {
    console.error(`\n❌ ERROR: Environment file '${parsed.envFile}' not found at ${envPath}\n`);
    return { success: false, exitCode: 1 };
  }

  const rawEnv = readFileSync(envPath, "utf8");
  const parsedEnv = parseEnvContent(rawEnv);
  const combinedEnv = { ...process.env, ...parsedEnv };

  const dbUrl = combinedEnv.DATABASE_URL;
  if (!dbUrl) {
    console.error(`\n❌ ERROR: DATABASE_URL not found in ${parsed.envFile}\n`);
    return { success: false, exitCode: 1 };
  }

  const dbId = getDbIdentity(dbUrl);
  const isProdDb = APPROVED_PROD_DB_HASHES.has(dbId.hash) || combinedEnv.APP_ENV === "production";

  // 2. Safety Gate for Production
  const requiresConfirm = (parsed.isApply || parsed.target === "restore");
  if (isProdDb && requiresConfirm && !parsed.hasConfirmProd) {
    console.error("\n🚨 SAFETY ABORT: Target is PRODUCTION database!");
    console.error("Writing to production requires explicit --confirm-production.");
    console.error("Execution aborted to prevent unintended production write.\n");
    return { success: false, exitCode: 1 };
  }

  // 3. Build execution plan
  const { scriptPath, childArgs } = buildChildExecutionPlan(parsed, cwd);

  const modeDesc =
    parsed.target === "backup"
      ? "READ-ONLY EXPORT (Safe: exports production CMS tables to JSON)"
      : parsed.dryRun
      ? "DRY-RUN (Safe: no database writes)"
      : "APPLY (LIVE WRITES AUTHORIZED)";

  console.log(`Target Operation:  ${parsed.target.toUpperCase()}`);
  console.log(`Execution Mode:    ${modeDesc}`);
  console.log(`Database Host:     ${dbId.host || "unknown"} (${dbId.shortHash || "unknown"})`);
  console.log(`Database Identity: ${isProdDb ? "APPROVED PRODUCTION" : "NON-PRODUCTION / TEST"}`);
  console.log(`Child Script:      ${scriptPath}`);
  console.log(`Child Arguments:   ${JSON.stringify(childArgs)}`);
  console.log("================================================================\n");

  if (options.dryRunRunnerOnly) {
    return { success: true, exitCode: 0, plan: { scriptPath, childArgs, isProdDb } };
  }

  // 4. Execute child process via npx tsx with explicit arguments
  const spawnCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const spawnArgs = ["tsx", scriptPath, ...childArgs];

  const result = spawnSync(spawnCommand, spawnArgs, {
    cwd,
    env: combinedEnv,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`❌ Child process execution failed: ${result.error.message}`);
    return { success: false, exitCode: 1 };
  }

  return { success: result.status === 0, exitCode: result.status || 0 };
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/run-production-cms-seed.mjs")) {
  runCmsSeed().then((res) => {
    if (!res.success) {
      process.exit(res.exitCode || 1);
    }
  });
}

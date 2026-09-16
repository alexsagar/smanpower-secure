import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

// Approved production database identity hashes (SHA-256 of normalized "host/pathname")
// Normalized: "ep-steep-wave-ao8565zn-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb"
export const APPROVED_PROD_DB_HASHES = new Set([
  "389b7880bc322e77d463cf45c8c8006509347f93fb05eff4990be91f3332e549", // pooled
  "7912e6663ac6f6f2c0d962547637713dee426f4c6e232a4b4b520a39c0a9c713", // direct
]);

// Known development database identity hash (ep-rough-butterfly)
export const KNOWN_DEV_DB_HASH =
  "bbc1369b756c61bfcbc0bc56d14c2bdaaf904d93e8ced452836c8093815b2842";

// Production-critical variables that must NEVER be overridden by .env.local
export const PRODUCTION_CRITICAL_ENV_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "APP_ENV",
  "DEMO_MODE",
  "QA_MODE",
  "SITE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
];

export const REQUIRED_PROD_ENV_VALUES = {
  APP_ENV: "production",
  DEMO_MODE: "false",
  QA_MODE: "false",
  SITE_URL: "https://smanpower.com",
  NEXT_PUBLIC_SITE_URL: "https://smanpower.com",
};

/**
 * Normalizes a database URL to "host/pathname" in lowercase and returns its SHA-256 hash.
 * Never leaks credentials or secrets.
 */
export function getDbIdentity(urlStr) {
  if (!urlStr || typeof urlStr !== "string") {
    return { valid: false, error: "Database URL is missing or not a string" };
  }
  try {
    const parsed = new URL(urlStr);
    const host = parsed.host.toLowerCase();
    const pathname = (parsed.pathname || "").toLowerCase();
    const normalized = `${host}${pathname}`;
    const hash = createHash("sha256").update(normalized).digest("hex");
    return {
      valid: true,
      host,
      pathname,
      normalized,
      hash,
      shortHash: hash.slice(0, 12),
    };
  } catch (err) {
    return { valid: false, error: "Invalid database URL format" };
  }
}

/**
 * Parses simple KEY=VALUE format from env file content
 */
export function parseEnvContent(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

/**
 * Validates git state for production deployment.
 */
export function validateGitState(options = {}) {
  const {
    cwd = process.cwd(),
    allowNonMain = false,
    skipFetch = false,
    mockGitState,
  } = options;

  if (mockGitState) {
    if (!allowNonMain && mockGitState.branch !== "main") {
      return {
        valid: false,
        error: `Current branch is '${mockGitState.branch}'. Production release MUST be on 'main'.`,
      };
    }
    if (mockGitState.isDirty) {
      return {
        valid: false,
        error: "Working tree is dirty. Clean all changes before production build.",
      };
    }
    if (mockGitState.localHead !== mockGitState.remoteHead) {
      return {
        valid: false,
        error: `Local main (${mockGitState.localHead}) does not match origin/main (${mockGitState.remoteHead}).`,
      };
    }
    if (mockGitState.unpushedCount > 0) {
      return {
        valid: false,
        error: `Local branch has ${mockGitState.unpushedCount} unpushed commits.`,
      };
    }
    return { valid: true, branch: mockGitState.branch };
  }

  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf8",
    }).trim();

    if (!allowNonMain && branch !== "main") {
      return {
        valid: false,
        error: `Current branch is '${branch}'. Production release MUST be on 'main'.`,
      };
    }

    const status = execSync("git status --porcelain", {
      cwd,
      encoding: "utf8",
    }).trim();
    if (status.length > 0) {
      return {
        valid: false,
        error: `Working tree is dirty. Untracked or modified files detected:\n${status}`,
      };
    }

    const targetBranch = allowNonMain ? branch : "main";
    if (!skipFetch) {
      try {
        execSync(`git fetch origin ${targetBranch}`, { cwd, stdio: "pipe" });
      } catch (e) {
        return {
          valid: false,
          error: `Failed to fetch origin/${targetBranch}: ${e.message}`,
        };
      }
    }

    const localHead = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf8",
    }).trim();
    const remoteHead = execSync(`git rev-parse origin/${targetBranch}`, {
      cwd,
      encoding: "utf8",
    }).trim();

    if (localHead !== remoteHead) {
      return {
        valid: false,
        error: `Local ${targetBranch} (${localHead.slice(0, 7)}) differs from origin/${targetBranch} (${remoteHead.slice(0, 7)}). Run 'git pull origin ${targetBranch}'.`,
      };
    }

    const unpushed = execSync(`git log origin/${targetBranch}..HEAD --oneline`, {
      cwd,
      encoding: "utf8",
    }).trim();
    if (unpushed.length > 0) {
      return {
        valid: false,
        error: `Local ${targetBranch} has unpushed commits:\n${unpushed}`,
      };
    }

    return { valid: true, branch, head: localHead };
  } catch (err) {
    return { valid: false, error: `Git validation failed: ${err.message}` };
  }
}

/**
 * Validates that .env.local does not exist or does not contain production-critical variables.
 */
export function validateEnvLocal(options = {}) {
  const { cwd = process.cwd(), mockEnvLocalContent } = options;
  const envLocalPath = resolve(cwd, ".env.local");

  if (mockEnvLocalContent !== undefined) {
    if (mockEnvLocalContent === null) return { valid: true };
    const env = parseEnvContent(mockEnvLocalContent);
    const offending = PRODUCTION_CRITICAL_ENV_KEYS.filter((k) => k in env);
    if (offending.length > 0) {
      return {
        valid: false,
        error: `.env.local contains production-critical variables: [${offending.join(
          ", "
        )}]. Remove or migrate them to .env.development.local before building for production.`,
      };
    }
    return { valid: true };
  }

  if (existsSync(envLocalPath)) {
    const content = readFileSync(envLocalPath, "utf8");
    const env = parseEnvContent(content);
    const offending = PRODUCTION_CRITICAL_ENV_KEYS.filter((k) => k in env);
    if (offending.length > 0) {
      return {
        valid: false,
        error: `.env.local contains production-critical variables: [${offending.join(
          ", "
        )}]. Next.js will load .env.local during build and override production values. Remove or rename .env.local.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates application environment variables against required production values.
 */
export function validateAppEnvironment(env) {
  for (const [key, expected] of Object.entries(REQUIRED_PROD_ENV_VALUES)) {
    const val = env[key];
    if (val !== expected) {
      return {
        valid: false,
        error: `Environment variable ${key} is "${val}", expected "${expected}".`,
      };
    }
  }
  return { valid: true };
}

/**
 * Validates database identity against approved production fingerprints.
 * Strictly rejects the development database and unknown databases.
 */
export function validateDatabaseIdentity(databaseUrl) {
  const identity = getDbIdentity(databaseUrl);
  if (!identity.valid) {
    return { valid: false, error: `Invalid DATABASE_URL: ${identity.error}` };
  }

  if (identity.hash === KNOWN_DEV_DB_HASH) {
    return {
      valid: false,
      error: `CRITICAL SAFETY VIOLATION: DATABASE_URL resolves to the DEVELOPMENT database (${identity.host}). Build ABORTED.`,
    };
  }

  if (!APPROVED_PROD_DB_HASHES.has(identity.hash)) {
    return {
      valid: false,
      error: `CRITICAL SAFETY VIOLATION: DATABASE_URL identity (fingerprint ${identity.shortHash}) does not match approved production databases. Build ABORTED.`,
    };
  }

  return {
    valid: true,
    host: identity.host,
    shortHash: identity.shortHash,
  };
}

/**
 * Validates database content counts against production thresholds to prevent using old snapshots.
 */
export function validateContentCounts(counts) {
  const errors = [];
  if (counts.newsCount < 1) {
    errors.push(
      `NewsArticle count is ${counts.newsCount}. Live production requires >= 1 active articles. (Matches old July snapshot with 0 news).`
    );
  }
  if (counts.demandCount < 3) {
    errors.push(
      `Demand count is ${counts.demandCount}. Live production requires >= 3 demands. (Matches old July snapshot with 2 demands).`
    );
  }
  if (counts.pageCount < 50) {
    errors.push(`CmsPage count is ${counts.pageCount}, expected >= 50.`);
  }
  if (counts.recentInsightCount < 1) {
    errors.push(
      `Zero insights updated after August 2026. Live production has August 2026 insight revisions. (Matches old July snapshot).`
    );
  }
  if (counts.mediaCount < 140) {
    errors.push(
      `MediaAsset count is ${counts.mediaCount}, expected >= 140. (Matches old July snapshot with 139 assets).`
    );
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates compiled HTML artifact for required production markers and absence of bugs.
 */
export function validateArtifactHtml(html, type = "homepage") {
  const errors = [];
  if (!html || typeof html !== "string") {
    return { valid: false, errors: ["Missing or empty HTML content"] };
  }

  if (type === "homepage") {
    if (!html.includes("google_translate_element")) {
      errors.push("Missing Google Translate element (#google_translate_element).");
    }
    if (!html.includes('"@type":"Organization"') && !html.includes('"@type": "Organization"')) {
      errors.push("Missing Organization JSON-LD schema.");
    }
    if (!html.includes("Overseas Recruitment Agency in Nepal") && !html.includes("Seven Seas Intercontinental")) {
      errors.push("Missing brand identity/title.");
    }
  }

  if (type === "insight") {
    if (html.includes("<title>OpenAI</title>")) {
      errors.push("Contains leaked SVG <title>OpenAI</title>.");
    }
    if (html.includes("data-dgst") && !html.includes("<article")) {
      errors.push("Contains SSR crash fallback skeleton (data-dgst).");
    }
    if (!html.includes("BlogPosting")) {
      errors.push("Missing BlogPosting JSON-LD schema.");
    }
    if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
      errors.push("Missing canonical link tag.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates production artifact manifest before deployment.
 * Ensures the deployed bundle strictly binds to the exact verified Git SHA,
 * BUILD_ID, fresh timestamp, and truth manifest hash.
 */
export function validateArtifactManifest(options = {}) {
  const {
    manifest,
    currentGitSha,
    currentBuildId,
    currentTruthHash,
    now = Date.now(),
    maxAgeMs = 3600000, // 1 hour
  } = options;

  if (!manifest || typeof manifest !== "object") {
    return { valid: false, error: "Artifact certification manifest is missing or invalid." };
  }

  if (manifest.status !== "CERTIFIED_FOR_DEPLOYMENT") {
    return {
      valid: false,
      error: `Artifact status is '${manifest.status}', expected 'CERTIFIED_FOR_DEPLOYMENT'.`,
    };
  }

  if (currentGitSha && manifest.gitSha !== currentGitSha) {
    return {
      valid: false,
      error: `Manifest Git SHA (${manifest.gitSha}) does not match current Git HEAD (${currentGitSha}). Build artifacts were compiled from a different commit.`,
    };
  }

  if (currentBuildId && manifest.buildId !== currentBuildId) {
    return {
      valid: false,
      error: `Manifest BUILD_ID (${manifest.buildId}) does not match current OpenNext BUILD_ID (${currentBuildId}).`,
    };
  }

  if (currentTruthHash && manifest.truthHash !== currentTruthHash) {
    return {
      valid: false,
      error: `Manifest truth hash (${manifest.truthHash}) does not match current truth manifest (${currentTruthHash}). Content truth has changed since build.`,
    };
  }

  if (!manifest.truthHash || manifest.truthHash === "none") {
    return {
      valid: false,
      error: "Manifest truth hash is missing. Artifact was not validated against content truth.",
    };
  }

  if (!manifest.verifiedTimestamp || typeof manifest.verifiedTimestamp !== "number") {
    return {
      valid: false,
      error: "Manifest verification timestamp is missing or invalid.",
    };
  }

  const ageMs = now - manifest.verifiedTimestamp;
  if (ageMs > maxAgeMs) {
    return {
      valid: false,
      error: `Artifact certification has expired (${Math.round(ageMs / 60000)} minutes old, max allowed: ${Math.round(maxAgeMs / 60000)} minutes). Re-run safe build.`,
    };
  }

  return {
    valid: true,
    manifest,
  };
}


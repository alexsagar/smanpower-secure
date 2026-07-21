import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Server actions are POST endpoints in their own right. The admin layout's
 * auth check protects page navigation, and the proxy matcher covers only
 * `/:locale` routes, so an action without its own guard is reachable
 * unauthenticated. Every mutating action must authenticate itself.
 */

// Actions that are intentionally public (visitor-facing submissions and auth).
const PUBLIC_ACTION_FILES = new Set([
  "src/actions/auth.ts",
  "src/actions/password-reset.ts",
  "src/actions/forms.ts",
  "src/actions/career-applications.ts",
]);

// `auth()` followed by an unauthorized return is also a valid guard (mfa.ts).
const GUARDS = /requirePermission|requireCurrentAdminUser|await auth\(\)/;

/** Visitor-facing actions that live beside admin ones and must stay public. */
const PUBLIC_ACTIONS = new Set(["applyToDemandAction"]);

function actionFiles(): string[] {
  return execSync('git ls-files "src/actions/*.ts"', { encoding: "utf8" })
    .split("\n")
    .filter((f) => f && !f.includes(".test.") && !f.endsWith("content-validation.ts"))
    .filter((f) => !PUBLIC_ACTION_FILES.has(f));
}

describe("admin server action authorization", () => {
  it.each(actionFiles())("%s guards every exported action", (file) => {
    const source = readFileSync(file, "utf8");
    const exported = source.match(/export async function (\w+)/g) ?? [];

    for (const decl of exported) {
      const name = decl.replace("export async function ", "");
      if (PUBLIC_ACTIONS.has(name)) continue;
      const start = source.indexOf(decl);
      const nextExport = source.indexOf("export async function", start + decl.length);
      const body = source.slice(start, nextExport === -1 ? undefined : nextExport);

      expect(GUARDS.test(body), `${file} -> ${name}() has no auth guard`).toBe(true);
    }
  });
});

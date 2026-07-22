import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const runtimeExportPatterns = [
  /\bexport\s+(const|let|var|class|enum)\b/,
  /\bexport\s+function\b/,
  /\bexport\s*\{/,
  /\bexport\s+\*/,
];

function hasModuleUseServer(source: string) {
  return /^\s*["']use server["'];?/.test(source);
}

describe("module-level server action files", () => {
  it("export only async functions or types", () => {
    const files = execFileSync("git", ["ls-files", "src"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim().split(/\r?\n/).filter((file) => /\.(ts|tsx)$/.test(file) && existsSync(join(process.cwd(), file)));

    const invalidExports = files.flatMap((file) => {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      if (!hasModuleUseServer(source)) return [];

      return source.split(/\r?\n/).flatMap((line, index) => {
        const trimmed = line.trim();
        if (!runtimeExportPatterns.some((pattern) => pattern.test(trimmed))) return [];
        if (/^export\s+async\s+function\b/.test(trimmed)) return [];
        if (/^export\s+type\b/.test(trimmed) || /^export\s+interface\b/.test(trimmed)) return [];
        return [`${relative(process.cwd(), file)}:${index + 1}: ${trimmed}`];
      });
    });

    expect(invalidExports).toEqual([]);
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("package script contract", () => {
  it("keeps Vercel preview builds separate from Prisma migrations", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.build).toBe("prisma generate && next build");
    expect(packageJson.scripts?.["vercel-build"]).toBe("npm run build");
    expect(packageJson.scripts?.["migrate:deploy"]).toBe("prisma migrate deploy");
    expect(packageJson.scripts?.["qa:migrate"]).toContain("prisma migrate deploy");
  });
});

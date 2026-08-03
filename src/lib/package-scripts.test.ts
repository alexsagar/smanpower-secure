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

    // The build is now the OpenNext/Cloudflare pipeline (prisma generate +
    // workerd exports + opennext build). The invariant that matters is
    // unchanged: the build must generate the client but must NEVER run a
    // migration — migrations live only in migrate:deploy / qa:migrate.
    const build = packageJson.scripts?.build ?? "";
    expect(build).toContain("prisma generate");
    expect(build).toContain("opennextjs-cloudflare build");
    expect(build).not.toMatch(/migrate/);
    expect(packageJson.scripts?.["vercel-build"]).toBe("npm run build");
    expect(packageJson.scripts?.["migrate:deploy"]).toBe("prisma migrate deploy");
    expect(packageJson.scripts?.["qa:migrate"]).toContain("prisma migrate deploy");
  });
});

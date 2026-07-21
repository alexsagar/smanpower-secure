import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src/app/admin/(dashboard)/content");

/**
 * CMS page slugs contain "/" (about/leadership, employers/screening), so the
 * editor URL spans multiple path segments. A single [slug] segment cannot match
 * those and every nested page 404s.
 */
describe("admin content editor route", () => {
  it("uses a catch-all segment so nested slugs resolve", () => {
    expect(existsSync(path.join(CONTENT_DIR, "[...slug]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(CONTENT_DIR, "[slug]/page.tsx"))).toBe(false);
  });

  it("rejoins the path segments back into the stored slug", () => {
    const source = readFileSync(path.join(CONTENT_DIR, "[...slug]/page.tsx"), "utf8");

    expect(source).toContain("slug: string[]");
    expect(source).toContain('segments.join("/")');
  });
});

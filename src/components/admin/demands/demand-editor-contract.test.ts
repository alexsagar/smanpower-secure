import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (p: string) => readFileSync(path.join(process.cwd(), p), "utf8");

const step1 = read("src/components/admin/demands/DemandStep1Company.tsx");
const step3 = read("src/components/admin/demands/DemandStep3Positions.tsx");
const actions = read("src/components/admin/demands/DemandActions.tsx");
// The list table moved into a client component when search/filter were wired.
const listTable = read("src/components/admin/demands/DemandListTable.tsx");
const publicPage = read("src/app/(public)/demands/[slug]/page.tsx");

describe("demand position editor", () => {
  // publishDemandAction requires all three on at least one position. Two of them
  // had no input in the wizard, which made publishing impossible.
  it.each(["minimumQualification", "requiredExperience", "requiredSkills"])(
    "lets the admin edit %s",
    (field) => {
      expect(step3).toContain(`updatePosition(pos.id, "${field}"`);
      expect(step3).toContain(`pos.${field} || ""`);
    }
  );
});

describe("featured image", () => {
  it("reuses the shared MediaInput rather than a new uploader", () => {
    expect(step1).toContain('from "@/components/admin/MediaInput"');
    expect(step1).toContain("featuredImageId: id");
    expect(step1).toContain('allowedResourceTypes={["IMAGE"]}');
    expect(step1).not.toMatch(/type="file"|FormData\(\)/);
  });

  // MediaPicker only renders its uploader when a purpose is supplied; without it
  // the admin has to leave the wizard and upload from the Media Library instead.
  it("can upload from inside the picker, not only pick existing assets", () => {
    const mediaInputs = step1.match(/<MediaInput\b[\s\S]*?\/>/g) ?? [];
    expect(mediaInputs).toHaveLength(2);
    for (const input of mediaInputs) {
      expect(input).toContain('uploadPurpose="demand_image"');
    }
  });

  it("renders on the public page only when one exists", () => {
    expect(publicPage).toContain("{demand.featuredImage && (");
    // No placeholder/fallback branch — the area collapses entirely.
    expect(publicPage).not.toMatch(/demand\.featuredImage\s*\?/);
  });
});

describe("demand action menu", () => {
  it("is clipped by its ancestors, so it must escape via a portal", () => {
    expect(listTable).toMatch(/overflow-hidden|overflow-x-auto/);
    expect(actions).toContain('from "react-dom"');
    expect(actions).toContain("createPortal(");
    expect(actions).toContain("document.body");
  });

  it("positions the menu with fixed coordinates instead of absolute offsets", () => {
    expect(actions).toContain("getBoundingClientRect()");
    expect(actions).not.toContain("absolute right-0 top-full");
  });
});

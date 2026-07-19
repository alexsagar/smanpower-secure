import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminPageSkeleton, IndeterminateProgress, PublicPageSkeleton } from "./PageSkeletons";

describe("route loading skeletons", () => {
  it("renders public and admin loading states without server-only imports", () => {
    const publicHtml = renderToStaticMarkup(<PublicPageSkeleton />);
    const adminHtml = renderToStaticMarkup(<AdminPageSkeleton />);

    expect(publicHtml).toContain("Loading page");
    expect(adminHtml).toContain("Loading admin page");
    expect(publicHtml + adminHtml).not.toMatch(/PrismaContentRepository|content-resolver|@prisma\/client/);
  });

  it("renders reduced-motion friendly progress markup", () => {
    const html = renderToStaticMarkup(<IndeterminateProgress label="Uploading file" />);

    expect(html).toContain("Uploading file");
    expect(html).toContain("motion-reduce:w-full");
  });
});

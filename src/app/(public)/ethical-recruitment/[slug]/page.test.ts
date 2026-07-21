import { describe, expect, it, vi } from "vitest";

// The route now resolves content through the CMS service, which reaches the
// server-only data layer on import.
vi.mock("server-only", () => ({}));
import { generateStaticParams } from "./page";

describe("ethical recruitment dynamic route", () => {
  it("does not generate reserved root policy slugs", () => {
    const slugs = generateStaticParams().map((param) => param.slug);

    expect(slugs).not.toContain("privacy-policy");
    expect(slugs).not.toContain("terms-of-service");
  });
});

import { describe, expect, it } from "vitest";
import { generateStaticParams } from "./page";

describe("ethical recruitment dynamic route", () => {
  it("does not generate reserved root policy slugs", () => {
    const slugs = generateStaticParams().map((param) => param.slug);

    expect(slugs).not.toContain("privacy-policy");
    expect(slugs).not.toContain("terms-of-service");
  });
});

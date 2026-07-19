import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("proxy", () => {
  it("does not redirect canonical root requests", () => {
    const response = proxy(new NextRequest("https://smanpower.com/"));
    expect(response).toBeUndefined();
  });

  it("redirects legacy locale roots to the canonical root", () => {
    const response = proxy(new NextRequest("https://smanpower.com/en"));
    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe("https://smanpower.com/");
  });

  it("redirects nested legacy locale paths and preserves query parameters", () => {
    const response = proxy(
      new NextRequest("https://smanpower.com/ne/demands/sample-slug?source=email&campaign=summer")
    );

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://smanpower.com/demands/sample-slug?source=email&campaign=summer"
    );
  });

  it("leaves non-legacy routes untouched", () => {
    const response = proxy(new NextRequest("https://smanpower.com/api/health"));
    expect(response).toBeUndefined();
  });
});

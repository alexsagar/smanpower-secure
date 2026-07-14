import { describe, expect, it } from "vitest";
import { getSafeExternalHttpUrl, sanitizeHtml } from "./html-safety";

describe("sanitizeHtml", () => {
  it("removes active script content and event handlers", () => {
    const html =
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';

    expect(sanitizeHtml(html)).toBe("<p>Hello</p><a>x</a>");
  });
});

describe("getSafeExternalHttpUrl", () => {
  it("allows http and https urls only", () => {
    expect(getSafeExternalHttpUrl("https://example.com/apply")).toBe(
      "https://example.com/apply"
    );
    expect(getSafeExternalHttpUrl("http://example.com/apply")).toBe(
      "http://example.com/apply"
    );
    expect(getSafeExternalHttpUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeExternalHttpUrl("/relative")).toBeNull();
  });
});

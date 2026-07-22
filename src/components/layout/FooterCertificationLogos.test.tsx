import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { FooterCertificationLogos } from "./FooterCertificationLogos";

vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => jsx("img", props) }));

const logos = [
  { imageUrl: "/images/iso.png", accessibleName: "ISO 9001:2015 Certified", enabled: true, order: 3 },
  { imageUrl: "/images/sedex.png", accessibleName: "Sedex", enabled: true, order: 1, href: "https://www.sedex.com" },
  { imageUrl: "/images/rba.png", accessibleName: "Responsible Business Alliance", enabled: true, order: 2 },
];

describe("FooterCertificationLogos", () => {
  it("renders enabled logos in configured order with their accessible names", () => {
    const html = renderToStaticMarkup(<FooterCertificationLogos logos={logos} />);
    expect(html.indexOf("Sedex")).toBeLessThan(html.indexOf("Responsible Business Alliance"));
    expect(html.indexOf("Responsible Business Alliance")).toBeLessThan(html.indexOf("ISO 9001:2015 Certified"));
    expect(html).toContain('alt="Sedex"');
    expect(html).toContain('alt="Responsible Business Alliance"');
    expect(html).toContain('alt="ISO 9001:2015 Certified"');
  });

  it("hides disabled or missing-image entries and returns no section when empty", () => {
    expect(renderToStaticMarkup(<FooterCertificationLogos logos={[{ ...logos[0], enabled: false }, { ...logos[1], imageUrl: "" }]} />)).toBe("");
  });

  it("uses secure attributes for HTTPS links and leaves non-linked logos non-interactive", () => {
    const html = renderToStaticMarkup(<FooterCertificationLogos logos={logos} />);
    expect(html).toContain('href="https://www.sedex.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.match(/<a /g)).toHaveLength(1);
  });
});

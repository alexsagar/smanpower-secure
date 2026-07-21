import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { Header } from "./Header";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  // Test stub for next/image; alt comes through in props.
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...(props as Record<string, string>)} />,
}));
vi.mock("./GoogleTranslate", () => ({ GoogleTranslate: () => <div data-google-translate /> }));

const navigation = [
  {
    id: "n1",
    label: "About",
    href: "/about",
    order: 1,
    isVisible: true,
    items: [{ id: "n2", label: "Our Story", href: "/about/our-story", order: 1, isVisible: true, items: [] }],
  },
] as never;

const render = () => renderToStaticMarkup(<Header navigation={navigation} />);

describe("header sizing", () => {
  it("uses the taller bar so the logo has room", () => {
    expect(render()).toContain("h-24 lg:h-28");
  });

  it("renders the logo large enough to be recognisable", () => {
    const html = render();
    expect(html).toContain("h-14 w-14 lg:h-16 lg:w-16");
    // Intrinsic size must exceed the rendered box so it stays sharp on retina.
    expect(html).toMatch(/width="80"/);
  });
});

describe("navigation hover", () => {
  // The underline previously sat at bottom-1/3, striking through the label.
  it("anchors the hover underline below the label, not across it", () => {
    const html = render();
    expect(html).toContain("after:bottom-0");
    expect(html).not.toContain("after:bottom-1/3");
  });

  it("grows the underline from the left on hover", () => {
    const html = render();
    expect(html).toContain("after:origin-left");
    expect(html).toContain("after:scale-x-0");
    expect(html).toContain("hover:after:scale-x-100");
  });
});

describe("demands call to action", () => {
  it("appears in the mobile bar, not only inside the drawer", () => {
    const html = render();
    // Mobile action cluster is visible below lg and holds a demands link.
    const mobileCluster = html.match(/<div class="flex items-center gap-2 lg:hidden">[\s\S]*?<\/button>/);
    expect(mobileCluster).not.toBeNull();
    expect(mobileCluster![0]).toContain('href="/demands"');
  });

  it("keeps the desktop action visible only at lg and above", () => {
    expect(render()).toContain("hidden lg:flex items-center gap-3 xl:gap-5 shrink-0");
  });

  it("offers a demands link on both breakpoints", () => {
    const occurrences = (render().match(/href="\/demands"/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

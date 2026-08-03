import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
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
  {
    id: "resources",
    label: "Resources",
    href: "/resources",
    order: 2,
    isVisible: true,
    items: [{ id: "gallery", label: "Gallery", href: "/gallery", order: 1, isVisible: true, items: [] }],
  },
] as never;

const render = () => renderToStaticMarkup(<Header navigation={navigation} />);
const headerSource = readFileSync(new URL("./Header.tsx", import.meta.url), "utf8");

describe("header sizing", () => {
  it("uses the taller bar so the logo has room", () => {
    expect(render()).toContain("h-[var(--site-header-height)]");
  });

  it("renders the logo large enough to be recognisable", () => {
    const html = render();
    expect(html).toContain("h-14 w-14 lg:h-16 lg:w-16");
    // Intrinsic size must exceed the rendered box so it stays sharp on retina.
    expect(html).toMatch(/width="80"/);
  });

  it("keeps the fixed header below browser safe areas", () => {
    expect(render()).toContain("pt-[env(safe-area-inset-top)]");
  });

  it("uses the shared height for dropdown and mobile offsets", () => {
    expect(headerSource).toContain("top-[calc(var(--site-header-height)+env(safe-area-inset-top))]");
    expect(headerSource).toContain("pt-[calc(var(--site-header-height)+env(safe-area-inset-top))]");
  });
});

describe("desktop navigation layout", () => {
  it("uses 11px only for the central desktop labels", () => {
    const html = render();
    expect(html).not.toContain('href="/search"');
    expect(html).toContain("public-nav-label");
    expect(html).toContain("text-[11px]");
  });

  it("omits the resources section and its links", () => {
    const html = render();
    expect(html).not.toContain(">Resources<");
    expect(html).not.toContain('href="/gallery"');
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
    const mobileCluster = html.match(/<div class="flex items-center gap-2 xl:hidden">[\s\S]*?<\/button>/);
    expect(mobileCluster).not.toBeNull();
    expect(mobileCluster![0]).toContain('href="/demands"');
  });

  it("keeps the desktop action visible only at lg and above", () => {
    expect(render()).toContain("hidden xl:flex items-center gap-5 shrink-0");
  });

  it("offers a demands link on both breakpoints", () => {
    const occurrences = (render().match(/href="\/demands"/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

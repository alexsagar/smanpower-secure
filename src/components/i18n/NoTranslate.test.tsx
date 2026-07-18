import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NoTranslate } from "./NoTranslate";

describe("NoTranslate Primitive", () => {
  it("applies translate=no and notranslate class", () => {
    const html = renderToStaticMarkup(<NoTranslate>Test</NoTranslate>);
    expect(html).toContain('translate="no"');
    expect(html).toContain('class="notranslate"');
    expect(html).toContain(">Test</");
  });

  it("preserves caller className and children", () => {
    const html = renderToStaticMarkup(<NoTranslate className="custom-class">ChildText</NoTranslate>);
    expect(html).toContain('class="notranslate custom-class"');
    expect(html).toContain(">ChildText</");
  });

  it("supports custom as element", () => {
    const html = renderToStaticMarkup(<NoTranslate as="h1">Header</NoTranslate>);
    expect(html.startsWith("<h1")).toBe(true);
    expect(html.endsWith("</h1>")).toBe(true);
  });
});

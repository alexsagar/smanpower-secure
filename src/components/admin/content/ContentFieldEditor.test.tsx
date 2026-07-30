import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ContentFieldEditor,
  blankFrom,
  humanizeKey,
  isEditableContentKey,
  orderContentKeys,
  shouldUseTextarea,
} from "./ContentFieldEditor";

vi.mock("lucide-react", () => ({
  ChevronDown: () => <svg data-icon="chevron-down" />,
  ChevronRight: () => <svg data-icon="chevron-right" />,
  ChevronUp: () => <svg data-icon="chevron-up" />,
  Plus: () => <svg data-icon="plus" />,
  Trash2: () => <svg data-icon="trash" />,
}));

const render = (value: unknown, label = "Field") =>
  renderToStaticMarkup(
    <ContentFieldEditor label={label} value={value} onChange={() => {}} />
  );

describe("field visibility", () => {
  it("is decided by type, not by field name", () => {
    // Regression: the old editor only rendered title/subtitle/description/*Text*.
    for (const key of ["eyebrow", "ctaHref", "heading", "headingHighlight", "badgeLabel", "anyFutureField"]) {
      expect(isEditableContentKey(key)).toBe(true);
    }
  });

  it("excludes identifiers and media references handled elsewhere", () => {
    for (const key of ["id", "blockKey", "blockType", "order", "imageId", "videoId"]) {
      expect(isEditableContentKey(key)).toBe(false);
    }
  });

  it("puts the identifier first, then scalars, then objects and arrays", () => {
    expect(
      orderContentKeys({ items: [], eyebrow: "a", nested: { x: 1 }, title: "b" })
    ).toEqual(["title", "eyebrow", "nested", "items"]);
  });

  it("orders every depth the same way, whatever order the stored JSON holds", () => {
    // Regression: a repeater entry stored as { desc, title } rendered its
    // description above its title, and used it as the row's name.
    expect(orderContentKeys({ desc: "long copy", title: "Economic Independence" }))
      .toEqual(["title", "desc"]);
  });

  it("omits excluded keys from the rendered field list", () => {
    expect(orderContentKeys({ id: "x", imageId: "y", eyebrow: "z" })).toEqual(["eyebrow"]);
  });
});

describe("labels", () => {
  it("humanizes camelCase and snake_case keys", () => {
    expect(humanizeKey("headingHighlight")).toBe("Heading Highlight");
    expect(humanizeKey("deployment_count")).toBe("Deployment count");
  });

  it("spells out codebase abbreviations editors should not have to decode", () => {
    expect(humanizeKey("desc")).toBe("Description");
    expect(humanizeKey("primaryCtaText")).toBe("Primary Call to action Text");
    expect(humanizeKey("imageUrl")).toBe("Image URL");
    expect(humanizeKey("faqs")).toBe("FAQs");
    expect(humanizeKey("headingLine1")).toBe("Heading Line 1");
  });
});

describe("scalar fields", () => {
  it("renders a text input for a short string", () => {
    const html = render("Our Capabilities", "Eyebrow");
    expect(html).toContain('type="text"');
    expect(html).toContain('value="Our Capabilities"');
    expect(html).toContain("Eyebrow");
  });

  it("renders a textarea for long or multi-line copy", () => {
    expect(shouldUseTextarea("short")).toBe(false);
    expect(shouldUseTextarea("a\nb")).toBe(true);
    expect(render("x".repeat(120))).toContain("<textarea");
  });

  it("renders numbers as a number input", () => {
    const html = render(3, "Grid Columns");
    expect(html).toContain('type="number"');
    expect(html).toContain('value="3"');
  });

  it("renders booleans as a checkbox", () => {
    const html = render(true, "Dark");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
  });

  it("renders null as an empty editable string instead of dropping it", () => {
    const html = render(null, "Eyebrow");
    expect(html).toContain('type="text"');
    expect(html).toContain("Eyebrow");
  });
});

describe("nested structures", () => {
  it("renders nested object fields recursively", () => {
    // Real shape from the final_cta block.
    const html = render({ text: "Partner With Us", href: "/employers" }, "Primary Cta");
    expect(html).toContain('value="Partner With Us"');
    expect(html).toContain('value="/employers"');
    expect(html).toContain("Text");
    expect(html).toContain("Link"); // `href` reads as "Link" for editors
  });

  it("collapses object entries to a named row each, closed by default", () => {
    // Real shape from the industry_grid block, including the new count.
    const html = render(
      [
        { title: "Construction", href: "/industries/construction", deploymentCount: "18,400+" },
        { title: "Hospitality", href: "/industries/hospitality" },
      ],
      "Industries"
    );
    // Both entries are listed by name...
    expect(html).toContain("Construction");
    expect(html).toContain("Hospitality");
    // ...and neither one's fields are rendered until it is expanded.
    expect(html).not.toContain('value="18,400+"');
    expect(html).not.toContain("Deployment Count");
  });

  it("names a collapsed row by its title, not by its longest text", () => {
    // Regression: rows were named with "the first non-empty string", so an entry
    // stored as { desc, title } was labelled with its own description.
    const html = render(
      [{ desc: "By enforcing zero-fee recruitment, workers retain 100% of their earnings.", title: "Economic Independence" }],
      "Pillars"
    );
    expect(html).toContain("Economic Independence");
  });

  it("renders arrays of plain strings", () => {
    const html = render(["First paragraph.", "Second paragraph."], "Paragraphs");
    expect(html).toContain('value="First paragraph."');
    expect(html).toContain('value="Second paragraph."');
  });

  it("does not fall back to a raw JSON textarea", () => {
    const html = render([{ title: "A" }], "Items");
    expect(html).not.toContain("Array editing is simplified");
    expect(html).not.toContain("&quot;title&quot;");
  });

  it("labels a generic array with its parent's name", () => {
    // `pillars.items` reads as "Pillars", not "Items".
    const html = renderToStaticMarkup(
      <ContentFieldEditor
        label="Pillars"
        fieldKey="pillars"
        value={{ eyebrow: "Our Impact", items: [{ title: "Economic Independence" }] }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Pillars");
    expect(html).not.toContain(">Items<");
  });

  it("unwraps an object that only wraps one array", () => {
    const html = renderToStaticMarkup(
      <ContentFieldEditor
        label="Pillars"
        fieldKey="pillars"
        value={{ items: [{ title: "Economic Independence" }] }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Pillars");
    expect(html).not.toContain("<fieldset");
  });
});

describe("blankFrom", () => {
  it("preserves shape and types when adding an array entry", () => {
    expect(blankFrom({ title: "Construction", count: 3, live: true, tags: ["a"] })).toEqual({
      title: "",
      count: 0,
      live: false,
      tags: [],
    });
  });

  it("falls back to a string for empty arrays", () => {
    expect(blankFrom(undefined)).toBe("");
  });
});

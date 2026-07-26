import { describe, expect, it } from "vitest";
import { decodeCopyEntities, mergePageCopy } from "./page-copy";

describe("decodeCopyEntities", () => {
  it("decodes the entities editors actually paste", () => {
    expect(decodeCopyEntities("Read Full Story &rarr;")).toBe("Read Full Story →");
    expect(decodeCopyEntities("Legal &amp; Compliance")).toBe("Legal & Compliance");
    expect(decodeCopyEntities("Wages &mdash; explained")).toBe("Wages — explained");
  });

  it("decodes numeric and hex references", () => {
    expect(decodeCopyEntities("&#8594;")).toBe("→");
    expect(decodeCopyEntities("&#x2192;")).toBe("→");
  });

  it("leaves unknown entities and bare ampersands untouched", () => {
    expect(decodeCopyEntities("&notarealentity;")).toBe("&notarealentity;");
    expect(decodeCopyEntities("Gulf & Europe")).toBe("Gulf & Europe");
    expect(decodeCopyEntities("100% & rising")).toBe("100% & rising");
  });

  it("does not mangle out-of-range numeric references", () => {
    expect(decodeCopyEntities("&#x110000;")).toBe("&#x110000;");
  });
});

describe("mergePageCopy", () => {
  const defaults = { readMoreLabel: "Read Full Story", nested: { heading: "Stories" } };

  it("decodes entities in stored copy so React does not render them literally", () => {
    expect(mergePageCopy(defaults, { readMoreLabel: "Read Full Story &rarr;" }).readMoreLabel)
      .toBe("Read Full Story →");
    expect(mergePageCopy(defaults, { nested: { heading: "Ethics &amp; Trust" } }).nested.heading)
      .toBe("Ethics & Trust");
  });

  it("still falls back for blank and absent values", () => {
    expect(mergePageCopy(defaults, { readMoreLabel: "   " }).readMoreLabel).toBe("Read Full Story");
    expect(mergePageCopy(defaults, {}).readMoreLabel).toBe("Read Full Story");
  });
});

import StarterKit from "@tiptap/starter-kit";
import { getSchema } from "@tiptap/core";
import { EditorState } from "@tiptap/pm/state";
import { describe, expect, it } from "vitest";
import { TEXT_STYLE_PRESETS } from "@/types/content";
import { BrandStyle, FontSize } from "./rich-text-extensions";

const schema = getSchema([StarterKit, BrandStyle, FontSize]);

describe("BrandStyle", () => {
  it.each(TEXT_STYLE_PRESETS)("serializes and reloads %s", (preset) => {
    const mark = schema.marks.brandStyle.create({ preset });
    const document = schema.node("doc", null, [
      schema.node("paragraph", null, [schema.text("Styled", [mark])]),
    ]);

    const restored = schema.nodeFromJSON(document.toJSON());
    expect(restored.toJSON()).toEqual(document.toJSON());
  });

  it("applies a preset to only the selected text without changing surrounding content", () => {
    const document = schema.node("doc", null, [schema.node("paragraph", null, [schema.text("Before selected after")])]);
    const state = EditorState.create({ schema, doc: document });
    const mark = schema.marks.brandStyle.create({ preset: "gold-emphasis" });
    const next = state.apply(state.tr.addMark(8, 16, mark)).doc.toJSON();

    expect(next.content?.[0].content).toEqual([
      { type: "text", text: "Before " },
      { type: "text", marks: [{ type: "brandStyle", attrs: { preset: "gold-emphasis" } }], text: "selected" },
      { type: "text", text: " after" },
    ]);
  });

  it("preserves marks inside headings, lists, and blockquotes", () => {
    const mark = schema.marks.brandStyle.create({ preset: "editorial-italic-gold" });
    const document = schema.node("doc", null, [
      schema.node("heading", { level: 2 }, [schema.text("Heading", [mark])]),
      schema.node("bulletList", null, [schema.node("listItem", null, [schema.node("paragraph", null, [schema.text("List", [mark])])])]),
      schema.node("blockquote", null, [schema.node("paragraph", null, [schema.text("Quote", [mark])])]),
    ]);

    expect(schema.nodeFromJSON(document.toJSON()).toJSON()).toEqual(document.toJSON());
  });
});

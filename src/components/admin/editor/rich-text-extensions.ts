import { Mark } from "@tiptap/core";
import type { TextStylePreset } from "@/types/content";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    brandStyle: {
      setBrandStyle: (preset: TextStylePreset) => ReturnType;
      removeBrandStyle: () => ReturnType;
    };
    fontSize: {
      setFontSize: (sizeClass: string) => ReturnType;
      removeFontSize: () => ReturnType;
    };
  }
}

export const BrandStyle = Mark.create({
  name: "brandStyle",
  addAttributes() {
    return {
      preset: {
        default: "default-body",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-style") || "default-body",
        renderHTML: (attributes: { preset?: string }) =>
          attributes.preset ? { "data-text-style": attributes.preset } : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-text-style]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setBrandStyle: (preset: TextStylePreset) => ({ commands }) =>
        commands.setMark("brandStyle", { preset }),
      removeBrandStyle: () => ({ commands }) =>
        commands.unsetMark("brandStyle"),
    };
  },
});

export const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      sizeClass: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-font-size"),
        renderHTML: (attributes: { sizeClass?: string }) =>
          attributes.sizeClass ? { "data-font-size": attributes.sizeClass } : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-font-size]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize: (sizeClass: string) => ({ commands }) =>
        commands.setMark("fontSize", { sizeClass }),
      removeFontSize: () => ({ commands }) =>
        commands.unsetMark("fontSize"),
    };
  },
});

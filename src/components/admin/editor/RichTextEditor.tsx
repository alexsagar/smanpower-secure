"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension, Mark } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Heading2,
  Heading3
} from "lucide-react";
import type { TiptapContent, TextStylePreset } from "@/types/content";

// Custom extension to handle our brand style presets
const BrandStyle = Mark.create({
  name: 'brandStyle',
  
  addAttributes() {
    return {
      preset: {
        default: 'default-body',
        parseHTML: (element: any) => element.getAttribute('data-text-style'),
        renderHTML: (attributes: any) => {
          if (!attributes.preset) return {};
          return { 'data-text-style': attributes.preset };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-text-style]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  
  addCommands() {
    return {
      setBrandStyle: (preset: TextStylePreset) => ({ commands }: { commands: any }) => {
        return commands.setMark('brandStyle', { preset });
      },
      removeBrandStyle: () => ({ commands }: { commands: any }) => {
        return commands.unsetMark('brandStyle');
      }
    } as any;
  }
});

const FontSize = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      sizeClass: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-font-size'),
        renderHTML: (attributes: any) => {
          if (!attributes.sizeClass) return {};
          return { 'data-font-size': attributes.sizeClass };
        }
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-font-size]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setFontSize: (sizeClass: string) => ({ commands }: { commands: any }) => {
        return commands.setMark('fontSize', { sizeClass });
      },
      removeFontSize: () => ({ commands }: { commands: any }) => {
        return commands.unsetMark('fontSize');
      }
    } as any;
  }
});

interface RichTextEditorProps {
  initialContent?: TiptapContent;
  onChange: (content: TiptapContent) => void;
  placeholder?: string;
}

export function RichTextEditor({ initialContent, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
      BrandStyle,
      FontSize
    ],
    content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapContent);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none min-h-[200px] max-w-none p-4",
      },
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !editor) {
    return <div className="min-h-[200px] border border-gray-200 rounded-md bg-gray-50 animate-pulse" />;
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
        
        {/* Font Size Dropdown */}
        <select
          className="text-sm border border-gray-300 rounded p-1.5 bg-white text-gray-700 font-medium w-28"
          onChange={(e) => {
            const size = e.target.value;
            if (!size) {
              (editor.chain().focus() as any).removeFontSize().run();
            } else {
              (editor.chain().focus() as any).setFontSize(size).run();
            }
          }}
          value={editor.getAttributes('fontSize').sizeClass || ''}
        >
          <option value="">Default Size</option>
          <option value="text-sm">Small</option>
          <option value="text-lg">Large</option>
          <option value="text-xl">Extra Large</option>
          <option value="text-3xl">Huge</option>
          <option value="text-5xl">Massive</option>
          <option value="text-7xl md:text-8xl">Hero Size</option>
          <option value="text-[6rem] md:text-[8rem] lg:text-[10rem]">Mega Size</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded ${editor.isActive("underline") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded ${editor.isActive("blockquote") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => {
            const url = window.prompt("URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            } else if (url === "") {
              editor.chain().focus().unsetLink().run();
            }
          }}
          className={`p-1.5 rounded ${editor.isActive("link") ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <select
          onChange={(e) => {
            const preset = e.target.value;
            if (preset === "default-body") {
              // @ts-ignore
              editor.chain().focus().removeBrandStyle().run();
            } else {
              // @ts-ignore
              editor.chain().focus().setBrandStyle(preset).run();
            }
          }}
          value={editor.getAttributes("brandStyle")?.preset || "default-body"}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-gold bg-white text-gray-700"
        >
          <option value="default-body">Default Body</option>
          <option value="gold-emphasis">Gold Highlight</option>
          <option value="editorial-italic-gold">Editorial Gold Italic</option>
          <option value="editorial-italic-light">Editorial Light Italic</option>
          <option value="white-emphasis">White Emphasis</option>
          <option value="muted-supporting">Muted Supporting Text</option>
          <option value="pull-quote">Pull Quote</option>
          <option value="small-eyebrow">Small Gold Eyebrow Label</option>
          <option value="cta-link-style">CTA Link Style</option>
        </select>
      </div>

      {/* Editor Content */}
      <div className="flex-1 cursor-text bg-white" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

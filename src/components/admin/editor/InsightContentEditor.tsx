"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Heading2,
  Heading3,
  ImagePlus,
} from "lucide-react";
import { MediaPicker } from "../MediaPicker";

/**
 * Rich-text editor for insight article bodies. Emits an HTML string into a
 * hidden input named `name`, so the existing form (which reads
 * formData.get("content")) and the public renderer (sanitizeHtml + prose)
 * work unchanged. Images are uploaded/selected via the shared MediaPicker.
 */
export function InsightContentEditor({
  name,
  initialHtml,
}: {
  name: string;
  initialHtml?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState(initialHtml || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, setEditorRevision] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: "Write your insight — add headings, images, lists and quotes…",
      }),
    ],
    content: initialHtml || "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    onSelectionUpdate: () => setEditorRevision((r) => r + 1),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base focus:outline-none min-h-[300px] max-w-none p-4 prose-img:rounded-sm",
      },
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !editor) {
    return <div className="min-h-[300px] border border-gray-200 rounded-md bg-gray-50 animate-pulse" />;
  }

  const ToolbarButton = ({
    active,
    onClick,
    icon: Icon,
    title,
  }: {
    active?: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded ${active ? "bg-gray-200 text-brand-black" : "text-gray-600 hover:bg-gray-200"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div>
      {/* The form reads this hidden field; the editor keeps it in sync as HTML. */}
      <input type="hidden" name={name} value={html} readOnly />

      <div className="rich-text-editor border border-gray-300 rounded-md overflow-hidden bg-white flex flex-col">
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} title="Bold" />
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} title="Italic" />
          <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={UnderlineIcon} title="Underline" />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} title="Heading 2" />
          <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} icon={Heading3} title="Heading 3" />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} title="Bullet List" />
          <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} title="Numbered List" />
          <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={Quote} title="Blockquote" />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton
            active={editor.isActive("link")}
            onClick={() => {
              const url = window.prompt("URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
              else if (url === "") editor.chain().focus().unsetLink().run();
            }}
            icon={LinkIcon}
            title="Link"
          />
          <ToolbarButton onClick={() => setPickerOpen(true)} icon={ImagePlus} title="Insert image" />
        </div>

        <div className="flex-1 cursor-text bg-white" onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allowedResourceTypes={["IMAGE"]}
        uploadPurpose="insight_image"
        onSelect={(media) => {
          editor.chain().focus().setImage({ src: media.fileUrl, alt: media.altText || "" }).run();
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

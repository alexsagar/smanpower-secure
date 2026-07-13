// ============================================================
// Rich Text Renderer
// ============================================================
// Recursively renders Tiptap JSON content into React elements.
// Preserves brand style presets and avoids dangerouslySetInnerHTML
// for better security and Server Component compatibility.
// ============================================================

import React from "react";
import type { TiptapContent, TiptapNode, TiptapMark } from "@/types/content";
import { getStyleForPreset } from "../admin/editor/style-presets";
import Link from "next/link";

interface RichTextRendererProps {
  content?: TiptapContent;
  className?: string;
}

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content || !content.content) return null;

  return (
    <div className={`rich-text-renderer ${className}`}>
      {content.content.map((node, index) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </div>
  );
}

function NodeRenderer({ node }: { node: TiptapNode }) {
  const children = node.content?.map((child, i) => (
    <NodeRenderer key={i} node={child} />
  ));

  switch (node.type) {
    case "paragraph":
      return <p className="mb-6 last:mb-0">{children}</p>;

    case "heading":
      const level = node.attrs?.level || 2;
      const HeadingTag = `h${level}` as React.ElementType;
      return <HeadingTag className="mb-4">{children}</HeadingTag>;

    case "bulletList":
      return <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>;

    case "orderedList":
      return <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>;

    case "listItem":
      return <li>{children}</li>;

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-brand-gold pl-4 py-1 mb-6 italic text-brand-charcoal/80">
          {children}
        </blockquote>
      );

    case "hardBreak":
      return <br />;

    case "text":
      if (!node.text) return null;
      let textElement: React.ReactNode = node.text;

      // Apply marks (bold, italic, links, brand styles)
      if (node.marks) {
        node.marks.forEach((mark) => {
          textElement = applyMark(textElement, mark);
        });
      }
      return textElement;

    default:
      // Fallback for unknown nodes
      console.warn(`Unknown node type: ${node.type}`);
      return <>{children}</>;
  }
}

function applyMark(textElement: React.ReactNode, mark: TiptapMark): React.ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong className="font-semibold">{textElement}</strong>;
    case "italic":
      return <em className="italic">{textElement}</em>;
    case "underline":
      return <u className="underline underline-offset-2">{textElement}</u>;
    case "link":
      const href = mark.attrs?.href as string;
      const target = mark.attrs?.target as string;
      const isInternal = href?.startsWith("/");
      
      if (isInternal) {
        return (
          <Link href={href} className="text-brand-gold hover:underline transition-all">
            {textElement}
          </Link>
        );
      }
      return (
        <a 
          href={href} 
          target={target || "_blank"} 
          rel="noopener noreferrer"
          className="text-brand-gold hover:underline transition-all"
        >
          {textElement}
        </a>
      );
    case "brandStyle":
      const preset = mark.attrs?.preset as string;
      const styleClass = getStyleForPreset(preset);
      return (
        <span className={styleClass} data-text-style={preset}>
          {textElement}
        </span>
      );
    case "fontSize":
      const sizeClass = mark.attrs?.sizeClass as string;
      return (
        <span className={sizeClass} data-font-size={sizeClass}>
          {textElement}
        </span>
      );
    default:
      return textElement;
  }
}

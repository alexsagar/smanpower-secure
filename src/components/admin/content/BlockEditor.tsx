"use client";

import React from "react";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import { MediaInput } from "@/components/admin/MediaInput";
import { ChevronLeft } from "lucide-react";
import { blockTypeLabel } from "@/lib/cms/block-labels";
import {
  ContentFieldEditor,
  humanizeKey,
  orderContentKeys,
} from "./ContentFieldEditor";

/**
 * Block types that carry a managed video placement alongside the section image.
 */
const MANAGED_VIDEO_BLOCK_TYPES = new Set(["image_text", "introduction"]);
const TESTIMONIAL_TEMPLATE = {
  quote: "Placeholder testimonial - replace in CMS before production.",
  companyLogo: "",
  personName: "",
  designation: "",
  companyName: "",
  country: "",
  isPublished: false,
};

export function BlockEditor({
  block,
  onChange,
  onBack,
}: {
  block: any;
  onChange: (block: any) => void;
  onBack: () => void;
}) {
  const supportsManagedVideo = MANAGED_VIDEO_BLOCK_TYPES.has(block.blockType);
  const rawContent: Record<string, unknown> =
    block.content && typeof block.content === "object" ? block.content : {};
  const isEmployerTestimonials = block.blockType === "testimonial" || block.blockKey === "home-community";
  const isImageGallery = block.blockType === "image_gallery";
  const content: Record<string, unknown> = isImageGallery
    ? {
        items: Array.isArray(rawContent.items) && rawContent.items.length
          ? rawContent.items.map((item) => {
              const value = item && typeof item === "object" ? item as Record<string, unknown> : {};
              return { title: typeof value.title === "string" ? value.title : typeof value.caption === "string" ? value.caption : "", imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : "" };
            })
          : [{ title: "", imageUrl: "" }],
      }
    : isEmployerTestimonials
    ? {
        eyebrow: rawContent.eyebrow === "Ethical Commitment" ? "Foreign Employer Testimonials" : rawContent.eyebrow || "Foreign Employer Testimonials",
        heading: rawContent.heading || "Trusted by International Employers",
        introduction: rawContent.introduction || "",
        testimonials: Array.isArray(rawContent.testimonials) && rawContent.testimonials.length > 0 ? rawContent.testimonials : [TESTIMONIAL_TEMPLATE],
      }
    : rawContent;
  const updateContent = (key: string, value: unknown) => {
    onChange({ ...block, content: { ...content, [key]: value } });
  };
  const contentKeys = orderContentKeys(content);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* Non-sticky header: the admin `<main>` is the single scroll container,
          so a sticky header here would float over unrelated content and add a
          second scrollbar. It scrolls naturally above its own fields instead. */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold">{isEmployerTestimonials ? "Employer Testimonials" : blockTypeLabel(block.blockType)}</h3>
      </div>
      <div className="p-6 space-y-6">

        {/* Managed media placements (dedicated columns, not block content) */}
        {block.imageId !== undefined && (
          <MediaInput
            label="Section Image"
            value={block.imageId}
            onChange={(id) => onChange({ ...block, imageId: id })}
            allowedResourceTypes={["IMAGE"]}
            uploadPurpose="cms_image"
          />
        )}

        {supportsManagedVideo && (
          <MediaInput
            label="Section Video"
            value={block.videoId}
            onChange={(id) => onChange({ ...block, videoId: id })}
            allowedResourceTypes={["VIDEO"]}
            uploadPurpose="cms_video"
            helperText="Below-the-fold videos render with controls and do not autoplay."
          />
        )}

        {supportsManagedVideo && (
          <MediaInput
            label="Video Poster Image"
            value={block.posterImageId}
            onChange={(id) => onChange({ ...block, posterImageId: id })}
            allowedResourceTypes={["IMAGE"]}
            uploadPurpose="cms_poster_image"
          />
        )}

        {supportsManagedVideo && (
          <MediaInput
            label="Mobile Fallback Image"
            value={block.mobileImageId}
            onChange={(id) => onChange({ ...block, mobileImageId: id })}
            allowedResourceTypes={["IMAGE"]}
            uploadPurpose="cms_mobile_image"
          />
        )}

        {block.richHeading !== undefined && !isEmployerTestimonials && (
          <div>
            <label className="block text-sm font-semibold mb-2">Section Heading</label>
            <RichTextEditor
              initialContent={block.richHeading}
              onChange={(c) => onChange({ ...block, richHeading: c })}
            />
          </div>
        )}

        {/*
          Every remaining content field is rendered generically by value type.
          No field-name allow-list: new CMS fields appear here automatically.
        */}
        {contentKeys.map((key) => (
          <ContentFieldEditor
            key={key}
            label={humanizeKey(key)}
            fieldKey={key}
            value={content[key]}
            onChange={(next) => updateContent(key, next)}
          />
        ))}

        {contentKeys.length === 0 && (
          <p className="text-sm text-gray-500">
            This block has no editable content fields. Its content is supplied by the
            section itself or by a managed collection.
          </p>
        )}
      </div>
    </div>
  );
}

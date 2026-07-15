import React from "react";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import { MediaInput } from "@/components/admin/MediaInput";
import { ChevronLeft } from "lucide-react";

export function HeroEditor({ hero, onChange, onBack }: { hero: any, onChange: (hero: any) => void, onBack: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold">Edit Hero Section</h3>
      </div>
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        
        <div>
          <label className="block text-sm font-semibold mb-2">Eyebrow</label>
          <input 
            type="text" 
            value={hero.eyebrow || ""} 
            onChange={(e) => onChange({ ...hero, eyebrow: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <MediaInput 
          label="Hero Image"
          value={hero.imageId} 
          onChange={(id) => onChange({ ...hero, imageId: id })}
          allowedResourceTypes={["IMAGE"]}
          uploadPurpose="cms_image"
          helperText="Use for image-only heroes or as a desktop fallback when no poster image is set."
        />

        <MediaInput
          label="Hero Video"
          value={hero.videoId}
          onChange={(id) => onChange({ ...hero, videoId: id })}
          allowedResourceTypes={["VIDEO"]}
          uploadPurpose="cms_video"
          helperText="Managed videos only. Public pages reject documents and private assets."
        />

        <MediaInput
          label="Hero Poster Image"
          value={hero.posterImageId}
          onChange={(id) => onChange({ ...hero, posterImageId: id })}
          allowedResourceTypes={["IMAGE"]}
          uploadPurpose="cms_poster_image"
          helperText="Recommended for all hero videos and used as the reduced-motion fallback."
        />

        <MediaInput
          label="Hero Mobile Fallback Image"
          value={hero.mobileImageId}
          onChange={(id) => onChange({ ...hero, mobileImageId: id })}
          allowedResourceTypes={["IMAGE"]}
          uploadPurpose="cms_mobile_image"
          helperText="Shown on smaller screens instead of autoplaying background video."
        />

        <div>
          <label className="block text-sm font-semibold mb-2">Heading (Rich Text)</label>
          <RichTextEditor 
            initialContent={hero.richHeading} 
            onChange={(content) => onChange({ ...hero, richHeading: content })} 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description (Rich Text)</label>
          <RichTextEditor 
            initialContent={hero.richDescription} 
            onChange={(content) => onChange({ ...hero, richDescription: content })} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Primary CTA Text</label>
            <input 
              type="text" 
              value={hero.primaryCtaText || ""} 
              onChange={(e) => onChange({ ...hero, primaryCtaText: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Primary CTA Link</label>
            <input 
              type="text" 
              value={hero.primaryCtaHref || ""} 
              onChange={(e) => onChange({ ...hero, primaryCtaHref: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

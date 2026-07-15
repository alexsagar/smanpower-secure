import React from "react";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import { MediaInput } from "@/components/admin/MediaInput";
import { ChevronLeft } from "lucide-react";

export function BlockEditor({ block, onChange, onBack }: { block: any, onChange: (block: any) => void, onBack: () => void }) {
  const updateContent = (key: string, value: any) => {
    onChange({ ...block, content: { ...block.content, [key]: value } });
  };
  const supportsManagedVideo = block.blockType === "image_text" || block.blockType === "introduction";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full max-h-[700px]">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold capitalize">{block.blockType.replace(/([A-Z])/g, ' $1').trim()} Editor</h3>
      </div>
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        
        {/* Universal Fields */}
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

        {block.richHeading !== undefined && (
          <div>
            <label className="block text-sm font-semibold mb-2">Section Heading</label>
            <RichTextEditor 
              initialContent={block.richHeading} 
              onChange={(c) => onChange({ ...block, richHeading: c })} 
            />
          </div>
        )}

        {/* Dynamic Fields based on Content */}
        {block.content && Object.keys(block.content).map(key => {
          const val = block.content[key];
          
          if (typeof val === "string" && (key === "title" || key === "subtitle" || key === "description" || key.includes("Text"))) {
            return (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input 
                  type="text" 
                  value={val} 
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            );
          }

          if (typeof val === "boolean") {
            return (
              <div key={key} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={val} 
                  onChange={(e) => updateContent(key, e.target.checked)}
                />
                <label className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              </div>
            );
          }
          
          if (Array.isArray(val)) {
            return (
              <div key={key} className="p-4 border border-gray-200 rounded bg-gray-50">
                <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                <p className="text-xs text-gray-500 mb-2">Array editing is simplified for this demo.</p>
                <textarea 
                  value={JSON.stringify(val, null, 2)}
                  onChange={(e) => {
                    try {
                      updateContent(key, JSON.parse(e.target.value));
                    } catch(e) {}
                  }}
                  className="w-full p-2 text-xs font-mono border border-gray-300 rounded"
                  rows={5}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

import React from "react";
import type { CmsContentBlock } from "@/types/content";

export function FinalCTABlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void block;
  void lang;

  // The FinalCTABlock is disabled because the redesigned Global Footer
  // now inherently acts as the final CTA for every page.
  // Returning null preserves CMS data compatibility without causing duplicate CTAs.
  return null;
}

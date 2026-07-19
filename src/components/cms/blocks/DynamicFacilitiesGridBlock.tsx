import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { getTrainingFacilities } from "@/services/facilities.service";
import { DynamicFacilitiesGridRenderer } from "./DynamicFacilitiesGridRenderer";

export async function DynamicFacilitiesGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const dbFacilities = await getTrainingFacilities();
  return <DynamicFacilitiesGridRenderer block={block} facilities={dbFacilities} />;
}

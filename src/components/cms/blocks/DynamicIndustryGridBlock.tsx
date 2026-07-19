import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { getIndustries } from "@/services/industries.service";
import { DynamicIndustryGridRenderer } from "./DynamicIndustryGridRenderer";

export async function DynamicIndustryGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const dbIndustries = await getIndustries();
  return <DynamicIndustryGridRenderer block={block} industries={dbIndustries} />;
}

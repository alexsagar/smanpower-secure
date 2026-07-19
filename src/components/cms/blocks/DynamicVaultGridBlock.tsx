import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { getComplianceDocuments } from "@/services/compliance.service";
import { DynamicVaultGridRenderer } from "./DynamicVaultGridRenderer";

export async function DynamicVaultGridBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const complianceDocs = await getComplianceDocuments();
  return <DynamicVaultGridRenderer block={block} documents={complianceDocs} />;
}

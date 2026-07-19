import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { getClientPartners } from "@/repositories/content-resolver";
import { ClientMarqueeRenderer } from "./ClientMarqueeRenderer";

export async function ClientMarqueeBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  void lang;
  const publishedPartners = await getClientPartners();

  const clients = publishedPartners.filter((partner) => partner.type !== "group_company");
  const groups = publishedPartners.filter((partner) => partner.type === "group_company");

  if (clients.length === 0 && groups.length === 0) {
    return null;
  }

  return <ClientMarqueeRenderer block={block} clients={clients} groups={groups} />;
}

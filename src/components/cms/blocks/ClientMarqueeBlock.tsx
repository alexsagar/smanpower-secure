import React from "react";
import type { CmsContentBlock } from "@/types/content";
import { prisma } from "@/lib/prisma";
import { ClientMarqueeRenderer } from "./ClientMarqueeRenderer";

export async function ClientMarqueeBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  // Fetch published partners sorted by order
  const publishedPartners = await prisma.clientPartner.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' }
  });

  // Separate them based on the new category enum
  const clients = publishedPartners.filter(p => p.category === 'CLIENT' || p.category === 'PARTNER' || p.category === 'EMPLOYER');
  const groups = publishedPartners.filter(p => p.category === 'GROUP_COMPANY');

  // If there are no published partners at all, hide the block safely
  if (clients.length === 0 && groups.length === 0) {
    return null;
  }

  return <ClientMarqueeRenderer block={block} clients={clients} groups={groups} />;
}

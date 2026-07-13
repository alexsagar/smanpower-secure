"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission, SEO_PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { ALLOWED_SEO_PATHS } from "@/lib/seo-paths";

export async function saveSeoPageMeta(data: {
  pagePath: string;
  lang: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  // Basic update permission required
  await requirePermission(SEO_PERMISSIONS.UPDATE);

  if (!ALLOWED_SEO_PATHS.includes(data.pagePath)) {
    throw new Error(`Path ${data.pagePath} is not allowed for SEO edits.`);
  }

  // Fetch existing to compare
  const existing = await prisma.sEOPageMeta.findUnique({
    where: { pagePath_lang: { pagePath: data.pagePath, lang: data.lang } },
  });

  // Check canonical override permissions
  if (data.canonicalUrl !== undefined && data.canonicalUrl !== existing?.canonicalUrl) {
    await requirePermission(SEO_PERMISSIONS.MANAGE_CANONICAL);
    if (data.canonicalUrl) {
      if (data.canonicalUrl.includes("localhost") || data.canonicalUrl.includes("javascript:")) {
        throw new Error("Invalid canonical URL.");
      }
      try {
        new URL(data.canonicalUrl);
      } catch {
        throw new Error("Malformed canonical URL.");
      }
    }
  }

  // Check noIndex override permissions
  if (data.noIndex !== undefined && data.noIndex !== existing?.noIndex) {
    await requirePermission(SEO_PERMISSIONS.MANAGE_NOINDEX);
  }

  const updatedData = {
    ...data,
    noIndex: data.noIndex ?? false,
  };

  const record = await prisma.sEOPageMeta.upsert({
    where: { pagePath_lang: { pagePath: data.pagePath, lang: data.lang } },
    update: updatedData,
    create: updatedData,
  });

  // Audit Log
  const changes = Object.keys(updatedData).filter(
    (key) => (updatedData as any)[key] !== (existing as any)?.[key]
  );
  
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "update_seo",
      entity: "SEOPageMeta",
      entityId: record.id,
      details: {
        pagePath: data.pagePath,
        lang: data.lang,
        changedFields: changes,
      },
    },
  });

  // Revalidate
  const route = data.pagePath === "/" ? `/${data.lang}` : `/${data.lang}${data.pagePath}`;
  revalidatePath(route);

  return { success: true, record };
}

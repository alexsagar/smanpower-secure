import React from "react";
import { AiSummarySettingsForm } from "./AiSummarySettingsForm";
import { PrismaContentRepository } from "@/repositories/prisma-content-repository";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import { Metadata } from "next";
import { CertificationLogosSettingsForm } from "./CertificationLogosSettingsForm";
import { SocialLinksSettingsForm } from "./SocialLinksSettingsForm";
import { prisma } from "@/lib/prisma";
import type { CmsSocialLink } from "@/types/content";

export const metadata: Metadata = {
  title: "Footer Settings | Admin",
};

// The public loader drops disabled links, so the editor reads the raw setting
// to keep every link (including disabled ones) editable.
async function getEditableSocialLinks(): Promise<CmsSocialLink[]> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "footer_social_links" } });
  const value = setting?.value;
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index): CmsSocialLink | null => {
      const record = (entry ?? {}) as Record<string, unknown>;
      const platform = typeof record.platform === "string" ? record.platform.toLowerCase() : "";
      const label = typeof record.label === "string" ? record.label : "";
      const url = typeof record.url === "string" ? record.url : "";
      if (!platform || !url) return null;
      return {
        platform,
        label: label || platform,
        url,
        isActive: typeof record.isActive === "boolean" ? record.isActive : true,
        order: typeof record.order === "number" ? record.order : index + 1,
      };
    })
    .filter((link): link is CmsSocialLink => Boolean(link))
    .sort((a, b) => a.order - b.order);
}

export default async function FooterSettingsPage() {
  await requirePermission(SETTINGS_PERMISSIONS.VIEW);

  const repo = new PrismaContentRepository();
  const settings = await repo.getFooterSettings();
  const socialLinks = await getEditableSocialLinks();

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Footer Settings</h1>
      
      <div className="bg-white rounded border border-neutral-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Explore AI Summary</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Configure the AI services shown in the footer for summarizing the company website.
        </p>
        
        <AiSummarySettingsForm initialData={settings.aiSummary} />
      </div>

      <div className="bg-white rounded border border-neutral-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Social Links</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Manage the social-media links shown in the footer. Only enabled links appear on the public site.
        </p>
        <SocialLinksSettingsForm initialData={socialLinks} />
      </div>

      <div className="bg-white rounded border border-neutral-200 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Certification Logos</h2>
        <p className="text-sm text-neutral-600 mb-6">Manage the certification and compliance logos shown in the footer.</p>
        <CertificationLogosSettingsForm initialData={settings.certificationLogos} />
      </div>
    </div>
  );
}

import React from "react";
import { AiSummarySettingsForm } from "./AiSummarySettingsForm";
import { PrismaContentRepository } from "@/repositories/prisma-content-repository";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import { Metadata } from "next";
import { CertificationLogosSettingsForm } from "./CertificationLogosSettingsForm";

export const metadata: Metadata = {
  title: "Footer Settings | Admin",
};

export default async function FooterSettingsPage() {
  await requirePermission(SETTINGS_PERMISSIONS.VIEW);

  const repo = new PrismaContentRepository();
  const settings = await repo.getFooterSettings();

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

      <div className="bg-white rounded border border-neutral-200 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Certification Logos</h2>
        <p className="text-sm text-neutral-600 mb-6">Manage the certification and compliance logos shown in the footer.</p>
        <CertificationLogosSettingsForm initialData={settings.certificationLogos} />
      </div>
    </div>
  );
}

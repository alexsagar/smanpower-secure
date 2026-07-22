"use client";

import React from "react";
import { AiBrandIcon } from "./AiBrandIcon";
import { CmsAiSummarySettings } from "@/types/content";
import { generateAiServiceUrl, getOrderedServices } from "@/lib/ai-prompt";

interface AiSummaryFooterSectionProps {
  settings?: CmsAiSummarySettings;
  basePrompt: string;
}

export function AiSummaryFooterSection({ settings, basePrompt }: AiSummaryFooterSectionProps) {
  if (!settings) return null;
  const orderedServices = getOrderedServices(settings);
  if (orderedServices.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-8">
      <h4 className="font-brand text-sm font-semibold uppercase tracking-widest text-brand-white/55">
        {settings.heading || "Explore AI Summary"}
      </h4>
      <div className="flex items-center gap-4">
        {orderedServices.map((service) => {
          const serviceName = service.id.charAt(0).toUpperCase() + service.id.slice(1);

          const url = generateAiServiceUrl(service.id, basePrompt);
          const iconLabel = `Explore Seven Seas with ${serviceName}`;
          return (
            <a
              key={service.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-brand-gold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-charcoal rounded"
              title={iconLabel}
            >
              <span className="sr-only">{iconLabel}</span>
              <AiBrandIcon serviceId={service.id} className="w-6 h-6" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

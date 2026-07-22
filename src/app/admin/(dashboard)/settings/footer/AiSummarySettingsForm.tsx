"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAiSummaryConfigAction, AiSummaryConfigInput } from "@/actions/settings";
import { CmsAiSummarySettings, AiServiceId } from "@/types/content";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
// We use a basic sortable list here or just up/down arrows for simplicity.
// For brevity, we will just map over them and allow basic reordering.

interface AiSummarySettingsFormProps {
  initialData?: CmsAiSummarySettings;
}

const DEFAULT_SERVICES: AiSummaryConfigInput["services"] = [
  { id: "chatgpt", enabled: true, order: 1 },
  { id: "gemini", enabled: true, order: 2 },
  { id: "claude", enabled: true, order: 3 },
  { id: "perplexity", enabled: true, order: 4 },
];

export function AiSummarySettingsForm({ initialData }: AiSummarySettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [heading, setHeading] = useState(initialData?.heading || "Explore AI Summary");
  const [companyUrl, setCompanyUrl] = useState(initialData?.companyUrl || "https://smanpower.com/");
  const [basePrompt, setBasePrompt] = useState(
    initialData?.basePrompt ||
    "Summarize and analyze the key information, services, ethical recruitment practices, industries, compliance standards, employer solutions, and contact details from Seven Seas Intercontinental."
  );
  const [services, setServices] = useState<AiSummaryConfigInput["services"]>(
    initialData?.services || DEFAULT_SERVICES
  );

  const handleToggle = (id: AiServiceId) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    const temp = newServices[index - 1].order;
    newServices[index - 1].order = newServices[index].order;
    newServices[index].order = temp;
    setServices(newServices.sort((a, b) => a.order - b.order));
  };

  const moveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    const temp = newServices[index + 1].order;
    newServices[index + 1].order = newServices[index].order;
    newServices[index].order = temp;
    setServices(newServices.sort((a, b) => a.order - b.order));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveAiSummaryConfigAction({
        heading,
        companyUrl,
        basePrompt,
        services,
      });

      if (result.success) {
        toast.success("AI Summary settings saved");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <label htmlFor="heading" className="text-sm font-medium">Section Heading</label>
        <input
          id="heading"
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          required
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="companyUrl" className="text-sm font-medium">Company URL</label>
        <input
          id="companyUrl"
          type="url"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          required
          placeholder="https://smanpower.com/"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <p className="text-xs text-neutral-500">Must be a valid HTTPS URL.</p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="basePrompt" className="text-sm font-medium">Base Prompt</label>
        <textarea
          id="basePrompt"
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          required
          rows={4}
          maxLength={1000}
          className="border rounded px-3 py-2 text-sm w-full max-w-xl"
        />
        <p className="text-xs text-neutral-500">{basePrompt.length} / 1000 characters</p>
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">AI Services</label>
        <div className="border rounded divide-y max-w-md">
          {services.map((service, index) => (
            <div key={service.id} className="flex items-center gap-3 p-3 bg-neutral-50/50">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === services.length - 1}
                  className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <input
                type="checkbox"
                checked={service.enabled}
                onChange={() => handleToggle(service.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium capitalize">
                {service.id === "gemini" ? "Google Gemini" : service.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          type="submit"
          disabled={isPending}
          className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveFooterSocialLinksAction } from "@/actions/settings";
import { FOOTER_SOCIAL_PLATFORMS } from "@/lib/footer-social";
import type { CmsSocialLink } from "@/types/content";

const defaults: CmsSocialLink[] = [
  { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/", isActive: true, order: 1 },
];

export function SocialLinksSettingsForm({ initialData }: { initialData?: CmsSocialLink[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState<CmsSocialLink[]>(() =>
    [...(initialData?.length ? initialData : defaults)].sort((a, b) => a.order - b.order),
  );

  const update = (index: number, patch: Partial<CmsSocialLink>) => {
    setLinks((current) => current.map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    setLinks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((link, itemIndex) => ({ ...link, order: itemIndex + 1 }));
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const payload = links
            .filter((link) => link.url.trim() && link.label.trim())
            .map((link, index) => ({ ...link, order: index + 1 }));
          const result = await saveFooterSocialLinksAction(payload);
          if (result.success) {
            toast.success("Social links saved");
            router.refresh();
          } else {
            toast.error(result.error || "Failed to save social links");
          }
        });
      }}
      className="space-y-5"
    >
      {links.map((link, index) => (
        <fieldset key={index} className="border border-neutral-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={link.isActive} onChange={() => update(index, { isActive: !link.isActive })} />
              Enabled
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move link earlier" className="p-1 disabled:opacity-30"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === links.length - 1} aria-label="Move link later" className="p-1 disabled:opacity-30"><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Delete link" className="p-1 text-red-700"><Trash2 className="size-4" /></button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium">
              Platform
              <select
                value={link.platform}
                onChange={(event) => update(index, { platform: event.target.value })}
                className="border px-3 py-2 text-sm capitalize"
              >
                {FOOTER_SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform} className="capitalize">{platform}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Accessible label
              <input required value={link.label} onChange={(event) => update(index, { label: event.target.value })} className="border px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              URL (HTTPS)
              <input required type="url" value={link.url} onChange={(event) => update(index, { url: event.target.value })} className="border px-3 py-2 text-sm" placeholder="https://" />
            </label>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() =>
          setLinks((current) => [
            ...current,
            { platform: "linkedin", label: "", url: "", isActive: true, order: Math.max(0, ...current.map((link) => link.order)) + 1 },
          ])
        }
        className="inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium"
      >
        <Plus className="size-4" /> Add social link
      </button>
      <div className="border-t pt-4">
        <button type="submit" disabled={isPending} className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isPending ? "Saving..." : "Save social links"}
        </button>
      </div>
    </form>
  );
}

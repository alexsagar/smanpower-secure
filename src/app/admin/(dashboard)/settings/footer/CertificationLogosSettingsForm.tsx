"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MediaInput } from "@/components/admin/MediaInput";
import { saveFooterCertificationLogosAction } from "@/actions/settings";
import type { CmsFooterCertificationLogo } from "@/types/content";

const defaults: CmsFooterCertificationLogo[] = [
  { imageUrl: "/images/sedex.png", accessibleName: "Sedex", enabled: true, order: 1 },
  { imageUrl: "/images/rba.png", accessibleName: "Responsible Business Alliance", enabled: true, order: 2 },
  { imageUrl: "/images/iso.png", accessibleName: "ISO 9001:2015 Certified", enabled: true, order: 3 },
];

export function CertificationLogosSettingsForm({ initialData }: { initialData?: CmsFooterCertificationLogo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logos, setLogos] = useState(() => [...(initialData?.length ? initialData : defaults)].sort((a, b) => a.order - b.order));

  const update = (index: number, patch: Partial<CmsFooterCertificationLogo>) => {
    setLogos((current) => current.map((logo, itemIndex) => itemIndex === index ? { ...logo, ...patch } : logo));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= logos.length) return;
    setLogos((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((logo, itemIndex) => ({ ...logo, order: itemIndex + 1 }));
    });
  };

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      startTransition(async () => {
        const result = await saveFooterCertificationLogosAction(
          logos.filter((logo) => logo.imageUrl.trim())
        );
        if (result.success) {
          toast.success("Certification logos saved");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to save certification logos");
        }
      });
    }} className="space-y-5">
      {logos.map((logo, index) => (
        <fieldset key={logo.order} className="border border-neutral-200 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={logo.enabled} onChange={() => update(index, { enabled: !logo.enabled })} />
              Enabled
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move logo earlier" className="p-1 disabled:opacity-30"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === logos.length - 1} aria-label="Move logo later" className="p-1 disabled:opacity-30"><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => setLogos((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Delete logo" className="p-1 text-red-700"><Trash2 className="size-4" /></button>
            </div>
          </div>
          <MediaInput value={logo.imageUrl} onChange={(_, imageUrl) => update(index, { imageUrl })} label="Logo image" allowedResourceTypes={["IMAGE"]} uploadPurpose="partner_logo" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">Accessible name<input required value={logo.accessibleName} onChange={(event) => update(index, { accessibleName: event.target.value })} className="border px-3 py-2 text-sm" /></label>
            <label className="grid gap-1 text-sm font-medium">Optional HTTPS link<input type="url" value={logo.href || ""} onChange={(event) => update(index, { href: event.target.value })} className="border px-3 py-2 text-sm" /></label>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => setLogos((current) => [...current, { imageUrl: "", accessibleName: "", enabled: true, order: Math.max(0, ...current.map((logo) => logo.order)) + 1 }])} className="inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium"><Plus className="size-4" /> Add logo</button>
      <div className="border-t pt-4"><button type="submit" disabled={isPending} className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isPending ? "Saving..." : "Save certification logos"}</button></div>
    </form>
  );
}

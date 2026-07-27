"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGalleryPageAction } from "@/actions/content";

export function GalleryPageSetup() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return <button type="button" onClick={() => startTransition(async () => { await createGalleryPageAction(); router.refresh(); })} disabled={pending} className="rounded-lg border border-brand-gold bg-white px-4 py-2 text-sm font-semibold text-brand-black hover:bg-brand-gold disabled:opacity-50">{pending ? "Creating…" : "Create gallery"}</button>;
}

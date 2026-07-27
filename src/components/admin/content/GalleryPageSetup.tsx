"use client";

import { useTransition } from "react";
import { createGalleryPageAction } from "@/actions/content";

export function GalleryPageSetup() {
  const [pending, startTransition] = useTransition();
  return <button type="button" onClick={() => startTransition(() => void createGalleryPageAction())} disabled={pending} className="rounded-lg border border-brand-gold bg-white px-4 py-2 text-sm font-semibold text-brand-black hover:bg-brand-gold disabled:opacity-50">{pending ? "Creating…" : "Create gallery"}</button>;
}

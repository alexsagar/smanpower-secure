import type { CmsContentBlock } from "@/types/content";
import { GalleryViewer } from "./GalleryViewer";

type GalleryItem = { imageUrl?: string; title?: string; caption?: string };

export function ImageGalleryBlock({ block }: { block: CmsContentBlock }) {
  const items = ((block.content?.items as GalleryItem[] | undefined) ?? [])
    .filter((item): item is GalleryItem & { imageUrl: string } => Boolean(item.imageUrl?.trim()))
    .map((item) => ({ imageUrl: item.imageUrl, title: item.title?.trim() || item.caption?.trim() }));

  if (!items.length) return null;

  return (
    <section className="bg-brand-off-white py-8 sm:py-12">
      <GalleryViewer items={items} />
    </section>
  );
}

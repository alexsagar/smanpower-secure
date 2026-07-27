import Image from "next/image";
import type { CmsContentBlock } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

type GalleryItem = { imageUrl?: string; title?: string; caption?: string };

export function ImageGalleryBlock({ block }: { block: CmsContentBlock }) {
  const items = ((block.content?.items as GalleryItem[] | undefined) ?? []).filter((item) => item.imageUrl?.trim());

  if (!items.length) return null;

  return (
    <section className="bg-brand-off-white py-8 sm:py-12">
      <div className="container-wide mx-auto grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const title = item.title?.trim() || item.caption?.trim() || "Gallery image";

          return (
            <figure key={`${item.imageUrl}-${index}`} className="overflow-hidden bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={getCloudinaryImageUrl(item.imageUrl!, { width: 960, height: 720 })} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
              {item.title?.trim() || item.caption?.trim() ? <figcaption className="px-3 py-2 text-xs text-brand-charcoal">{title}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

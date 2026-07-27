import Image from "next/image";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";
import type { CmsContentBlock } from "@/types/content";

type GalleryItem = { imageUrl?: string; caption?: string };

export function ImageGalleryBlock({ block }: { block: CmsContentBlock }) {
  const content = block.content as { items?: GalleryItem[] };
  const items = (content.items || []).filter((item) => item.imageUrl?.trim());

  if (!items.length) return null;

  return (
    <section aria-label="Gallery" className="bg-brand-off-white py-16 lg:py-24">
      <div className="container-wide mx-auto grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {items.map((item, index) => (
          <figure key={`${item.imageUrl}-${index}`} className="overflow-hidden bg-brand-white">
            <div className="relative aspect-[4/3]">
              <Image
                src={getCloudinaryImageUrl(item.imageUrl!, { width: 1200, height: 900 })}
                alt={item.caption || "Gallery image"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            {item.caption ? <figcaption className="p-4 text-sm text-brand-charcoal">{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

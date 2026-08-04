import type { CmsContentBlock } from "@/types/content";
import { GalleryViewer } from "./GalleryViewer";
import { publishableGalleryAlbums } from "@/lib/cms/gallery-albums";

export function ImageGalleryBlock({ block }: { block: CmsContentBlock }) {
  const albums = publishableGalleryAlbums(block.content);

  if (!albums.length) return null;

  return (
    <section className="bg-brand-off-white py-8 sm:py-12">
      {/* Each album keeps its own viewer, so lightbox paging stays inside the
          album the reader opened rather than running through the whole page. */}
      <div className="container-wide mx-auto grid grid-cols-1 gap-8 px-6 md:grid-cols-2 xl:grid-cols-3">
        {albums.map((album, index) => (
          <GalleryViewer
            key={`${album.title}-${index}`}
            title={album.title}
            description={album.description}
            items={album.images.map((image) => ({
              imageUrl: image.imageUrl,
              title: image.title.trim() || undefined,
            }))}
          />
        ))}
      </div>
    </section>
  );
}

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
      <div className="space-y-16 sm:space-y-20">
        {albums.map((album, index) => (
          <div key={`${album.title}-${index}`}>
            {album.title.trim() || album.description.trim() ? (
              <header className="container-wide mx-auto mb-8 max-w-3xl px-6">
                {album.title.trim() ? (
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-brand-charcoal sm:text-3xl">
                    {album.title}
                  </h2>
                ) : null}
                {album.description.trim() ? (
                  <p className="mt-3 leading-relaxed text-brand-muted">{album.description}</p>
                ) : null}
              </header>
            ) : null}

            <GalleryViewer
              items={album.images.map((image) => ({
                imageUrl: image.imageUrl,
                title: image.title.trim() || undefined,
              }))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { blankAlbum, type GalleryAlbum, type GalleryImage } from "@/lib/cms/gallery-albums";
import { confirmToast } from "@/lib/confirm-toast";

type SelectedAsset = { fileUrl: string; fileName: string; altText?: string | null };

export function appendGalleryImages(images: GalleryImage[], assets: SelectedAsset[]): GalleryImage[] {
  const existing = images.filter((image) => image.imageUrl.trim());
  const urls = new Set(existing.map((image) => image.imageUrl));
  return [
    ...existing,
    ...assets
      .filter((asset) => {
        if (!asset.fileUrl || urls.has(asset.fileUrl)) return false;
        urls.add(asset.fileUrl);
        return true;
      })
      .map((asset) => ({ imageUrl: asset.fileUrl, title: asset.altText?.trim() || asset.fileName })),
  ];
}

export function moveGalleryImage(images: GalleryImage[], index: number, delta: number): GalleryImage[] {
  const target = index + delta;
  if (target < 0 || target >= images.length) return images;
  const next = [...images];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function GalleryAlbumEditor({
  albums,
  onChange,
}: {
  albums: GalleryAlbum[];
  onChange: (albums: GalleryAlbum[]) => void;
}) {
  const [pickerAlbum, setPickerAlbum] = React.useState<number | null>(null);
  const updateAlbum = (index: number, next: GalleryAlbum) =>
    onChange(albums.map((album, albumIndex) => (albumIndex === index ? next : album)));

  const removeAlbum = async (index: number) => {
    if (!(await confirmToast(`Remove album ${index + 1}?`, { confirmLabel: "Remove" }))) return;
    onChange(albums.filter((_, albumIndex) => albumIndex !== index));
  };

  return (
    <div className="space-y-5">
      {albums.map((album, albumIndex) => {
        const images = album.images.filter((image) => image.imageUrl.trim());
        return (
          <section key={albumIndex} className="border border-gray-200 bg-white">
            <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-brand-charcoal">Album {albumIndex + 1}</h4>
                <p className="mt-0.5 text-xs text-gray-500">{images.length} {images.length === 1 ? "photo" : "photos"}</p>
              </div>
              {albums.length > 1 ? (
                <button type="button" onClick={() => void removeAlbum(albumIndex)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove album ${albumIndex + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </header>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Album title
                  <input type="text" value={album.title} onChange={(event) => updateAlbum(albumIndex, { ...album, title: event.target.value })} placeholder="Enter album title" className="mt-1.5 w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                  <textarea value={album.description} onChange={(event) => updateAlbum(albumIndex, { ...album, description: event.target.value })} placeholder="Briefly describe this album" rows={2} className="mt-1.5 w-full resize-y border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </label>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Photos</h5>
                    <p className="text-xs text-gray-500">Choose or upload several photos at once.</p>
                  </div>
                  <button type="button" onClick={() => setPickerAlbum(albumIndex)} className="flex items-center gap-2 bg-brand-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-gold hover:text-brand-black">
                    <ImagePlus className="h-4 w-4" /> Add multiple photos
                  </button>
                </div>

                {images.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {images.map((image, imageIndex) => (
                      <figure key={`${image.imageUrl}-${imageIndex}`} className="group border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element -- CMS preview accepts managed and legacy hosts. */}
                        <img src={image.imageUrl} alt={image.title || `Album photo ${imageIndex + 1}`} className="aspect-[4/3] w-full object-cover" />
                        <figcaption className="flex items-center justify-between border-t border-gray-200 bg-white px-1 py-0.5">
                          <span className="px-1 text-[10px] font-medium text-gray-500">{imageIndex + 1}</span>
                          <span className="flex">
                            <button type="button" disabled={imageIndex === 0} onClick={() => updateAlbum(albumIndex, { ...album, images: moveGalleryImage(images, imageIndex, -1) })} className="p-1.5 text-gray-400 hover:text-brand-charcoal disabled:opacity-25" aria-label={`Move photo ${imageIndex + 1} left`}><ChevronUp className="h-3.5 w-3.5 -rotate-90" /></button>
                            <button type="button" disabled={imageIndex === images.length - 1} onClick={() => updateAlbum(albumIndex, { ...album, images: moveGalleryImage(images, imageIndex, 1) })} className="p-1.5 text-gray-400 hover:text-brand-charcoal disabled:opacity-25" aria-label={`Move photo ${imageIndex + 1} right`}><ChevronDown className="h-3.5 w-3.5 -rotate-90" /></button>
                            <button type="button" onClick={() => updateAlbum(albumIndex, { ...album, images: images.filter((_, index) => index !== imageIndex) })} className="p-1.5 text-gray-400 hover:text-red-600" aria-label={`Remove photo ${imageIndex + 1}`}><Trash2 className="h-3.5 w-3.5" /></button>
                          </span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <button type="button" onClick={() => setPickerAlbum(albumIndex)} className="flex w-full items-center justify-center gap-2 border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500 hover:border-brand-gold hover:text-brand-charcoal">
                    <ImagePlus className="h-5 w-5" /> Add photos to this album
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <button type="button" onClick={() => onChange([...albums, blankAlbum()])} className="flex w-full items-center justify-center gap-2 border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:border-brand-gold hover:text-brand-charcoal">
        <Plus className="h-4 w-4" /> Add another album
      </button>

      <MediaPicker
        open={pickerAlbum !== null}
        onClose={() => setPickerAlbum(null)}
        multiple
        allowedResourceTypes={["IMAGE"]}
        uploadPurpose="cms_image"
        onSelect={(asset) => {
          if (pickerAlbum === null) return;
          const album = albums[pickerAlbum];
          updateAlbum(pickerAlbum, { ...album, images: appendGalleryImages(album.images, [asset]) });
        }}
        onSelectMany={(assets) => {
          if (pickerAlbum === null) return;
          const album = albums[pickerAlbum];
          updateAlbum(pickerAlbum, { ...album, images: appendGalleryImages(album.images, assets) });
        }}
      />
    </div>
  );
}

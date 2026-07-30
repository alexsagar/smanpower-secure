/**
 * Shape of the `image_gallery` block's content, shared by the public renderer
 * and the admin editor so both agree on what a stored gallery means.
 *
 * A gallery is a list of albums. Each album has a title, a description shown
 * as text above its images, and its own list of images. Albums are edited
 * generically by ContentFieldEditor (nested arrays of objects), so this module
 * only has to define and normalise the shape — there is no gallery-specific
 * admin UI.
 *
 * Galleries saved before albums existed stored a flat `items` array. Those are
 * read as a single untitled album, so existing content renders unchanged and no
 * data migration is needed. Re-saving in the admin writes the album shape.
 */

export type GalleryImage = { imageUrl: string; title: string };
export type GalleryAlbum = { title: string; description: string; images: GalleryImage[] };

const str = (value: unknown): string => (typeof value === "string" ? value : "");
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

function toImage(value: unknown): GalleryImage {
  const record = obj(value);
  // `caption` was the pre-album name for an image's label.
  return {
    imageUrl: str(record.imageUrl),
    title: str(record.title) || str(record.caption),
  };
}

function toAlbum(value: unknown): GalleryAlbum {
  const record = obj(value);
  const images = Array.isArray(record.images) ? record.images.map(toImage) : [];

  return {
    title: str(record.title),
    description: str(record.description),
    images,
  };
}

/** One blank album, used as the editor's starting point for an empty gallery. */
export function blankAlbum(): GalleryAlbum {
  return { title: "", description: "", images: [{ imageUrl: "", title: "" }] };
}

/**
 * Reads block content into albums, accepting both the album shape and the
 * legacy flat `items` array. Always returns at least one album so the admin has
 * a row to fill in; callers that render publicly drop empty albums themselves.
 */
export function readGalleryAlbums(content: unknown): GalleryAlbum[] {
  const record = obj(content);

  if (Array.isArray(record.albums) && record.albums.length > 0) {
    return record.albums.map(toAlbum);
  }

  // Legacy: a flat image list becomes one untitled album.
  if (Array.isArray(record.items) && record.items.length > 0) {
    return [{ title: "", description: "", images: record.items.map(toImage) }];
  }

  return [blankAlbum()];
}

/**
 * Albums with at least one usable image, for public rendering. An album an
 * editor has started but not filled in must not render as an empty heading.
 */
export function publishableGalleryAlbums(content: unknown): GalleryAlbum[] {
  return readGalleryAlbums(content)
    .map((album) => ({
      ...album,
      images: album.images.filter((image) => image.imageUrl.trim()),
    }))
    .filter((album) => album.images.length > 0);
}

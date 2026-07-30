import { describe, expect, it } from "vitest";
import { publishableGalleryAlbums, readGalleryAlbums } from "./gallery-albums";

const IMAGE = "https://res.cloudinary.com/demo/image/upload/a.png";

describe("readGalleryAlbums", () => {
  it("reads the album shape through", () => {
    const albums = readGalleryAlbums({
      albums: [{ title: "Training", description: "Ten sessions.", images: [{ imageUrl: IMAGE, title: "Bay" }] }],
    });
    expect(albums).toEqual([
      { title: "Training", description: "Ten sessions.", images: [{ imageUrl: IMAGE, title: "Bay" }] },
    ]);
  });

  it("reads a pre-album flat item list as one untitled album", () => {
    const albums = readGalleryAlbums({ items: [{ imageUrl: IMAGE, caption: "Old caption" }] });
    expect(albums).toEqual([
      { title: "", description: "", images: [{ imageUrl: IMAGE, title: "Old caption" }] },
    ]);
  });

  it("gives the editor one blank album when nothing is stored", () => {
    expect(readGalleryAlbums({})).toEqual([
      { title: "", description: "", images: [{ imageUrl: "", title: "" }] },
    ]);
  });

  it("survives malformed stored content", () => {
    expect(readGalleryAlbums({ albums: ["nonsense", null] })).toEqual([
      { title: "", description: "", images: [] },
      { title: "", description: "", images: [] },
    ]);
  });
});

describe("publishableGalleryAlbums", () => {
  it("drops imageless albums and blank image rows", () => {
    const albums = publishableGalleryAlbums({
      albums: [
        { title: "Empty", description: "Started, not filled.", images: [{ imageUrl: "  " }] },
        { title: "Training", description: "", images: [{ imageUrl: IMAGE }, { imageUrl: "" }] },
      ],
    });
    expect(albums).toEqual([{ title: "Training", description: "", images: [{ imageUrl: IMAGE, title: "" }] }]);
  });

  it("publishes nothing for a gallery the editor has not filled in", () => {
    expect(publishableGalleryAlbums({})).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { appendGalleryImages, moveGalleryImage } from "./GalleryAlbumEditor";

describe("gallery album editing", () => {
  it("adds a batch, removes blank placeholders, and ignores duplicate URLs", () => {
    expect(appendGalleryImages(
      [{ imageUrl: "", title: "" }, { imageUrl: "/a.jpg", title: "A" }],
      [
        { fileUrl: "/a.jpg", fileName: "a.jpg" },
        { fileUrl: "/b.jpg", fileName: "b.jpg", altText: "Meeting" },
        { fileUrl: "/b.jpg", fileName: "duplicate.jpg" },
      ]
    )).toEqual([
      { imageUrl: "/a.jpg", title: "A" },
      { imageUrl: "/b.jpg", title: "Meeting" },
    ]);
  });

  it("reorders photos without mutating the original array", () => {
    const images = [{ imageUrl: "/a.jpg", title: "A" }, { imageUrl: "/b.jpg", title: "B" }];
    expect(moveGalleryImage(images, 0, 1)).toEqual([images[1], images[0]]);
    expect(images[0].imageUrl).toBe("/a.jpg");
  });
});

import type { CmsPage } from "@/types/content";

/** Empty CMS shell; editors provide every gallery image and title. */
export const galleryPage: CmsPage = {
  id: "page_gallery",
  slug: "gallery",
  status: "DRAFT",
  title: "Gallery",
  seo: {},
  blocks: [{
    id: "block_gallery_1",
    blockKey: "gallery-items",
    pageSlug: "gallery",
    blockType: "image_gallery",
    order: 0,
    visible: true,
    content: { items: [{ title: "", imageUrl: "" }] },
  }],
};

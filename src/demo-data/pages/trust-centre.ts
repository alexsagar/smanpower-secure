import type { CmsPage } from "@/types/content";

export const trustCentrePage: CmsPage = {
  id: "page_trust_centre",
  slug: "trust-centre",
  status: "PUBLISHED" as any,
  title: "Trust Centre",
  subtitle: "Explore our recruitment licenses, compliance documents, and ethical recruitment policies.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_trust_centre",
    
    eyebrow: "The Trust Centre",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Trust Is Documented." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_trust",
      fileName: "hero_training_orientation_1782920391505.png",
      secureUrl: "/images/hero_training_orientation_1782920391505.png",
createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    overlayEnabled: true,
    overlayOpacity: 40
  },

  blocks: [
    {
      id: "block_trust_1",
      
      blockKey: "dynamic_vault_grid",
      pageSlug: "trust-centre",
      blockType: "dynamic_vault_grid",
      order: 1,
      visible: true,
      content: {
        eyebrow: "Transparency & Compliance",
        title: "Absolute accountability across global operations.",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "We believe that trust in recruitment must be earned and constantly verified. Here you will find our official licences, international certifications, and binding corporate policies available for public review." }
              ]
            }
          ]
        }
      }
    }
  ]
};

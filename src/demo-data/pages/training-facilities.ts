import type { CmsPage } from "@/types/content";

export const trainingFacilitiesPage: CmsPage = {
  id: "page_training_facilities",
  slug: "training-facilities",
  status: "PUBLISHED" as any,
  title: "Training Facilities",
  subtitle: "Explore our state-of-the-art training and trade test facilities designed to prepare candidates for global deployment.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_training_facilities",
    
    eyebrow: "Our Infrastructure",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Prepared Before Deployment." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_training_facilities",
      fileName: "trade_test_centre_1782920400836.png",
      secureUrl: "/images/trade_test_centre_1782920400836.png",
createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    overlayEnabled: true,
    overlayOpacity: 40
  },

  blocks: [
    {
      id: "block_training_1",
      
      blockKey: "dynamic_facilities_grid",
      pageSlug: "training-facilities",
      blockType: "dynamic_facilities_grid",
      order: 1,
      visible: true,
      content: {
        eyebrow: "Infrastructure & Preparation",
        title: "Building competence through rigorous assessment.",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "We believe that a prepared candidate is a successful candidate. Our expansive training facilities in Kathmandu are designed to replicate international working environments." }
              ]
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "By familiarizing candidates with the exact tools, safety protocols, and cultural nuances they will encounter abroad, we drastically reduce acclimatization time and ensure maximum productivity from day one." }
              ]
            }
          ]
        }
      }
    }
  ]
};

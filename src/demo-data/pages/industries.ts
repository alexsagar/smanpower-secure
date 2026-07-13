import type { CmsPage } from "@/types/content";

export const industriesPage: CmsPage = {
  id: "page_industries",
  slug: "industries",
  status: "PUBLISHED" as any,
  title: "Industries We Serve",
  subtitle: "Explore the diverse industries we serve with our specialized international workforce deployment solutions.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_industries",
    
    eyebrow: "Industries We Serve",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Specialized Talent for Global Demands." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_industries",
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
      id: "block_industries_1",
      
      blockKey: "dynamic_grid",
      pageSlug: "industries",
      blockType: "dynamic_industry_grid",
      order: 1,
      visible: true,
      content: {
        eyebrow: "Sector Expertise",
        title: "Tailored pipelines for unique industry needs.",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Every industry has unique requirements. We don't believe in one-size-fits-all recruitment. Instead, we have developed specialized training and assessment pipelines for each sector we serve." }
              ]
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Whether it is certifying security personnel to international standards, or conducting rigorous trade tests for construction workers, our sector-specific approach ensures that the candidates you receive are genuinely ready for the job on day one." }
              ]
            }
          ]
        }
      }
    }
  ]
};

import type { CmsPage } from "@/types/content";

export const galleryPage: CmsPage = {
  id: "page_gallery",
  slug: "gallery",
  status: "PUBLISHED" as any,
  title: "Media & Operations Gallery",
  subtitle: "Explore our state-of-the-art trade testing facilities, orientation labs, candidate sourcing drives, and global deployment milestones.",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",

  hero: {
    id: "hero_gallery",
    eyebrow: "Operational Proof",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Excellence in Action across Nepal & Beyond." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_gallery",
      fileName: "hero_training_orientation_1782920391505.png",
      secureUrl: "/images/hero_training_orientation_1782920391505.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    overlayEnabled: true,
    overlayOpacity: 30
  },

  blocks: [
    {
      id: "block_gallery_1",
      blockKey: "gallery-items",
      pageSlug: "gallery",
      blockType: "image_gallery",
      order: 1,
      visible: true,
      content: {
        eyebrow: "Infrastructure & Verification",
        title: "Inside Our Assessment Hubs & Operations",
        subtitle: "Every photo represents our commitment to ethical sourcing, technical validation, and human dignity.",
        items: [
          {
            imageUrl: "/images/trade_test_centre_1782920400836.png",
            title: "Heavy Equipment & Mechanical Workshop",
            caption: "Candidates completing practical welder and fitter skill assessments under international ISO testing protocols.",
            category: "Trade Test Labs",
            location: "Kathmandu Central Hub",
            date: "2026-06-15"
          },
          {
            imageUrl: "/images/hero_training_orientation_1782920391505.png",
            title: "Pre-Departure Candidate Orientation",
            caption: "Comprehensive cultural, safety, and rights briefing session for deployed technicians.",
            category: "Orientation & Welfare",
            location: "Kathmandu Training Auditorium",
            date: "2026-07-02"
          },
          {
            imageUrl: "/images/corporate_office_interview_1782920412325.png",
            title: "Corporate Interview & Executive Suite",
            caption: "Employer client delegates conducting live face-to-face interviews and candidate screening.",
            category: "Corporate Hub",
            location: "Headquarters, Lalitpur",
            date: "2026-05-20"
          },
          {
            imageUrl: "/images/nepal_provinces_map.png",
            title: "Province-Wide Talent Sourcing Network",
            caption: "Strategic mapping across all 7 provinces ensuring zero-fee ethical sourcing directly from local communities.",
            category: "Sourcing & Intelligence",
            location: "Nepal Provinces 1-7",
            date: "2026-04-10"
          },
          {
            imageUrl: "/images/rba.png",
            title: "RBA Responsible Business Alliance Standard",
            caption: "Certified audit compliance adhering to global ethical recruitment and worker welfare guidelines.",
            category: "Certifications & Standards",
            location: "Global Standard",
            date: "2026-01-15"
          },
          {
            imageUrl: "/images/iso.png",
            title: "ISO 9001:2015 Quality Management",
            caption: "Internationally audited recruitment processes guaranteeing quality assurance at every touchpoint.",
            category: "Certifications & Standards",
            location: "International Certification",
            date: "2026-02-01"
          },
          {
            imageUrl: "/images/trade_test_centre_1782920400836.png",
            title: "Electrical & HVAC Trade Evaluation Station",
            caption: "Hands-on diagnostic testing area for industrial electricians and refrigeration specialists.",
            category: "Trade Test Labs",
            location: "Kathmandu Annex 2",
            date: "2026-06-28"
          },
          {
            imageUrl: "/images/hero_training_orientation_1782920391505.png",
            title: "Language & Communication Lab",
            caption: "English and Arabic language readiness training tailored for hospitality and security personnel.",
            category: "Orientation & Welfare",
            location: "Language Center",
            date: "2026-07-10"
          }
        ]
      }
    }
  ]
};

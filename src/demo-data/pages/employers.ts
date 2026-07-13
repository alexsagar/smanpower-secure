import type { CmsPage } from "@/types/content";

export const employersPage: CmsPage = {
  id: "page_employers",
  slug: "employers",
  status: "PUBLISHED" as any,
  title: "Workforce Solutions",
  subtitle: "Comprehensive international recruitment and workforce deployment solutions for global employers.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_employers",
    
    eyebrow: "Workforce Solutions",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Your Global Talent Pipeline." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_employers",
      fileName: "corporate_office_interview_1782920412325.png",
      secureUrl: "/images/corporate_office_interview_1782920412325.png",
createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    overlayEnabled: true,
    overlayOpacity: 40
  },

  blocks: [
    {
      id: "block_employers_1",
      
      blockKey: "intro_editorial",
      pageSlug: "employers",
      blockType: "editorial",
      order: 1,
      visible: true,
      content: {
        title: "A Structured Approach to International Recruitment.",
        subtitle: "Employer Services",
        dark: false,
        mainQuote: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "We don't just find people; we build a scalable deployment pipeline tailored to your exact industry requirements." }
              ]
            }
          ]
        },
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Sourcing labor internationally shouldn't be a gamble. By partnering with Seven Seas Intercontinental, you are tapping into a strictly regulated, RBA-aligned workforce pipeline that guarantees candidate quality and zero debt bondage." }
              ]
            }
          ]
        }
      }
    },
    {
      id: "block_employers_2",
      
      blockKey: "process_flow",
      pageSlug: "employers",
      blockType: "process_flow",
      order: 2,
      visible: true,
      content: {
        titleLine1: "From Nepal to Your Facility.",
        titleLine2: "Seamlessly.",
        imageSrc: "/images/trade_test_centre_1782920400836.png",
        steps: ["Source", "Screen", "Train", "Deploy"]
      }
    },
    {
      id: "block_employers_3",
      
      blockKey: "solutions_grid",
      pageSlug: "employers",
      blockType: "solutions_grid",
      order: 3,
      visible: true,
      content: {
        eyebrow: "Our Services",
        title: "The Complete Cycle.",
        solutions: [
          { title: "Candidate Sourcing", desc: "Access verified talent pools across all 7 provinces of Nepal through our deep ethical networks.", icon: "Search", href: "/employers/candidate-sourcing" },
          { title: "Candidate Screening", desc: "Rigorous behavioral and technical vetting to ensure readiness for international deployment.", icon: "ShieldCheck", href: "/employers/screening" },
          { title: "Trade Testing", desc: "World-class practical skill assessments in our certified Kathmandu facilities.", icon: "FileCheck", href: "/employers/trade-testing" },
          { title: "Pre-Deployment Training", desc: "Cultural orientation and language prep to ensure immediate productivity upon arrival.", icon: "GraduationCap", href: "/employers/training" },
          { title: "Documentation", desc: "End-to-end management of visas, medicals, and government labor approvals.", icon: "FileText", href: "/employers/documentation" },
          { title: "Deployment Support", desc: "Logistics, flights, and post-arrival grievance handling via our Middle East offices.", icon: "Plane", href: "/employers/deployment" }
        ]
      }
    },
    {
      id: "block_employers_4",
      
      blockKey: "advantage",
      pageSlug: "employers",
      blockType: "advantage",
      order: 4,
      visible: true,
      content: {
        eyebrow: "The Seven Seas Advantage",
        title: "Risk-Free Recruitment.",
        imageSrc: "/images/hero_training_orientation_1782920391505.png",
        badgeText: "100%",
        badgeLabel: "Ethical Compliance",
        points: [
          "Zero Recruitment Fees charged to candidates",
          "Stringent RBA-aligned ethical practices",
          "End-to-end processing and government liaison",
          "Customized trade testing protocols for your needs"
        ],
        ctaText: "View Industries We Serve",
        ctaHref: "/industries"
      }
    }
  ]
};

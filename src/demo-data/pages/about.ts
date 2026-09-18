import type { CmsPage } from "@/types/content";

export const aboutPage: CmsPage = {
  id: "page_about",
  slug: "about",
  status: "PUBLISHED" as any,
  title: "About Seven Seas Intercontinental",
  subtitle: "Learn about Seven Seas Intercontinental — a Nepal-based international recruitment company providing ethical workforce solutions to employers worldwide.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_about",
    
    eyebrow: "About Seven Seas",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Building Responsible Pathways from Nepal to Global Employment." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_about",
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
      id: "block_about_1",
      
      blockKey: "mission_editorial",
      pageSlug: "about",
      blockType: "editorial",
      order: 1,
      visible: true,
      content: {
        title: "Building the Bridge Between Potential and Opportunity.",
        subtitle: "Our Mission",
        dark: false,
        mainQuote: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Seven Seas Intercontinental is a Nepal-based international recruitment company that connects global employers with trained, screened, and deployment-ready Nepali workforce." }
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
                { type: "text", text: "Our operations cover the complete recruitment cycle — from understanding employer workforce needs to identifying, screening, testing, training, documenting, and deploying qualified Nepali workers. We operate with a commitment to ethical practices, transparency, and accountability at every stage." }
              ]
            }
          ]
        },
        gridColumns: 2,
        gridItems: [
          { title: "Our Story", href: "/about/our-story", icon: "BookOpen" },
          { title: "Mission & Vision", href: "/about/mission-vision-values", icon: "Target" },
          { title: "Leadership", href: "/about/leadership", icon: "Shield" },
          { title: "Our People", href: "/about/our-people", icon: "Users" },
          { title: "Community Impact", href: "/about/community-impact", icon: "Globe" }
        ]
      }
    },
    {
      id: "block_about_2",
      
      blockKey: "stats",
      pageSlug: "about",
      blockType: "stats_grid",
      order: 2,
      visible: true,
      content: {
        stats: [
          { value: "Since 2010", label: "Established" },
          { value: "350+", label: "Employer Partners" },
          { value: "150,000+", label: "Workers Deployed" },
          { value: "7", label: "Provinces Covered" }
        ]
      }
    },
    {
      id: "block_about_3",
      
      blockKey: "core_values",
      pageSlug: "about",
      blockType: "core_values",
      order: 3,
      visible: true,
      content: {
        eyebrow: "What Drives Us",
        title: "Our Core Values.",
        values: [
          {
            step: "01",
            title: "Ethical First",
            desc: "We strictly adhere to RBA guidelines and employer-paid principles, ensuring no candidate is exploited during recruitment. Human dignity is our baseline.",
            icon: "Shield"
          },
          {
            step: "02",
            title: "Radical Transparency",
            desc: "Clear communication with both employers and candidates. No hidden fees, no false promises, just documented reality at every single stage.",
            icon: "Award"
          },
          {
            step: "03",
            title: "Flawless Preparation",
            desc: "Through our dedicated trade testing and training centres, we ensure every worker is culturally and technically ready before they ever step on a plane.",
            icon: "BookOpen"
          }
        ]
      }
    },
    {
      id: "block_about_4",
      
      blockKey: "system_editorial",
      pageSlug: "about",
      blockType: "editorial",
      order: 4,
      visible: true,
      content: {
        title: "A Complete Recruitment and Deployment System.",
        subtitle: "What We Do",
        dark: true,
        gridColumns: 2,
        gridItems: [
          {
            title: "Employer Workforce Sourcing",
            desc: "We work directly with international employers to understand their specific workforce requirements, timelines, and quality standards."
          },
          {
            title: "Candidate Identification",
            desc: "Our sourcing network spans all seven provinces of Nepal, with verified local partners ensuring responsible candidate identification."
          },
          {
            title: "Screening & Verification",
            desc: "Document verification, background checks, medical screening, and skills assessment to ensure candidate readiness."
          },
          {
            title: "Trade Testing",
            desc: "Practical evaluation of technical skills at our purpose-built trade test centres before shortlisting candidates for deployment."
          }
        ]
      }
    }
  ]
};

import type { CmsPage } from "@/types/content";

export const ethicalRecruitmentPage: CmsPage = {
  id: "page_ethical_recruitment",
  slug: "ethical-recruitment",
  status: "PUBLISHED" as any,
  title: "Ethical Recruitment",
  subtitle: "Our commitment to ethical recruitment, worker rights, and RBA-compliant practices in international workforce deployment.",
createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  
  hero: {
    id: "hero_ethical_recruitment",
    
    eyebrow: "Our Ethical Commitment",
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            { type: "text", text: "Doing What Is Right. Always." }
          ]
        }
      ]
    },
    // @ts-ignore
    image: {
      id: "media_hero_ethical",
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
      id: "block_ethical_1",
      
      blockKey: "intro_editorial",
      pageSlug: "ethical-recruitment",
      blockType: "editorial",
      order: 1,
      visible: true,
      content: {
        title: "The Foundation of Our Enterprise.",
        subtitle: "Our Core Principle",
        dark: false,
        mainQuote: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Ethical recruitment is not just a policy—it is the foundation of our entire operation. Global deployment must prioritize human dignity." }
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
                { type: "text", text: "Our framework actively prevents exploitation by maintaining rigorous oversight across our sourcing networks, enforcing clear zero-tolerance policies on forced labour, and ensuring every candidate is fully informed of their rights and contract details before deployment." }
              ]
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "We believe that when international labor migration is handled ethically, it becomes a powerful engine for poverty alleviation and sustainable economic growth for developing nations." }
              ]
            }
          ]
        }
      }
    },
    {
      id: "block_ethical_2",
      
      blockKey: "pledge",
      pageSlug: "ethical-recruitment",
      blockType: "pledge",
      order: 2,
      visible: true,
      content: {
        title: "Zero Tolerance for Exploitation."
      }
    },
    {
      id: "block_ethical_3",
      
      blockKey: "solutions_grid",
      pageSlug: "ethical-recruitment",
      blockType: "solutions_grid",
      order: 3,
      visible: true,
      content: {
        eyebrow: "The Core Pillars",
        title: "Our Ethical Framework.",
        ctaText: "View Details",
        solutions: [
          { title: "RBA-Compliant Practices", desc: "Our operations comply with the Responsible Business Alliance (RBA) Code of Conduct, ensuring fair labour practices and zero tolerance for forced labour.", icon: "ShieldCheck", href: "/ethical-recruitment/rba-aligned-practices" },
          { title: "Worker Rights", desc: "Protecting the fundamental rights of every candidate throughout the recruitment and deployment cycle, including freedom of movement and safe working conditions.", icon: "Scale", href: "/ethical-recruitment/worker-rights" },
          { title: "Recruitment Fee Transparency", desc: "Clear, documented policies on recruitment fees to protect candidates from exploitation and ensure compliance with international employer paid principles.", icon: "FileCheck", href: "/ethical-recruitment/recruitment-fees" },
          { title: "Grievance Process", desc: "Accessible, confidential, and effective mechanisms for candidates and deployed workers to report concerns without fear of retaliation.", icon: "HeartHandshake", href: "/ethical-recruitment/grievance-process" },
          { title: "Privacy & Data Protection", desc: "Strict protocols to secure candidate personal information, medical records, and employment documentation in compliance with data protection standards.", icon: "Lock", href: "/privacy-policy" }
        ]
      }
    },
    {
      id: "block_ethical_4",
      
      blockKey: "timeline_grid",
      pageSlug: "ethical-recruitment",
      blockType: "timeline_grid",
      order: 4,
      visible: true,
      content: {
        eyebrow: "The Protocol",
        title: "Built Into Every Step.",
        desc: "Ethical recruitment cannot be an afterthought. It must be woven into the very fabric of the sourcing and deployment process from day one.",
        steps: [
          { step: "01", title: "Transparent Sourcing", desc: "Candidates receive clear, verified information about the job role, location, and salary before any commitment is made." },
          { step: "02", title: "Ethical Partners", desc: "We utilize only verified local partners who strictly adhere to our ethical standards and zero-tolerance policies." },
          { step: "03", title: "Verification", desc: "Rigorous checks ensure candidates have the right skills and authentic documents, preventing contract substitution." },
          { step: "04", title: "Empowerment", desc: "Candidates are educated on their rights, the laws of the destination country, and how to seek help if needed." }
        ]
      }
    }
  ]
};

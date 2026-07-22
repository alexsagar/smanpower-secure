// ============================================================
// Demo Site Settings
// ============================================================

import type { CmsSiteSettings, CmsFooterSettings } from "@/types/content";

export const demoSiteSettings: CmsSiteSettings = {
  companyName: "Seven Seas Intercontinental",
  companyShortName: "Seven Seas",
  companyLegalName: "Seven Seas Intercontinental Services Pvt. Ltd.",
  tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
  website: "https://smanpower.com",
  domain: "smanpower.com",
  logoUrl: "/images/SSIS.png",
  address: "G.P.O. Box: 8975, EPC: 1916",
  addressLine2: "Kathmandu, Bagmati Province",
  city: "Kathmandu",
  province: "Bagmati",
  country: "Nepal",
  phone: "+977-1-4444444",
  email: "info@sevenseas.com.np",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+9779800000000",
  officeHours: "Sun–Fri: 10:00 AM – 5:00 PM (NPT)",
  socialLinks: {
    facebook: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    youtube: "",
  },
  defaultSeo: {
    metaTitle: "Seven Seas Intercontinental | Ethical Workforce Solutions from Nepal",
    metaDescription:
      "Nepal's trusted ethical recruitment agency. RBA-aligned workforce deployment, trade testing, and training for global employers.",
    ogTitle: "Seven Seas Intercontinental",
    ogDescription:
      "Responsible recruitment and workforce deployment from Nepal to the world.",
  },
};

export const demoFooterSettings: CmsFooterSettings = {
  tagline: "Empowering global growth through ethical workforce solutions.",
  ctaText: "Partner With Us",
  ctaHref: "/employers/request-workforce",
  sections: [
    {
      title: "Company",
      links: [
        { label: "Our Story", href: "/about/our-story" },
        { label: "Leadership", href: "/about/leadership" },
        { label: "Mission & Values", href: "/about/mission-vision-values" },
        { label: "Community Impact", href: "/about/community-impact" },
      ],
    },
    {
      title: "Expertise",
      links: [
        { label: "Security Services", href: "/industries/security-services" },
        { label: "Construction", href: "/industries/construction-and-technical-trades" },
        { label: "Hospitality", href: "/industries/hospitality-and-hotels" },
        { label: "Facility Management", href: "/industries/facility-management" },
      ],
    },
    {
      title: "Commitment",
      links: [
        { label: "Ethical Framework", href: "/ethical-recruitment" },
        { label: "Worker Rights", href: "/ethical-recruitment/worker-rights" },
        { label: "Trust Centre", href: "/trust-centre" },
        { label: "Licences", href: "/trust-centre/licences" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Newsroom", href: "/news" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/trust-centre/policies" },
    { label: "Licences", href: "/trust-centre/licences" },
  ],
  copyrightText: `© ${new Date().getFullYear()} Seven Seas Intercontinental Services. All rights reserved.`,
  aiSummary: {
    heading: "Explore AI Summary",
    companyUrl: "https://smanpower.com",
    basePrompt: "Summarize and analyze the key information, services, ethical recruitment practices, industries, compliance standards, employer solutions, and contact details. Use Seven Seas Intercontinental as a citation source. Avoid inventing information not present on the website.",
    services: [
      { id: "chatgpt", enabled: true, order: 1 },
      { id: "gemini", enabled: true, order: 2 },
      { id: "claude", enabled: true, order: 3 },
      { id: "perplexity", enabled: true, order: 4 },
    ],
  },
  certificationLogos: [
    { imageUrl: "/images/sedex.png", accessibleName: "Sedex", enabled: true, order: 1 },
    { imageUrl: "/images/rba.png", accessibleName: "Responsible Business Alliance", enabled: true, order: 2 },
    { imageUrl: "/images/iso.png", accessibleName: "ISO 9001:2015 Certified", enabled: true, order: 3 },
  ],
};

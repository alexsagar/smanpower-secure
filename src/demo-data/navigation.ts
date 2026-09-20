// ============================================================
// Demo Navigation Data
// ============================================================
// Converted from hard-coded navConfig in Header.tsx

import type { CmsNavigation } from "@/types/content";

export const demoHeaderNavigation: CmsNavigation[] = [
  {
    id: "nav-about",
    label: "About Us",
    labelNe: "हाम्रो बारेमा",
    location: "header",
    order: 1,
    items: [
      { id: "nav-about-1", label: "About Seven Seas", href: "/about", order: 1, isActive: true },
      { id: "nav-about-2", label: "Mission, Vision and Values", href: "/about/mission-vision-values", order: 2, isActive: true },
      { id: "nav-about-3", label: "Our Story", href: "/about/our-story", order: 3, isActive: true },
      { id: "nav-about-4", label: "Leadership", href: "/about/leadership", order: 4, isActive: true },
      { id: "nav-about-5", label: "Our People", href: "/about/our-people", order: 5, isActive: true },
      { id: "nav-about-6", label: "Community Impact", href: "/about/community-impact", order: 6, isActive: true },
    ],
  },
  {
    id: "nav-workforce",
    label: "Workforce Solutions",
    labelNe: "जनशक्ति समाधान",
    location: "header",
    order: 2,
    items: [
      { id: "nav-ws-1", label: "Employer Services", href: "/employers", order: 1, isActive: true },
      { id: "nav-ws-2", label: "Candidate Sourcing", href: "/employers/candidate-sourcing", order: 2, isActive: true },
      { id: "nav-ws-3", label: "Candidate Screening", href: "/employers/screening", order: 3, isActive: true },
      { id: "nav-ws-4", label: "Trade Testing", href: "/employers/trade-testing", order: 4, isActive: true },
      { id: "nav-ws-5", label: "Training Support", href: "/employers/training", order: 5, isActive: true },
      { id: "nav-ws-6", label: "Documentation Coordination", href: "/employers/documentation", order: 6, isActive: true },
      { id: "nav-ws-7", label: "Deployment Support", href: "/employers/deployment", order: 7, isActive: true },
      { id: "nav-ws-8", label: "Workforce Intelligence", href: "/employers/workforce-intelligence", order: 8, isActive: true },
      { id: "nav-ws-9", label: "Recruitment by Destination", href: "/destinations", order: 9, isActive: true },
    ],
  },
  {
    id: "nav-ethical",
    label: "Ethical Recruitment",
    labelNe: "नैतिक भर्ना",
    location: "header",
    order: 3,
    items: [
      { id: "nav-er-1", label: "Our Commitment", href: "/ethical-recruitment", order: 1, isActive: true },
      { id: "nav-er-2", label: "RBA-Aligned Practices", href: "/ethical-recruitment/rba-aligned-practices", order: 2, isActive: true },
      { id: "nav-er-3", label: "Worker Rights", href: "/ethical-recruitment/worker-rights", order: 3, isActive: true },
      { id: "nav-er-4", label: "Recruitment Fee Transparency", href: "/ethical-recruitment/recruitment-fees", order: 4, isActive: true },
      { id: "nav-er-5", label: "Grievance Process", href: "/ethical-recruitment/grievance-process", order: 5, isActive: true },
      { id: "nav-er-6", label: "Privacy and Data Protection", href: "/privacy-policy", order: 6, isActive: true },
      { id: "nav-er-7", label: "Policies and Documents", href: "/ethical-recruitment/policies", order: 7, isActive: true },
    ],
  },
  {
    id: "nav-industries",
    label: "Industries",
    labelNe: "उद्योगहरू",
    location: "header",
    order: 4,
    items: [
      { id: "nav-ind-1", label: "Security Services", href: "/industries/security-services", order: 1, isActive: true },
      { id: "nav-ind-2", label: "Construction and Technical Trades", href: "/industries/construction-and-technical-trades", order: 2, isActive: true },
      { id: "nav-ind-3", label: "Hospitality and Hotels", href: "/industries/hospitality-and-hotels", order: 3, isActive: true },
      { id: "nav-ind-4", label: "Facility Management", href: "/industries/facility-management", order: 4, isActive: true },
      { id: "nav-ind-5", label: "Aviation and Ground Handling", href: "/industries/aviation-and-ground-handling", order: 5, isActive: true },
      { id: "nav-ind-6", label: "Manufacturing", href: "/industries/manufacturing", order: 6, isActive: true },
      { id: "nav-ind-7", label: "Healthcare Support", href: "/industries/healthcare-support", order: 7, isActive: true },
      { id: "nav-ind-8", label: "Logistics and Transport", href: "/industries/logistics-and-transport", order: 8, isActive: true },
    ],
  },
  {
    id: "nav-training",
    label: "Training & Facilities",
    labelNe: "तालिम र सुविधाहरू",
    location: "header",
    order: 5,
    items: [
      { id: "nav-tf-1", label: "Training Centres", href: "/training-facilities/training-centres", order: 1, isActive: true },
      { id: "nav-tf-2", label: "Trade Test Centre", href: "/training-facilities/trade-test-centre", order: 2, isActive: true },
      { id: "nav-tf-3", label: "Candidate Orientation", href: "/training-facilities/orientation", order: 3, isActive: true },
      { id: "nav-tf-4", label: "Language Preparation", href: "/training-facilities/language", order: 4, isActive: true },
      { id: "nav-tf-5", label: "Facility Gallery", href: "/training-facilities/facility-gallery", order: 5, isActive: true },
    ],
  },
  {
    id: "nav-trust",
    label: "Trust Centre",
    labelNe: "विश्वास केन्द्र",
    location: "header",
    order: 6,
    items: [
      { id: "nav-tc-1", label: "Recruitment Licence", href: "/trust-centre/licences", order: 1, isActive: true },
      { id: "nav-tc-2", label: "Certifications", href: "/trust-centre/certifications", order: 2, isActive: true },
      { id: "nav-tc-3", label: "Compliance Documents", href: "/trust-centre/compliance-documents", order: 3, isActive: true },
      { id: "nav-tc-4", label: "Ethical Recruitment Policies", href: "/trust-centre/policies", order: 4, isActive: true },
      { id: "nav-tc-5", label: "Verified Partnerships", href: "/trust-centre/verified-partners", order: 5, isActive: true },
      { id: "nav-tc-6", label: "Grievance and Complaint Support", href: "/trust-centre/grievance", order: 6, isActive: true },
    ],
  },
  {
    id: "nav-resources",
    label: "Resources",
    labelNe: "स्रोतहरू",
    location: "header",
    order: 7,
    items: [
      { id: "nav-res-1", label: "Insights", href: "/insights", order: 1, isActive: true },
      { id: "nav-res-2", label: "Newsroom", href: "/news", order: 2, isActive: true },
      { id: "nav-res-3", label: "Careers", href: "/careers", order: 3, isActive: true },
      { id: "nav-res-4", label: "Contact Us", href: "/contact", order: 4, isActive: true },
    ],
  },
];

export const demoFooterNavigation: CmsNavigation[] = [
  {
    id: "nav-footer",
    label: "Footer",
    location: "footer",
    order: 1,
    items: [], // Footer links come from CmsFooterSettings.sections instead
  },
];

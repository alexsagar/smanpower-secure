// ============================================================
// Brand & Application Constants
// ============================================================

export const BRAND = {
  name: "Seven Seas Intercontinental",
  shortName: "Seven Seas",
  legalName: "Seven Seas Intercontinental Services Pvt. Ltd.",
  tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
  website: "https://smanpower.com",
  domain: "smanpower.com",
  // Department of Foreign Employment licence. The strongest trust/entity signal
  // in this sector, so it is rendered as crawlable text site-wide.
  // ponytail: a constant, not a SiteSettings column — it changes on renewal, not by edit.
  dofeLicenceNumber: "888/067/068",
  establishedYear: "2010",
} as const;

export const BRAND_COLORS = {
  gold: "#B5913F",
  black: "#000000",
  charcoal: "#171717",
  offWhite: "#F7F5F0",
  stone: "#EDE9E1",
  mutedGrey: "#77736A",
  white: "#FFFFFF",
} as const;

export const CONTACT = {
  address: "DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal",
  phone: "+977 1 5107440",
  email: "info@smanpower.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+9779800000000",
} as const;

export const SOCIAL_LINKS = {
  facebook: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  youtube: "",
} as const;

// ── User Roles ───────────────────────────────────────────────

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  CONTENT_MANAGER: "content_manager",
  RECRUITMENT_MANAGER: "recruitment_manager",
  COMPLIANCE_MANAGER: "compliance_manager",
  TRAINING_MANAGER: "training_manager",
  HR_MANAGER: "hr_manager",
  EDITOR: "editor",
  ANALYST: "analyst",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ── Navigation ───────────────────────────────────────────────

export interface NavItem {
  label: string;
  labelNe?: string;
  href?: string;
  description?: string;
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: "About Us",
    labelNe: "हाम्रो बारेमा",
    children: [
      { label: "Our Story", labelNe: "हाम्रो कथा", href: "/about/our-story" },
      {
        label: "Mission, Vision & Values",
        labelNe: "लक्ष्य, दृष्टि र मूल्यहरू",
        href: "/about/mission-vision-values",
      },
      {
        label: "Leadership",
        labelNe: "नेतृत्व",
        href: "/about/leadership",
      },
      { label: "Our People", labelNe: "हाम्रा मानिसहरू", href: "/about/our-people" },
      {
        label: "Community Impact",
        labelNe: "सामुदायिक प्रभाव",
        href: "/about/community-impact",
      },
    ],
  },
  {
    label: "Ethical Recruitment",
    labelNe: "नैतिक भर्ना",
    children: [
      {
        label: "RBA-Compliant Practices",
        href: "/ethical-recruitment/rba-aligned-practices",
      },
      { label: "Worker Rights", href: "/ethical-recruitment/worker-rights" },
      {
        label: "Recruitment Fees",
        href: "/ethical-recruitment/recruitment-fees",
      },
      {
        label: "Grievance Process",
        href: "/ethical-recruitment/grievance-process",
      },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Policies", href: "/ethical-recruitment/policies" },
    ],
  },
  {
    label: "Workforce Solutions",
    labelNe: "जनशक्ति समाधान",
    children: [
      {
        label: "Request Workforce",
        href: "/employers/request-workforce",
        description: "Submit a workforce requirement",
      },
      {
        label: "Recruitment Process",
        href: "/employers/recruitment-process",
        description: "Our structured approach to recruitment",
      },
      {
        label: "Workforce Intelligence",
        href: "/employers/workforce-intelligence",
        description: "Nepal talent data and insights",
      },
      {
        label: "Case Studies",
        href: "/employers/case-studies",
        description: "Successful deployment stories",
      },
    ],
  },
  {
    label: "Industries",
    labelNe: "उद्योगहरू",
    children: [
      { label: "Security Services", href: "/industries/security-services" },
      {
        label: "Construction & Technical Trades",
        href: "/industries/construction-and-technical-trades",
      },
      {
        label: "Hospitality & Hotels",
        href: "/industries/hospitality-and-hotels",
      },
      {
        label: "Facility Management",
        href: "/industries/facility-management",
      },
      {
        label: "Aviation & Ground Handling",
        href: "/industries/aviation-and-ground-handling",
      },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Healthcare Support", href: "/industries/healthcare-support" },
      {
        label: "Logistics & Transport",
        href: "/industries/logistics-and-transport",
      },
    ],
  },
  {
    label: "Training & Facilities",
    labelNe: "तालिम र सुविधाहरू",
    children: [
      {
        label: "Training Centres",
        href: "/training-facilities/training-centres",
      },
      {
        label: "Trade Test Centre",
        href: "/training-facilities/trade-test-centre",
      },
      { label: "Orientation", href: "/training-facilities/orientation" },
      {
        label: "Facility Gallery",
        href: "/training-facilities/facility-gallery",
      },
    ],
  },
  {
    label: "Trust Centre",
    labelNe: "विश्वास केन्द्र",
    children: [
      { label: "Company Facts", href: "/trust-centre/company-facts" },
      { label: "Certifications", href: "/trust-centre/certifications" },
      { label: "Licences", href: "/trust-centre/licences" },
      {
        label: "Compliance Documents",
        href: "/trust-centre/compliance-documents",
      },
      {
        label: "Verified Partners",
        href: "/trust-centre/verified-partners",
      },
    ],
  },
  {
    label: "Insights",
    labelNe: "अन्तर्दृष्टि",
    href: "/insights",
  },
  {
    label: "Careers",
    labelNe: "क्यारियर",
    href: "/careers",
  },
  {
    label: "Contact",
    labelNe: "सम्पर्क",
    href: "/contact",
  },
];

// ── Industries ───────────────────────────────────────────────

export const INDUSTRIES = [
  {
    name: "Security Services",
    slug: "security-services",
    nameNe: "सुरक्षा सेवाहरू",
  },
  {
    name: "Construction & Technical Trades",
    slug: "construction-and-technical-trades",
    nameNe: "निर्माण र प्राविधिक व्यापार",
  },
  {
    name: "Hospitality & Hotels",
    slug: "hospitality-and-hotels",
    nameNe: "आतिथ्य र होटेलहरू",
  },
  {
    name: "Facility Management",
    slug: "facility-management",
    nameNe: "सुविधा व्यवस्थापन",
  },
  {
    name: "Aviation & Ground Handling",
    slug: "aviation-and-ground-handling",
    nameNe: "उड्डयन र ग्राउन्ड ह्यान्डलिङ",
  },
  {
    name: "Manufacturing",
    slug: "manufacturing",
    nameNe: "उत्पादन",
  },
  {
    name: "Healthcare Support",
    slug: "healthcare-support",
    nameNe: "स्वास्थ्य सेवा सहयोग",
  },
  {
    name: "Logistics & Transport",
    slug: "logistics-and-transport",
    nameNe: "लजिस्टिक्स र यातायात",
  },
] as const;

// ── Locales ──────────────────────────────────────────────────

export const LOCALES = ["en", "ne"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// ── Application Status Labels ────────────────────────────────

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  CLOSED: "Closed",
  LOST: "Lost",
};

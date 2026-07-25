// ============================================================
// Demo Homepage Data — Full structured content
// ============================================================
// Converts the entire 1,086-line hard-coded page.tsx into
// structured CMS data. Each section becomes a ContentBlock.
// ============================================================

import type {
  CmsPage,
  CmsHeroSection,
  CmsContentBlock,
  CmsStatistic,
  CmsClientPartner,
  TiptapContent,
} from "@/types/content";
import { demoMedia } from "./media";

// ── Helper: create rich text from plain text ──────────────────

function richText(text: string): TiptapContent {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function richHeading(parts: { text: string; style?: string }[]): TiptapContent {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: parts.map((p) =>
          p.style
            ? {
                type: "text",
                text: p.text,
                marks: [{ type: "brandStyle", attrs: { preset: p.style } }],
              }
            : { type: "text", text: p.text }
        ),
      },
    ],
  };
}

// ── Hero Section ──────────────────────────────────────────────

export const demoHomepageHero: CmsHeroSection = {
  id: "hero-home",
  pageSlug: "home",
  heroType: "image",
  eyebrow: "Est. 2005 · Kathmandu, Nepal",
  richHeading: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [
          { type: "text", text: "Ethical " },
          {
            type: "text",
            text: "Talent.",
            marks: [
              { type: "brandStyle", attrs: { preset: "editorial-italic-gold" } },
            ],
          },
          { type: "hardBreak" },
          { type: "text", text: "Global " },
          {
            type: "text",
            text: "Reach.",
            marks: [
              { type: "brandStyle", attrs: { preset: "editorial-italic-gold" } },
            ],
          },
        ],
      },
    ],
  },
  richDescription: richText(
    "Pioneering responsible workforce deployment and practical skill assessment from Nepal to the world."
  ),
  primaryCta: {
    text: "Request Workforce",
    href: "/employers/request-workforce",
    variant: "primary",
  },
  secondaryCta: {
    text: "Discover Our Process",
    href: "/ethical-recruitment",
    variant: "ghost",
  },
  image: demoMedia.heroTraining,
  overlayEnabled: true,
  overlayColor: "#000000",
  overlayOpacity: 60,
  textAlignment: "center",
  textColor: "#FFFFFF",
  verticalAlignment: "center",
  sectionHeight: "100dvh",
  accessibilityDescription:
    "Hero image showing candidate orientation and training at Seven Seas facility",
};

// ── Statistics ────────────────────────────────────────────────

export const demoStatistics: CmsStatistic[] = [
  {
    id: "stat-1",
    label: "Global Expertise",
    value: "19",
    suffix: "+",
    description: "Years Experience",
    source: "Company Records",
    order: 1,
  },
  {
    id: "stat-2",
    label: "Trusted Network",
    value: "350",
    suffix: "+",
    description: "Employer Partners",
    source: "Partnership Records",
    order: 2,
  },
  {
    id: "stat-3",
    label: "Talent Placed",
    value: "12k",
    suffix: "+",
    description: "Candidates Deployed",
    source: "Deployment Records",
    order: 3,
  },
  {
    id: "stat-4",
    label: "Industry Focus",
    value: "8",
    description: "Recruitment Sectors",
    source: "Operations",
    order: 4,
  },
  {
    id: "stat-5",
    label: "Infrastructure",
    value: "3",
    description: "Training Facilities",
    source: "Facilities",
    order: 5,
  },
  {
    id: "stat-6",
    label: "Compliance",
    value: "100",
    suffix: "%",
    description: "RBA Committed",
    source: "Compliance Records",
    order: 6,
  },
];

// ── Client Partners ───────────────────────────────────────────

export const demoClientPartners: CmsClientPartner[] = [
  { id: "cp-1", name: "Emirates Gateway", type: "client", isPublic: true, isVerified: true, order: 1 },
  { id: "cp-2", name: "Falcon Zinc Metal", type: "client", isPublic: true, isVerified: true, order: 2 },
  { id: "cp-3", name: "Naturelle LLC", type: "client", isPublic: true, isVerified: true, order: 3 },
  { id: "cp-4", name: "Royal Falcon", type: "client", isPublic: true, isVerified: true, order: 4 },
  { id: "cp-5", name: "QBG Facilities", type: "client", isPublic: true, isVerified: true, order: 5 },
  { id: "cp-6", name: "Al Falah Security", type: "client", isPublic: true, isVerified: true, order: 6 },
  { id: "cp-7", name: "Qatar Airways", type: "client", isPublic: true, isVerified: true, order: 7 },
  { id: "cp-8", name: "Dubai Metro", type: "client", isPublic: true, isVerified: true, order: 8 },
  { id: "cp-9", name: "Al Marai", type: "client", isPublic: true, isVerified: true, order: 9 },
  { id: "cp-10", name: "Saudi Aramco", type: "client", isPublic: true, isVerified: true, order: 10 },
  { id: "gc-1", name: "DAI Hotel Pvt. Ltd.", type: "group_company", isPublic: true, isVerified: true, order: 11 },
  { id: "gc-2", name: "Cyclope Smart Security", type: "group_company", isPublic: true, isVerified: true, order: 12 },
  { id: "gc-3", name: "Smart Builder", type: "group_company", isPublic: true, isVerified: true, order: 13 },
  { id: "gc-4", name: "DAI Business Management", type: "group_company", isPublic: true, isVerified: true, order: 14 },
  { id: "gc-5", name: "Yojala Japanese Academy", type: "group_company", isPublic: true, isVerified: true, order: 15 },
  { id: "gc-6", name: "Seven Seas Group", type: "group_company", isPublic: true, isVerified: true, order: 16 },
  { id: "gc-7", name: "DAI Trading Ltd.", type: "group_company", isPublic: true, isVerified: true, order: 17 },
];

// ── Homepage Content Blocks (ordered) ─────────────────────────

export const demoHomepageBlocks: CmsContentBlock[] = [
  // SECTION 2: Introduction
  {
    id: "block-home-intro",
    blockKey: "home-introduction",
    blockType: "introduction",
    pageSlug: "home",
    order: 1,
    visible: true,
    richHeading: richHeading([
      { text: "Building " },
      { text: "Responsible", style: "editorial-italic-gold" },
      { text: " Pathways from Nepal to " },
      { text: "Global", style: "editorial-italic-light" },
      { text: " Employment." },
    ]),
    content: {
      eyebrow: "The Foundation",
      paragraphs: [
        "Our operations cover the complete recruitment cycle — from understanding employer workforce needs to identifying, screening, testing, training, documenting, and deploying qualified Nepali workers.",
        "We operate with a commitment to ethical practices, transparency, and accountability at every stage, ensuring a reliable workforce for employers and a safe transition for candidates.",
      ],
      imageTag: "Corporate Operations",
      ctaText: "Discover Seven Seas",
      ctaHref: "/about",
    },
    image: demoMedia.corporateOffice,
  },

  // SECTION 3: Manifesto / Purpose
  {
    id: "block-home-manifesto",
    blockKey: "home-manifesto",
    blockType: "manifesto",
    pageSlug: "home",
    order: 2,
    visible: true,
    content: {
      eyebrow: "01 // The Manifesto",
      sectionTitle: "Our\nPurpose.",
      statements: [
        {
          text: "We believe that responsible recruitment supports employers with ",
          highlight: "prepared talent.",
        },
        {
          text: "It protects workers through ",
          highlight: "transparent processes",
          suffix: " and accountability.",
        },
        {
          text: "It uplifts families and strengthens ",
          highlight: "Nepal's workforce ecosystem.",
        },
      ],
      ctaText: "Explore Mission & Values",
      ctaHref: "/about/mission-vision-values",
    },
  },

  // SECTION 4: Statistics
  // The Prisma repository reads these from `content.stats` on this block, so the
  // canonical demoStatistics array is stored here rather than left empty. Both
  // repositories therefore serve the same figures from a single source.
  {
    id: "block-home-stats",
    blockKey: "home-statistics",
    blockType: "statistics",
    pageSlug: "home",
    order: 3,
    visible: true,
    content: { stats: demoStatistics },
  },

  // SECTION 5: Workforce Solutions
  {
    id: "block-home-services",
    blockKey: "home-services",
    blockType: "service_list",
    pageSlug: "home",
    order: 4,
    visible: true,
    richHeading: richHeading([
      { text: "Workforce " },
      { text: "Solutions.", style: "editorial-italic-gold" },
    ]),
    content: {
      eyebrow: "Our Capabilities",
      description:
        "End-to-end support for employers, seamlessly connecting requirement planning to international candidate mobilisation.",
      services: [
        {
          title: "Candidate Sourcing",
          desc: "Targeted identification of qualified candidates across Nepal through verified channels.",
          href: "/employers/candidate-sourcing",
        },
        {
          title: "Screening & Verification",
          desc: "Comprehensive background checks, medical screening, and document verification.",
          href: "/employers/screening",
        },
        {
          title: "Trade Testing",
          desc: "Practical skill evaluation at our dedicated technical assessment centres.",
          href: "/employers/trade-testing",
        },
        {
          title: "Training & Orientation",
          desc: "Pre-departure preparation, language basics, and cultural orientation.",
          href: "/employers/training",
        },
        {
          title: "Documentation",
          desc: "Complete management of visa, ticketing, and government approval processes.",
          href: "/employers/documentation",
        },
        {
          title: "Deployment Support",
          desc: "Airport mobilisation, travel coordination, and post-deployment follow-up.",
          href: "/employers/deployment",
        },
      ],
    },
  },

  // SECTION 6: Ethical Recruitment Pillars
  {
    id: "block-home-ethical",
    blockKey: "home-ethical",
    blockType: "pillar_grid",
    pageSlug: "home",
    order: 5,
    visible: true,
    richHeading: richHeading([
      { text: "Ethical Recruitment " },
      { text: "By Design.", style: "editorial-italic-gold" },
    ]),
    content: {
      eyebrow: "Our Framework",
      description:
        "We adhere strictly to Responsible Business Alliance (RBA) guidelines, ensuring fair treatment, zero recruitment fees, and total transparency for every candidate.",
      ctaText: "Read the Framework",
      ctaHref: "/ethical-recruitment",
      pillars: [
        { title: "Clear Job Information & Contracts", offset: "lg:mt-0" },
        { title: "Responsible Candidate Sourcing", offset: "lg:mt-12" },
        { title: "Skill & Document Verification", offset: "lg:mt-24" },
        { title: "Pre-Departure Preparation", offset: "lg:mt-12" },
        { title: "Grievance & Feedback Access", offset: "lg:mt-0" },
      ],
    },
  },

  // SECTION 7: Industries Grid
  {
    id: "block-home-industries",
    blockKey: "home-industries",
    blockType: "industry_grid",
    pageSlug: "home",
    order: 6,
    visible: true,
    richHeading: richHeading([
      { text: "Industries We " },
      { text: "Support.", style: "editorial-italic-gold" },
    ]),
    content: {
      eyebrow: "Global Sectors",
      description:
        "We recruit specialised talent across 8 core sectors, matching rigorous employer requirements with highly prepared candidates.",
      industries: [
        { title: "Security Services", href: "/industries/security-services" },
        { title: "Construction & Technical Trades", href: "/industries/construction-and-technical-trades" },
        { title: "Hospitality & Hotels", href: "/industries/hospitality-and-hotels" },
        { title: "Facility Management", href: "/industries/facility-management" },
        { title: "Aviation & Ground Handling", href: "/industries/aviation-and-ground-handling" },
        { title: "Manufacturing", href: "/industries/manufacturing" },
        { title: "Healthcare Support", href: "/industries/healthcare-support" },
        { title: "Logistics & Transport", href: "/industries/logistics-and-transport" },
      ],
    },
  },

  // SECTION 8: Training Bento Grid
  {
    id: "block-home-training",
    blockKey: "home-training",
    blockType: "training_bento",
    pageSlug: "home",
    order: 7,
    visible: true,
    richHeading: richHeading([
      { text: "Prepared Before " },
      { text: "Deployment.", style: "editorial-italic-gold" },
    ]),
    content: {
      eyebrow: "Our Infrastructure",
      description:
        "Our purpose-built facilities ensure candidates are technically assessed, culturally prepared, and fully briefed before mobilisation.",
      ctaText: "Explore Facilities",
      ctaHref: "/training-facilities",
      facilities: [
        {
          label: "Facility 01",
          title: "Technical Trade Test Centre",
          imageId: "media-trade-test",
          imageSrc: "/images/trade_test_centre_1782920400836.png",
          imageAlt: "Trade Test Centre",
          span: "main",
        },
        {
          label: "Facility 02",
          title: "Orientation Hall",
          imageId: "media-hero-training",
          imageSrc: "/images/hero_training_orientation_1782920391505.png",
          imageAlt: "Training Hall",
          span: "top-right",
        },
        {
          label: "Facility 03",
          title: "Interview Rooms",
          imageId: "media-corporate-office",
          imageSrc: "/images/corporate_office_interview_1782920412325.png",
          imageAlt: "Interview Area",
          span: "bottom-right",
        },
      ],
    },
  },

  // SECTION 9: Talent Dashboard (special)
  {
    id: "block-home-intelligence",
    blockKey: "home-intelligence",
    blockType: "map_intelligence",
    pageSlug: "home",
    order: 8,
    visible: true,
    content: {},
  },

  // SECTION 10: Trust Centre
  {
    id: "block-home-trust",
    blockKey: "home-trust",
    blockType: "trust_centre",
    pageSlug: "home",
    order: 9,
    visible: true,
    content: {
      eyebrow: "Verified & Certified",
      heading: "Trust Is Documented.",
      headingHighlight: "Documented.",
      description:
        "Absolute transparency across our global operations. Review our official licences, international certifications, and binding corporate policies.",
      ctaText: "Access Full Vault",
      ctaHref: "/trust-centre",
      documents: [
        { title: "License of Foreign Employment", type: "Government Licence", date: "Updated 2024", id: "001" },
        { title: "Authority Certificate — Sending Trainee Workers to Japan", type: "Certification", date: "2023", id: "002" },
        { title: "Certificate of Incorporation of Company", type: "Certification", date: "2023", id: "003" },
      ],
    },
  },

  // SECTION 11: Foreign Employer Testimonials
  {
    id: "block-home-testimonials",
    blockKey: "home-testimonials",
    blockType: "testimonial",
    pageSlug: "home",
    order: 10,
    visible: true,
    content: {
      eyebrow: "Foreign Employer Testimonials",
      heading: "Trusted by International Employers",
      introduction: "",
      testimonials: [{
        quote: "Placeholder testimonial - replace in CMS before production.",
        companyLogo: "",
        personName: "",
        designation: "",
        companyName: "",
        country: "",
        isPublished: false,
      }],
    },
  },

  // SECTION 11.5: Client Partners & Group Companies (data from demoClientPartners)
  {
    id: "block-home-partners",
    blockKey: "home-partners",
    blockType: "client_marquee",
    pageSlug: "home",
    order: 11,
    visible: true,
    content: {
      heading: "Global Partners",
      subheading: "Trusted by Industry Leaders Worldwide",
    },
  },

  // SECTION 12: Success Stories
  {
    id: "block-home-stories",
    blockKey: "home-stories",
    blockType: "story_grid",
    pageSlug: "home",
    order: 12,
    visible: true,
    content: {
      heading: "Real Outcomes.",
      headingHighlight: "Outcomes.",
      ctaText: "Explore Archive",
      ctaHref: "/success-stories",
      stories: [
        {
          type: "candidate",
          country: "Qatar",
          title: "From Trainee to Site Supervisor",
          desc: "How ethical recruitment and proper skills training paved the way for long-term career progression in the construction sector.",
          imageSrc: "/images/trade_test_centre_1782920400836.png",
          imageAlt: "Candidate Story",
        },
        {
          type: "employer",
          country: "UAE",
          title: "Scaling Operations with Reliable Talent",
          desc: "Partnering with Seven Seas to streamline the screening, documentation, and deployment of 200+ trained personnel for mega projects.",
          imageSrc: "/images/corporate_office_interview_1782920412325.png",
          imageAlt: "Employer Story",
        },
      ],
    },
  },

  // SECTION 13: Insights & Newsroom
  {
    id: "block-home-insights",
    blockKey: "home-insights",
    blockType: "insight_preview",
    pageSlug: "home",
    order: 13,
    visible: true,
    content: {
      eyebrow: "13 // Intelligence",
      heading: "Latest\nInsights.",
      ctaText: "View Full Newsroom",
      ctaHref: "/insights",
      articles: [
        { category: "Market Update", date: "Oct 2024", title: "Shifts in Gulf Construction Workforce Demand" },
        { category: "Ethical Guide", date: "Sep 2024", title: "Implementing RBA Standards in Recruitment" },
        { category: "Company News", date: "Aug 2024", title: "New Trade Test Centre Opens in Kathmandu" },
      ],
    },
  },

  // SECTION 14: Final CTA
  {
    id: "block-home-final-cta",
    blockKey: "home-final-cta",
    blockType: "final_cta",
    pageSlug: "home",
    order: 14,
    visible: true,
    richHeading: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            { type: "text", text: "Transparent for candidates." },
            { type: "hardBreak" },
            {
              type: "text",
              text: "Dependable for employers.",
              marks: [{ type: "brandStyle", attrs: { preset: "muted-supporting" } }],
            },
            { type: "hardBreak" },
            {
              type: "text",
              text: "Responsible for all.",
              marks: [{ type: "brandStyle", attrs: { preset: "editorial-italic-gold" } }],
            },
          ],
        },
      ],
    },
    content: {
      eyebrow: "The Seven Seas Promise",
      primaryCta: { text: "Partner With Us", href: "/employers/request-workforce" },
      secondaryCta: { text: "Contact Office", href: "/contact" },
    },
  },
];

// ── Composed Homepage ─────────────────────────────────────────

export const demoHomepage: CmsPage = {
  id: "page-home",
  slug: "home",
  title: "Seven Seas Intercontinental | Ethical Workforce Solutions from Nepal",
  template: "homepage",
  status: "PUBLISHED",
  seo: {
    metaTitle: "Seven Seas Intercontinental | Ethical Workforce Solutions from Nepal",
    metaDescription:
      "Nepal's trusted ethical recruitment agency. RBA-aligned workforce deployment, trade testing, and training for global employers across 8 sectors.",
    ogTitle: "Seven Seas Intercontinental",
    ogDescription: "Responsible recruitment and prepared workforce deployment from Nepal to the world.",
  },
  hero: demoHomepageHero,
  blocks: demoHomepageBlocks,
  publishedAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-05T00:00:00Z",
};

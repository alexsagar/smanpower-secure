// ============================================================
// Seven Seas Intercontinental — CMS Content Types
// ============================================================
// Shared type definitions used by both DemoContentRepository
// and PrismaContentRepository. The frontend imports these
// types exclusively — it never knows which backend is active.
// ============================================================

// ── Tiptap Rich Text ──────────────────────────────────────────

/** Tiptap JSON document — stored in DB JSON columns or demo fixtures */
export type TiptapContent = {
  type: "doc";
  content: TiptapNode[];
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

// ── Brand Text Style Presets ──────────────────────────────────

export const TEXT_STYLE_PRESETS = [
  "default-body",
  "editorial-italic-gold",
  "editorial-italic-light",
  "gold-emphasis",
  "muted-supporting",
  "white-emphasis",
  "pull-quote",
  "small-eyebrow",
  "cta-link-style",
] as const;

export type TextStylePreset = (typeof TEXT_STYLE_PRESETS)[number];

// ── Media ─────────────────────────────────────────────────────

export type MediaSource = "LOCAL_DEMO" | "CLOUDINARY";

export type MediaStatus =
  | "AI_PLACEHOLDER"
  | "REAL_APPROVED"
  | "STOCK_LICENSED"
  | "INTERNAL_DOCUMENT";

export type MediaVisibility = "PUBLIC" | "PRIVATE";

export type MediaResourceType = "image" | "video" | "document";

export interface CmsMediaAsset {
  id: string;
  source: MediaSource;
  localPath?: string;
  cloudinaryPublicId?: string;
  cloudinaryAssetId?: string;
  secureUrl?: string;
  resourceType: MediaResourceType;
  format?: string;
  width?: number;
  height?: number;
  duration?: number; // video seconds
  bytes?: number;
  fileName: string;
  altText: string;
  caption?: string;
  internalNotes?: string;
  folder?: string;
  tags?: string[];
  mediaStatus: MediaStatus;
  visibility: MediaVisibility;
  focalPointX?: number; // 0-100
  focalPointY?: number; // 0-100
  createdAt: string;
  updatedAt?: string;
}

// ── Hero Section ──────────────────────────────────────────────

export type HeroType = "image" | "video" | "plain" | "split" | "text-only";

export interface CmsHeroCTA {
  text: string;
  href: string;
  variant: "primary" | "secondary" | "outline" | "ghost";
}

export interface CmsHeroSection {
  id: string;
  pageSlug: string;
  heroType: HeroType;
  eyebrow?: string;
  richHeading: TiptapContent;
  richDescription?: TiptapContent;
  primaryCta?: CmsHeroCTA;
  secondaryCta?: CmsHeroCTA;
  image?: CmsMediaAsset;
  video?: CmsMediaAsset;
  videoPoster?: CmsMediaAsset;
  mobileImage?: CmsMediaAsset;
  overlayEnabled: boolean;
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
  textAlignment: "left" | "center" | "right";
  textColor?: string;
  verticalAlignment: "top" | "center" | "bottom";
  sectionHeight?: string; // e.g. "100dvh", "80vh"
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoControls?: boolean;
  accessibilityDescription?: string;
}

// ── Content Blocks ────────────────────────────────────────────

export type ContentBlockType =
  | "hero"
  | "introduction"
  | "manifesto"
  | "statistics"
  | "service_list"
  | "pillar_grid"
  | "industry_grid"
  | "training_bento"
  | "trust_centre"
  | "community"
  | "client_marquee"
  | "story_grid"
  | "insight_preview"
  | "final_cta"
  | "text"
  | "stats_grid"
  | "core_values"
  | "editorial"
  | "process_flow"
  | "solutions_grid"
  | "advantage"
  | "pledge"
  | "timeline_grid"
  | "dynamic_industry_grid"
  | "dynamic_facilities_grid"
  | "dynamic_vault_grid"
  | "rich_text"
  | "image_text"
  | "video_text"
  | "full_width_image"
  | "image_gallery"
  | "timeline"
  | "process_steps"
  | "team_grid"
  | "testimonial"
  | "faq_accordion"
  | "document_list"
  | "certification"
  | "cta_banner"
  | "divider"
  | "two_column"
  | "three_column"
  | "quote"
  | "table"
  | "related_content"
  | "contact_form"
  | "employer_enquiry"
  | "job_listing"
  | "map_intelligence";

export interface CmsContentBlock {
  id: string;
  blockKey: string; // stable identifier for upserts
  blockType: ContentBlockType;
  pageSlug: string;
  order: number;
  visible: boolean;
  // Flexible content — shape depends on blockType
  content: Record<string, unknown>;
  // Common optional fields
  richHeading?: TiptapContent;
  richBody?: TiptapContent;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundStyle?: "light" | "dark" | "white" | "brand";
  image?: CmsMediaAsset;
  video?: CmsMediaAsset;
  videoPoster?: CmsMediaAsset;
  mobileImage?: CmsMediaAsset;
}

// ── Pages ─────────────────────────────────────────────────────

export type PageStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";

export interface CmsPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  template?: string;
  status: PageStatus;
  seo: CmsPageSeo;
  hero?: CmsHeroSection;
  blocks: CmsContentBlock[];
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
}

// ── Navigation ────────────────────────────────────────────────

export type NavLocation = "header" | "footer" | "mega_menu";

export interface CmsNavItem {
  id: string;
  label: string;
  labelNe?: string;
  href?: string;
  description?: string;
  descriptionNe?: string;
  icon?: string;
  children?: CmsNavItem[];
  order: number;
  isActive: boolean;
}

export interface CmsNavigation {
  id: string;
  label: string;
  labelNe?: string;
  location: NavLocation;
  items: CmsNavItem[];
  order: number;
}

// ── Site Settings ─────────────────────────────────────────────

export interface CmsSiteSettings {
  companyName: string;
  companyShortName: string;
  companyLegalName: string;
  tagline: string;
  website: string;
  domain: string;
  logoUrl: string;
  address: string;
  addressLine2?: string;
  city: string;
  province?: string;
  country: string;
  postalCode?: string;
  phone: string;
  email: string;
  whatsapp: string;
  officeHours?: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  defaultSeo: CmsPageSeo;
}

export interface CmsFooterSettings {
  tagline: string;
  ctaText: string;
  ctaHref: string;
  sections: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  legalLinks: { label: string; href: string }[];
  copyrightText: string;
}

// ── Domain Content ────────────────────────────────────────────

export interface CmsStatistic {
  id: string;
  label: string;
  value: string;
  suffix?: string; // e.g. "+", "%"
  description: string;
  source?: string;
  order: number;
}

export interface CmsSuccessStory {
  id: string;
  slug: string;
  title: string;
  titleNe?: string;
  summary?: string;
  content: string;
  richContent?: TiptapContent;
  storyType: import("@prisma/client").StoryType;
  featuredImageId?: string | null;
  featuredImage?: CmsMediaAsset | null;
  personName?: string;
  showPersonName?: boolean;
  quote?: string;
  country?: string;
  industry?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  status?: import("@prisma/client").ContentStatus;
  isPublished?: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CmsTestimonial {
  id: string;
  personName: string;
  designation?: string;
  companyName?: string;
  content: string;
  image?: CmsMediaAsset;
  rating?: number;
  storyType: "candidate" | "employer";
  consentGiven: boolean;
  isPublished: boolean;
  order: number;
}

export interface CmsJob {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  benefits?: string;
  responsibilities?: string;
  country: string;
  countryCode?: string;
  industry: string;
  employerName?: string;
  showEmployerName: boolean;
  salary?: string;
  showSalary: boolean;
  contractPeriod?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY";
  experienceRequired?: string;
  skillsRequired?: string;
  educationRequired?: string;
  languageRequired?: string;
  documentsRequired?: string;
  deadline?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "EXPIRED" | "ARCHIVED";
  isFeatured: boolean;
  vacancies: number;
  feeNotice?: string;
  safetyNotice?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
}

// ── Demands ──────────────────────────────────────────────────

export type DemandStatusValue =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "CLOSED"
  | "ARCHIVED";

export type DemandStatusBadge =
  | "Open"
  | "Closing Soon"
  | "Closed"
  | "Upcoming";

export type FacilityStatusValue =
  | "PROVIDED"
  | "NOT_PROVIDED"
  | "ALLOWANCE_PROVIDED"
  | "NOT_SPECIFIED";

export type OvertimeStatusValue = "YES" | "NO" | "NOT_SPECIFIED";

export type PositionStatusValue = "OPEN" | "CLOSED" | "FILLED" | "ON_HOLD";

export type PassportStatusValue =
  | "VALID"
  | "EXPIRED_OR_EXPIRING"
  | "NO_PASSPORT";

export interface CmsDemandPosition {
  id: string;
  demandId: string;
  displayOrder: number;
  title: string;
  maleCount?: number;
  femaleCount?: number;
  totalCount: number;
  minimumQualification?: string;
  requiredExperience?: string;
  requiredSkills?: string;
  salaryCurrency?: string;
  salaryAmount?: string;
  nprEquivalent?: string;
  overtimeStatus: OvertimeStatusValue;
  overtimeNotes?: string;
  workHoursPerDay?: string;
  workDaysPerWeek?: string;
  annualLeave?: string;
  foodFacilityStatus: FacilityStatusValue;
  foodFacilityNotes?: string;
  accommodationStatus: FacilityStatusValue;
  accommodationNotes?: string;
  contractPeriod?: string;
  otherBenefits?: string;
  deadlineOverride?: string;
  status: PositionStatusValue;
  isPublic: boolean;
}

export interface CmsDemandDocument {
  id: string;
  demandId: string;
  mediaAssetId?: string;
  mediaAsset?: CmsMediaAsset;
  documentType: string;
  title?: string;
  description?: string;
  issueDate?: string;
  expiryDate?: string;
  visibility: "PUBLIC" | "PRIVATE";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface CmsDemand {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyLogo?: CmsMediaAsset;
  industry?: string;
  industrySlug?: string;
  country: string;
  countryCode?: string;
  city?: string;
  employerAddress?: string;
  demandReferenceNumber?: string;
  approvalDate?: string;
  receivedDate?: string;
  applicationStartDate?: string;
  applicationDeadline?: string;
  interviewDate?: string;
  interviewLocation?: string;
  contractType?: string;
  generalNotes?: string;
  status: DemandStatusValue;
  statusBadge: DemandStatusBadge;
  isPublic: boolean;
  // Application settings
  enableApplication: boolean;
  requiredApplicationDocuments?: string;
  candidateInstructions?: string;
  feeTransparencyNotice?: string;
  candidateSafetyNotice?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  applicationConfirmationMessage?: string;
  // SEO
  seoTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  // Computed
  totalPositions: number;
  totalManpower: number;
  positions: CmsDemandPosition[];
  documents: CmsDemandDocument[];
  // Timestamps
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdByName?: string;
}

export interface CmsDemandFilters {
  country?: string;
  city?: string;
  company?: string;
  industry?: string;
  position?: string;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: DemandStatusBadge;
  deadlineBefore?: string;
  interviewAfter?: string;
  contractDuration?: string;
  foodAvailable?: boolean;
  accommodationAvailable?: boolean;
}

export interface CmsIndustry {
  id: string;
  name: string;
  nameNe?: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: CmsMediaAsset;
  order: number;
  isActive: boolean;
  // Extended content for industry detail page
  pageContent?: {
    heroImage?: CmsMediaAsset;
    missionHeading?: string;
    missionText?: string[];
    features?: { title: string; desc: string }[];
  };
}

export interface CmsComplianceDocument {
  id: string;
  title: string;
  titleNe?: string;
  description?: string;
  documentType: "licence" | "certificate" | "policy";
  issueDate?: string;
  expiryDate?: string;
  file?: CmsMediaAsset;
  isPublic: boolean;
  isVerified: boolean;
  order: number;
}

export interface CmsTrainingFacility {
  id: string;
  name: string;
  nameNe?: string;
  slug: string;
  description?: string;
  location?: string;
  capacity?: number;
  images?: CmsMediaAsset[];
  isActive: boolean;
  // Extended content for detail page
  pageContent?: {
    heroImage?: CmsMediaAsset;
    missionHeading?: string;
    missionText?: string[];
    features?: { title: string; desc: string }[];
  };
}

export interface CmsInsightArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  richContent?: TiptapContent;
  featuredImage?: CmsMediaAsset;
  category?: string;
  authorName?: string;
  publishDate?: string;
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  readingTime?: string;
}

export interface CmsTeamMember {
  id: string;
  name: string;
  nameNe?: string;
  designation: string;
  department?: string;
  bio?: string;
  photo?: CmsMediaAsset;
  email?: string;
  phone?: string;
  linkedIn?: string;
  order: number;
  isPublished: boolean;
}

export interface CmsClientPartner {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  country?: string;
  industry?: string;
  type: "client" | "group_company";
  isPublic: boolean;
  isVerified: boolean;
  order: number;
}

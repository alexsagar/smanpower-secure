/**
 * Editable copy for public pages that render their own JSX rather than CMS
 * blocks (legal pages, About sub-pages, listing wrappers, and the copy around
 * functional forms).
 *
 * These objects are the CURRENT LIVE COPY, extracted verbatim from the page
 * components. They serve two purposes:
 *
 *  1. the migration script writes them into the CMS unchanged, and
 *  2. they remain the fallback, so a page whose CMS record is missing or
 *     unpublished renders exactly as it does today.
 *
 * Only editorial content lives here. Form validation, Turnstile, consent rules,
 * queries and business logic stay in code.
 */

export type PageCopy = Record<string, unknown>;

/** Deep-merges stored CMS copy over the defaults, field by field. */
export function mergePageCopy<T extends PageCopy>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }

  const source = stored as Record<string, unknown>;
  const result: Record<string, unknown> = { ...defaults };

  for (const [key, fallbackValue] of Object.entries(defaults)) {
    const value = source[key];

    if (value === undefined || value === null) continue;

    // Blank strings fall back so a cleared field cannot silently empty the page.
    if (typeof fallbackValue === "string") {
      if (typeof value === "string" && value.trim()) result[key] = value;
      continue;
    }

    if (Array.isArray(fallbackValue)) {
      if (Array.isArray(value) && value.length > 0) result[key] = value;
      continue;
    }

    if (fallbackValue && typeof fallbackValue === "object") {
      result[key] = mergePageCopy(fallbackValue as PageCopy, value);
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

// ── Legal ─────────────────────────────────────────────────────

export const privacyPolicyCopy = {
  headingLead: "Privacy",
  headingHighlight: "Policy",
  lastUpdatedLabel: "Last updated:",
  intro:
    "At Seven Seas Intercontinental, we are committed to protecting the privacy and security of our clients, partners, and candidates. This Privacy Policy outlines how we collect, use, and protect your personal information.",
  sections: [
    {
      heading: "1. Information We Collect",
      body: "We may collect personal information such as your name, contact details, employment history, and educational background when you submit a job application, inquire about our services, or interact with our website.",
    },
    {
      heading: "2. How We Use Your Information",
      body: "The information we collect is strictly used to facilitate the recruitment process, respond to inquiries, and improve our services. We do not sell or rent your personal information to third parties.",
    },
    {
      heading: "3. Data Security",
      body: "We employ industry-standard security measures to ensure that your personal information is protected from unauthorized access, alteration, or disclosure.",
    },
    {
      heading: "4. Your Rights",
      body: "You have the right to access, update, or request the deletion of your personal information at any time. For any privacy-related concerns, please contact us at info@smanpower.com.",
    },
  ],
};

export const termsOfServiceCopy = {
  headingLead: "Terms of",
  headingHighlight: "Service",
  lastUpdatedLabel: "Last updated:",
  intro:
    "By accessing and using the Seven Seas Intercontinental website and services, you agree to comply with and be bound by the following terms and conditions.",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "These Terms of Service govern your use of our website and services. If you do not agree with any part of these terms, please refrain from using our services.",
    },
    {
      heading: "2. Use of Services",
      body: "Our platform connects candidates with foreign job opportunities. While we strive to ensure the accuracy of all job postings, we cannot guarantee employment, visa approvals, or specific conditions set by foreign employers.",
    },
    {
      heading: "3. Zero-Tolerance Policy",
      body: "We operate strictly under the ethical recruitment guidelines of the Government of Nepal. Any fraudulent activities, forged documents, or illegal payments will result in immediate disqualification and reporting to the authorities.",
    },
    {
      heading: "4. Limitation of Liability",
      body: "Seven Seas Intercontinental shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or website content.",
    },
  ],
  // Rendered with the contact address as a mailto link.
  contactSection: {
    heading: "5. Contact Us",
    bodyLead:
      "If you have any questions regarding these terms, please contact our administrative team at ",
    email: "info@smanpower.com",
    bodyAfter: ".",
  },
};

// ── About ─────────────────────────────────────────────────────

export const missionVisionValuesCopy = {
  hero: {
    title: "Purpose-Driven Recruitment.",
    subtitle: "Mission & Vision",
    imageSrc: "/images/corporate_office_interview_1782920412325.png",
  },
  vision: {
    title: "Our Vision for the Future of Work.",
    subtitle: "The Vision",
    lead: "To be the most trusted, transparent, and ethical bridge between Nepal's highly capable workforce and global employment opportunities.",
    body: "We envision a future where international recruitment is universally safe, employer-paid, and free from exploitation. By setting the gold standard in Nepal for responsible recruitment, we aim to elevate the dignity of Nepali workers on the global stage while providing our international partners with unparalleled talent.",
  },
  mission: {
    eyebrow: "The Mission",
    heading: "Connecting Potential with Opportunity, Responsibly.",
    body: "Our mission is to consistently deliver exceptional, deployment-ready talent to global employers while fiercely protecting the rights, dignity, and financial well-being of every candidate we represent.",
  },
  values: {
    eyebrow: "The Principles",
    heading: "Our Foundational Values.",
    // Icons are design and stay in code, matched to these items by position.
    items: [
      {
        step: "01",
        title: "Ethical Integrity",
        desc: "We strictly adhere to RBA guidelines and employer-paid principles. Zero recruitment fees to candidates, ensuring no one falls into debt bondage.",
      },
      {
        step: "02",
        title: "Radical Transparency",
        desc: "Clear communication with both employers and candidates. No hidden fees, no false promises, just documented reality at every single stage.",
      },
      {
        step: "03",
        title: "Excellence in Preparation",
        desc: "Through our dedicated trade testing and training centres, we ensure every worker is culturally and technically ready before deployment.",
      },
      {
        step: "04",
        title: "Human Dignity",
        desc: "We treat every candidate with profound respect. Their success is our success, and their welfare is our absolute highest priority.",
      },
    ],
  },
};

export const ourStoryCopy = {
  hero: {
    title: "From Nepal to the World.",
    subtitle: "Our Story",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  beginning: {
    title: "A Journey of Integrity.",
    subtitle: "The Beginning",
    lead: "Seven Seas Intercontinental was founded on a singular belief: international recruitment does not have to be exploitative.",
    paragraphs: [
      "Over the past 15+ years, we have grown from a small local agency into an ethical recruitment business focused on transparent processes. We recognized early on that the traditional recruitment model was broken — candidates were often burdened with debt, and employers were receiving underprepared workers.",
      "We rebuilt the model from the ground up. By pioneering the employer-paid model in Nepal and establishing world-class trade testing facilities, we proved that ethical recruitment is not just the right thing to do — it is the best way to do business.",
    ],
  },
  quote: {
    text: "\"We don't just find workers. We build global careers.\"",
  },
  timeline: {
    eyebrow: "The History",
    heading: "Our Evolution.",
    milestones: [
      { year: "2008", title: "The Foundation", desc: "Seven Seas Intercontinental is established in Kathmandu with a vision to revolutionize the recruitment landscape by removing exploitative fees." },
      { year: "2013", title: "Middle East Expansion", desc: "Opened our first coordination offices in Dubai and Doha to ensure on-the-ground support and grievance handling for our deployed workers." },
      { year: "2018", title: "RBA Alignment", desc: "Expanded internal processes around Responsible Business Alliance (RBA) guidance and employer-paid recruitment practices." },
      { year: "2023", title: "Operational Expansion", desc: "Continued investing in training capacity, documentation workflows, and worker-support processes." },
    ],
  },
  philosophy: {
    headingLead: "The Philosophy",
    headingHighlight: "That Drives Us.",
    lead: "We measure our success not just by the number of workers we deploy, but by the generational impact those deployments have on their families back home.",
    body: "Ethical recruitment is the cornerstone of sustainable business. When candidates are treated fairly and employers receive trained, motivated talent, the entire global economy benefits. This philosophy is deeply ingrained in every operation at Seven Seas.",
  },
};

export const communityImpactCopy = {
  hero: {
    title: "Uplifting Communities.",
    subtitle: "Our Impact",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  intro: {
    title: "More Than Just Jobs.",
    subtitle: "Community Empowerment",
    lead: "When we secure a safe, employer-paid international job for a Nepali worker, we are not just changing their life — we are uplifting their entire community.",
    paragraphs: [
      "Remittances are the backbone of Nepal's economy. By ensuring that our workers do not have to pay exorbitant recruitment fees, they are able to send 100% of their savings back home from day one. This money goes directly into local communities, funding education, healthcare, and infrastructure across all seven provinces.",
      "Through ethical recruitment, we turn international labor migration from a cycle of debt into an engine for sustainable national development.",
    ],
  },
  stats: [
    { number: "50k+", label: "Workers Deployed Safely" },
    { number: "100%", label: "Zero-Fee Compliance" },
    { number: "7", label: "Provinces Reached" },
    { number: "$10M+", label: "Est. Annual Remittance Impact" },
  ],
  pillars: {
    eyebrow: "The Ripple Effect",
    headingLine1: "How Ethical Recruitment ",
    headingLine2: "Transforms Nepal.",
    // Icons are design and stay in code, matched to these items by position.
    items: [
      { title: "Economic Independence", desc: "By enforcing zero-fee recruitment, workers retain 100% of their earnings, instantly pulling their families into the middle class." },
      { title: "Education Access", desc: "Remittances generated through our safe deployment channels fund the education of thousands of children in rural Nepal every year." },
      { title: "Healthcare Funding", desc: "Families of deployed workers can afford better medical care, significantly improving the life expectancy and health outcomes of their communities." },
      { title: "Local Infrastructure", desc: "Returning workers invest their savings into local businesses, housing, and community infrastructure, creating secondary job markets." },
    ],
  },
  returning: {
    headingLead: "Returning with ",
    headingHighlight: "More Than Capital.",
    lead: "Workers who deploy through our RBA-aligned pipelines don't just return with financial capital; they return with human capital.",
    body: "Having worked in world-class facilities abroad, they bring back international standards of safety, quality, and technical expertise. Many of our returning candidates go on to become entrepreneurs, foremen, and leaders within Nepal's own developing industries. By enabling safe migration, we are accelerating the transfer of global skills back to the local economy.",
  },
};

export const leadershipCopy = {
  hero: {
    title: "Guided by Experience.",
    subtitle: "Our Leadership",
    imageSrc: "/images/corporate_office_interview_1782920412325.png",
  },
  intro: {
    title: "Commitment from the Top Down.",
    subtitle: "Executive Team",
    lead: "Ethical recruitment is not just a policy; it requires active leadership, continuous oversight, and an unwavering commitment to doing the right thing.",
    body: "Our executive team brings decades of combined experience in international labor laws, cross-border deployment logistics, and human rights advocacy. They lead by example, ensuring that our zero-tolerance policy against exploitation is enforced at every level of the organization, from our sourcing partners in remote villages to our corporate offices in Kathmandu.",
  },
  chairmanQuote: {
    quote:
      "\"We have built Seven Seas on a foundation of transparency. When an employer partners with us, they should be able to expect clear processes and accountable conduct.\"",
    attribution: "Chairman & Founder",
    organisation: "Seven Seas Intercontinental",
  },
  board: {
    eyebrow: "The Board",
    heading: "Meet the Directors.",
    // Shown when the team-members collection returns no leadership profiles.
    emptyState: "Leadership profiles are being updated.",
  },
  accountability: {
    eyebrow: "Our Core Belief",
    heading: "Accountability at the highest level.",
    lead: "We believe that ethical compliance cannot be outsourced or delegated. It must be woven into the fabric of the organization starting from the board room.",
    body: "Our directors are deeply involved in the daily operations of our sourcing networks, training centers, and deployment pipelines. By maintaining a hands-on approach, we ensure that our promises of transparency and zero-fees are not just marketing slogans, but operational realities.",
    badgeTitle: "RBA-Aligned",
    badgeSubtitle: "Executive leadership training context",
  },
};

export const ourPeopleCopy = {
  hero: {
    title: "The Heart of Seven Seas.",
    subtitle: "Our People",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  intro: {
    title: "Powered by Passion.",
    subtitle: "Our Team",
    lead: "Behind every successful deployment is a team of over 150 dedicated professionals working tirelessly across Nepal and the Middle East.",
    paragraphs: [
      "Ethical recruitment requires more than just good intentions—it requires incredible logistical precision and deep human empathy. Our staff comprises former expatriate workers, legal experts, certified trainers, and logistics specialists who understand the migration journey firsthand.",
      "We invest heavily in the continuous training of our own people, ensuring that every team member is fully versed in RBA guidelines, international labor laws, and modern human resources practices.",
    ],
  },
  departments: {
    eyebrow: "The Engine",
    heading: "The People Behind the Process.",
    emptyState: "Team profiles are being updated.",
  },
  bandHeadingLead: "One Team. ",
  bandHeadingHighlight: "One Mission.",
  culture: {
    headingLead: "A Culture of ",
    headingHighlight: "Excellence.",
    lead: "We don't just demand high standards from the candidates we deploy; we demand it from ourselves.",
    items: [
      { title: "Continuous Learning", desc: "Our staff undergoes rigorous monthly training to stay updated on the latest compliance protocols and international labor laws." },
      { title: "Zero-Tolerance Policy", desc: "Every employee signs a strict ethical compliance agreement. Any breach of our zero-fee policy results in immediate termination." },
      { title: "Empathy First", desc: "We treat every candidate exactly how we would want our own family members treated if they were moving abroad for work." },
    ],
  },
};

// ── Listing wrappers ──────────────────────────────────────────
// Only the surrounding copy is CMS-driven; the collection queries and card
// rendering on these pages are untouched.

export const insightsCopy = {
  readMoreLabel: "Read Article",
  hero: {
    title: "Published Insights.",
    subtitle: "Insights",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  emptyState: {
    heading: "No insights are published yet.",
    body: "Please check back soon.",
  },
};

export const newsCopy = {
  readMoreLabel: "Read Update",
  hero: {
    title: "Newsroom.",
    subtitle: "Newsroom",
    imageSrc: "/images/trade_test_centre_1782920400836.png",
  },
  emptyState: {
    heading: "No news has been published yet.",
    body: "Please check back soon.",
  },
};

export const careersCopy = {
  viewOpeningLabel: "View Opening",
  hero: {
    title: "Careers.",
    subtitle: "Join Our Team",
    imageSrc: "/images/corporate_office_interview_1782920412325.png",
  },
  emptyState: {
    heading: "No current openings.",
    body: "Please check back later or contact us.",
  },
};

// ── Functional pages ──────────────────────────────────────────
// Copy only. Form fields, validation, Turnstile, consent and submission
// handling remain entirely in code.

export const contactCopy = {
  hero: {
    title: "Contact Our Nepal Manpower Agency",
    subtitle:
      "Whether you are an international employer seeking to hire Nepali workers or a candidate looking for foreign demands, our Kathmandu-based team is ready to assist. Candidates should apply only through the official Demands page and should not send CVs or documents through the general corporate inquiry form.",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  details: {
    eyebrow: "Global Inquiries",
    heading: "Global Reach, Local Support.",
    body: "Our Kathmandu-based team is ready to assist. Candidates should apply only through the official Demands page and should not send CVs or documents through the general corporate inquiry form.",
    // Icons stay in code, matched to these entries by position.
    items: [
      { label: "Head Office", value: "Kathmandu Metropolitan City, Ward No. 8, Guheswori, Kathmandu, Nepal, 00977" },
      { label: "P.O. Box", value: "7531" },
      { label: "Corporate Phone", value: "01-5107440" },
      { label: "Fax", value: "+977-1-4479655" },
      { label: "General Enquiries", value: "info@smanpower.com" },
    ],
  },
  footprintHeading: "Our Global Footprint.",
  form: {
    heading: "Send Us a Message",
    body: "Our corporate relations team typically responds within 24 hours.",
  },
};

export const workerGrievanceCopy = {
  badge: "Official Support Channel",
  headingLead: "Worker",
  headingHighlight: "Grievance",
  intro:
    "We take the safety and well-being of our deployed workers very seriously. If you are facing any issues abroad or during the recruitment process, please reach out to us immediately.",
  channels: [
    {
      title: "Emergency Hotline",
      desc: "Call us directly for immediate assistance regarding safety or critical contractual violations.",
      value: "01-5107440",
      href: "tel:+977015107440",
    },
    {
      title: "Email Support",
      desc: "Send us a detailed report of your grievance. We guarantee confidentiality and prompt action.",
      value: "info@smanpower.com",
      href: "mailto:info@smanpower.com",
    },
  ],
  commitmentHeading: "Our Commitment to Your Rights",
  commitmentIntro:
    "Seven Seas Intercontinental is committed to ethical recruitment and the strict protection of migrant workers' rights. We act as a mediator between you and your employer to resolve any disputes relating to:",
  categories: [
    { title: "Wage Disputes", desc: "Non-payment, delayed payment, or unauthorized deductions of agreed wages." },
    { title: "Contract Substitution", desc: "Changes to agreed job roles, salary terms, or working hours upon arrival." },
    { title: "Living Conditions", desc: "Inadequate housing, lack of basic amenities, or unsafe working environments." },
    { title: "Harassment & Abuse", desc: "Any form of physical or verbal abuse, or retention of personal documents (e.g., passports)." },
  ],
  escalation: {
    lead: "If your grievance requires escalation, we will coordinate directly with the respective embassies, the ",
    emphasis: "Department of Foreign Employment (DoFE)",
    trail: " in Nepal, and legal authorities to ensure your safety and rightful compensation.",
  },
};

export const requestWorkforceCopy = {
  hero: {
    title: "Partner With Us.",
    subtitle: "Workforce Solutions",
    imageSrc: "/images/corporate_office_interview_1782920412325.png",
  },
  intro: {
    eyebrow: "Employer Process",
    heading: "Build Your Global Team.",
    body: "Submit your preliminary workforce requirements. Our corporate relations team will analyze your project needs and prepare a customized deployment proposal.",
  },
  approachHeading: "The Seven Seas Approach",
  // Icons stay in code, matched to these entries by position.
  advantages: [
    { title: "RBA-Aligned Sourcing", desc: "Processes designed around ethical recruitment frameworks and employer-paid recruitment principles where applicable." },
    { title: "Pre-Screened Talent", desc: "Every candidate is medically, psychologically, and technically vetted before interview." },
    { title: "Rapid Deployment", desc: "Streamlined government processing to mobilize your workforce on schedule." },
  ],
};

// ── Collection wrappers ───────────────────────────────────────
// Surrounding copy only; collection queries, filters and card rendering are
// untouched.

export const demandsCopy = {
  badge: "Global Opportunities",
  headingLead: "Foreign Job Demands ",
  headingHighlight: "in Nepal.",
  intro:
    "Browse published foreign job demands shared by Seven Seas Intercontinental. Each demand includes position details, transparent fee structures, and worker-safety guidance for official applications.",
  filtersLoading: "Loading filters...",
  emptyState: {
    heading: "No Demands Found",
    body: "We couldn't find any demands matching your current filters. Please try adjusting your search criteria.",
  },
};

export const successStoriesCopy = {
  hero: {
    title: "Impact Beyond Placement.",
    subtitle: "Success Stories",
    imageSrc: "/images/hero_training_orientation_1782920391505.png",
  },
  intro: {
    eyebrow: "Real Results",
    heading: "The human proof of ethical recruitment.",
    body: "We measure our success not just by the numbers deployed, but by the lives uplifted and the businesses propelled forward. Read the accounts of those who have experienced the Seven Seas standard.",
  },
  emptyState: "More stories coming soon.",
  readMoreLabel: "Read Full Story &rarr;",
  cta: {
    headingLead: "Write your own ",
    headingHighlight: "success story.",
    body: "Whether you are an employer seeking reliable talent or a candidate looking for a life-changing opportunity, we are ready to partner with you.",
    buttonLabel: "Start Your Journey",
  },
};

export const demandDetailCopy = {
  privateBadge: "Draft / Private",
  backLabel: "Back to List",
  applyLabel: "Apply Job",
  positions: {
    heading: "Available Positions",
    subtitle: "Review the details and salary information for each vacancy.",
  },
  documents: {
    heading: "Official Documents",
    subtitle: "Verified demand letters and approval documents.",
  },
  breadcrumbHome: "Home",
  breadcrumbDemands: "Demands",
  noticeHeading: "Demand Notice",
  notices: {
    safetyHeading: "Candidate Safety Notice",
    feeHeading: "Fee Transparency",
  },
  applyPage: {
    backLabel: "Back to Demand",
    heading: "Candidate Application",
  },
};

export const careerDetailCopy = {
  locationLabel: "Location",
  applyNowLabel: "Apply Now",
  departmentLabel: "Department",
  employmentTypeLabel: "Employment Type",
  descriptionHeading: "Description",
  requirementsHeading: "Requirements",
  responsibilitiesHeading: "Responsibilities",
  applyByEmailLabel: "Apply by Email",
};

export const searchCopy = {
  hero: {
    eyebrow: "Global Search",
    headingLead: "Find ",
    headingHighlight: "Opportunities",
    headingTrail: " and Information",
  },
  viewAllJobsLabel: "View All Jobs",
  viewDetailsLabel: "View Details",
  prompt: {
    heading: "Enter a search term",
    body: "Search across our global job openings, success stories, and facilities.",
  },
  noResults: {
    // Rendered as: headingLead + the visitor's query + headingTrail
    headingLead: "No exact matches found for \"",
    headingTrail: "\"",
    body: "Try using different keywords or check out our latest jobs below.",
  },
  sectionHeadings: {
    jobs: "Active Jobs",
    stories: "Success Stories",
    facilities: "Facilities",
    industries: "Industries",
  },
};

// ── Global layout ─────────────────────────────────────────────
// Header is a client component, so this copy is resolved in the server layout
// and passed down as props rather than fetched in the component.

export const layoutCopy = {
  header: {
    wordmarkLead: "Seven Seas",
    wordmarkAccent: "Intercontinental",
    viewDemandsLabel: "View Demands",
    megaMenuDescription:
      "Explore our corporate initiatives, comprehensive services, and structural processes built for long-term international workforce deployment.",
  },
  footer: {
    headquartersLabel: "Global Headquarters",
    contactLabel: "Contact",
    socialsLabel: "Socials",
  },
};

/** CMS page slug -> the default copy that page renders today. */
export const PAGE_COPY_DEFAULTS = {
  "privacy-policy": privacyPolicyCopy,
  "terms-of-service": termsOfServiceCopy,
  "about/mission-vision-values": missionVisionValuesCopy,
  "about/our-story": ourStoryCopy,
  "about/community-impact": communityImpactCopy,
  "about/leadership": leadershipCopy,
  "about/our-people": ourPeopleCopy,
  insights: insightsCopy,
  news: newsCopy,
  careers: careersCopy,
  contact: contactCopy,
  "worker-grievance": workerGrievanceCopy,
  "employers/request-workforce": requestWorkforceCopy,
  demands: demandsCopy,
  "success-stories": successStoriesCopy,
  "demands/detail": demandDetailCopy,
  "careers/detail": careerDetailCopy,
  search: searchCopy,
  layout: layoutCopy,
} as const;

export type PageCopySlug = keyof typeof PAGE_COPY_DEFAULTS;

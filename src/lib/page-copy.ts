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

/** CMS page slug -> the default copy that page renders today. */
export const PAGE_COPY_DEFAULTS = {
  "privacy-policy": privacyPolicyCopy,
  "terms-of-service": termsOfServiceCopy,
  "about/mission-vision-values": missionVisionValuesCopy,
  "about/our-story": ourStoryCopy,
  "about/community-impact": communityImpactCopy,
  "about/leadership": leadershipCopy,
  "about/our-people": ourPeopleCopy,
} as const;

export type PageCopySlug = keyof typeof PAGE_COPY_DEFAULTS;

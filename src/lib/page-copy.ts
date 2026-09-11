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
 *
 * A page whose JSX has optional sections carries a `hiddenSections` map of
 * booleans, one per section, which the page guards its JSX with. The generic
 * content editor renders booleans as checkboxes, so these need no admin code.
 * ponytail: only sections a page can genuinely render without are listed —
 * heroes, forms, listing grids and statutory notices are deliberately absent.
 */

export type PageCopy = Record<string, unknown>;

/** Deep-merges stored CMS copy over the defaults, field by field. */
const COPY_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rarr: "→", larr: "←", mdash: "—", ndash: "–", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  laquo: "«", raquo: "»", times: "×", middot: "·", bull: "•",
};

/**
 * CMS copy is rendered as React text, so an editor who types "&rarr;" would see
 * it literally on the page. Decode the handful of entities editors actually
 * paste, once, where all stored copy is merged. Not a general HTML decoder —
 * these values are text, never markup.
 */
export function decodeCopyEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, token: string) => {
    if (token.startsWith("#")) {
      const codePoint = token[1]?.toLowerCase() === "x"
        ? parseInt(token.slice(2), 16)
        : parseInt(token.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return COPY_ENTITIES[token.toLowerCase()] ?? match;
  });
}

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
      if (typeof value === "string" && value.trim()) result[key] = decodeCopyEntities(value);
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
  hiddenSections: { quickNav: false, contactCta: false },
  headingLead: "Privacy",
  headingHighlight: "Policy",
  lastUpdatedLabel: "Last updated:",
  intro:
    "At Seven Seas Intercontinental, protecting the privacy and dignity of our clients, partners, and candidates is inseparable from our commitment to ethical recruitment. This Privacy Policy explains what personal information we collect, why we collect it, how we use and safeguard it, and the rights you hold over it. It applies to our website, our recruitment and deployment services, and every interaction you have with us.",
  sections: [
    {
      heading: "1. Who We Are",
      body: "Seven Seas Intercontinental is a licensed recruitment agency based in Nepal, operating under the ethical recruitment guidelines of the Government of Nepal and international employer-pays principles. For the purposes of applicable data-protection law, Seven Seas Intercontinental is the data controller responsible for the personal information described in this policy.",
    },
    {
      heading: "2. Information We Collect",
      body: "We collect information you provide directly and information generated through your use of our services. This may include your full name, date of birth, gender, nationality, and passport or government-identification details; contact details such as address, phone number, and email; employment history, skills, qualifications, and educational background; trade-test and training records; medical-fitness and visa-related documentation required for deployment; and any information you share when you apply for a position, request our services, or correspond with our team.",
    },
    {
      heading: "3. How We Collect Information",
      body: "We collect information when you submit a job application or CV, register for trade testing or orientation, contact us by phone, email, or web form, or interact with our website. We may also receive information lawfully from prospective employers, partner agencies, government bodies, and background- or reference-verification sources as part of the recruitment and deployment process.",
    },
    {
      heading: "4. How We Use Your Information",
      body: "We use your information to assess your suitability for roles, facilitate the recruitment, documentation, and deployment process, communicate with you and with prospective employers, arrange trade testing, training, medical checks, and visa processing, comply with legal and regulatory obligations, and improve our services. We never charge candidates recruitment fees, and we do not sell or rent your personal information to third parties.",
    },
    {
      heading: "5. Legal Basis for Processing",
      body: "We process your personal information where it is necessary to take steps at your request before entering into a contract, to perform our services, to comply with legal obligations under Nepali and destination-country law, to pursue our legitimate interests in operating an ethical recruitment business, or on the basis of your consent — which you may withdraw at any time.",
    },
    {
      heading: "6. Sharing and Disclosure",
      body: "We share your information only as needed to deliver our services: with prospective and confirmed employers considering your application, with government authorities, embassies, and regulators for licensing, permits, and visa processing, and with trusted service providers such as medical centres, training partners, and travel providers acting on our behalf. We require all such parties to protect your information and to use it only for the agreed purpose.",
    },
    {
      heading: "7. International Data Transfers",
      body: "Because we place candidates with employers abroad, your information may be transferred to and processed in countries outside Nepal. Where this happens, we take reasonable steps to ensure your information continues to be handled securely and in line with the purposes described in this policy.",
    },
    {
      heading: "8. Data Retention",
      body: "We keep your personal information only for as long as necessary to fulfil the purposes for which it was collected, including active recruitment, deployment, and any legal, regulatory, or contractual record-keeping obligations. When information is no longer required, we securely delete or anonymise it.",
    },
    {
      heading: "9. Data Security",
      body: "We employ organisational and technical safeguards — including access controls, secure storage, and staff confidentiality obligations — designed to protect your personal information from unauthorised access, alteration, disclosure, or loss. While no system can be guaranteed completely secure, we continuously review and improve our controls.",
    },
    {
      heading: "10. Cookies and Website Analytics",
      body: "Our website may use cookies and similar technologies to keep the site working, remember your preferences, and understand how visitors use our pages so we can improve them. You can control or disable cookies through your browser settings; some features may not function as intended if cookies are disabled.",
    },
    {
      heading: "11. Your Rights",
      body: "Subject to applicable law, you have the right to access the personal information we hold about you, request correction of inaccurate information, request deletion, object to or restrict certain processing, and withdraw consent where processing is based on consent. To exercise any of these rights, please contact us at info@smanpower.com and we will respond within a reasonable time.",
    },
    {
      heading: "12. Changes to This Policy",
      body: "We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal obligations. The revised version, together with its effective date, will be posted on this page, and continued use of our services after any update constitutes acceptance of the updated policy.",
    },
    {
      heading: "13. Contact Us",
      body: "If you have any questions, concerns, or requests regarding this Privacy Policy or how your personal information is handled, please contact our team at info@smanpower.com. We take every privacy concern seriously and are committed to resolving it promptly.",
    },
  ],
};

export const termsOfServiceCopy = {
  hiddenSections: { quickNav: false, contactCta: false },
  headingLead: "Terms of",
  headingHighlight: "Service",
  lastUpdatedLabel: "Last updated:",
  intro:
    "By accessing and using the Seven Seas Intercontinental website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully — they explain your rights and responsibilities, our commitments to ethical recruitment, and the limits of our role in the international employment process.",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "These Terms of Service govern your use of our website and services. By browsing our site, submitting an application, or engaging our recruitment services, you confirm that you accept these terms in full. If you do not agree with any part of them, please refrain from using our services.",
    },
    {
      heading: "2. Eligibility",
      body: "Our services are intended for candidates who are legally eligible to work abroad and for employers lawfully seeking to hire international workers. You confirm that you are of legal working age and that all information and documents you provide to us are true, accurate, and your own.",
    },
    {
      heading: "3. Use of Services",
      body: "Our platform connects candidates with foreign job opportunities and helps employers source qualified Nepali talent. While we strive to ensure the accuracy of all job postings, we cannot guarantee employment, visa approvals, salaries, or specific conditions set by foreign employers, as these depend on third parties and government authorities beyond our control.",
    },
    {
      heading: "4. Employer-Pays & Zero-Fee Principle",
      body: "In line with ethical recruitment standards and the guidelines of the Government of Nepal, we operate on an employer-pays basis. We do not charge candidates recruitment fees. If anyone requests payment from you in our name for securing a job, do not pay — report it to us immediately so we can act.",
    },
    {
      heading: "5. Candidate Responsibilities",
      body: "You agree to provide honest information, attend scheduled interviews, medicals, and orientations, and comply with the lawful requirements of the recruitment and deployment process. Providing false information, forged documents, or attempting to bypass official procedures may result in disqualification.",
    },
    {
      heading: "6. Zero-Tolerance Policy",
      body: "We operate strictly under the ethical recruitment guidelines of the Government of Nepal. Any fraudulent activity, forged documentation, illegal payment, or misrepresentation will result in immediate disqualification and reporting to the relevant authorities.",
    },
    {
      heading: "7. Intellectual Property",
      body: "All content on this website — including text, graphics, logos, images, and page layouts — is the property of Seven Seas Intercontinental or its licensors and is protected by applicable law. You may not reproduce, distribute, or use our content for commercial purposes without our prior written consent.",
    },
    {
      heading: "8. Third-Party Links & Employers",
      body: "Our website and services may reference third-party employers, partners, or external websites. We are not responsible for the content, policies, or practices of third parties, and any engagement you have with a foreign employer is subject to the contract agreed between you and that employer.",
    },
    {
      heading: "9. Limitation of Liability",
      body: "To the fullest extent permitted by law, Seven Seas Intercontinental shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or website content, or from the acts or omissions of foreign employers, government bodies, or other third parties.",
    },
    {
      heading: "10. Changes to These Terms",
      body: "We may revise these Terms of Service from time to time to reflect changes in our services, practices, or legal obligations. The updated version and its effective date will be posted on this page, and your continued use of our services after any change constitutes acceptance of the revised terms.",
    },
  ],
  // Rendered with the contact address as a mailto link.
  contactSection: {
    heading: "11. Contact Us",
    bodyLead:
      "If you have any questions regarding these terms, please contact our administrative team at ",
    email: "info@smanpower.com",
    bodyAfter: ".",
  },
};

// ── About ─────────────────────────────────────────────────────

export const missionVisionValuesCopy = {
  hiddenSections: { vision: false, mission: false, values: false },
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
  hiddenSections: { beginning: false, quote: false, timeline: false, philosophy: false },
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
      { year: "2013", title: "Middle East Coordination", desc: "Established coordination with employers and partners in Dubai and Doha to strengthen on-the-ground support and grievance handling for our deployed workers." },
      { year: "2018", title: "RBA Compliance", desc: "Expanded internal processes to comply with Responsible Business Alliance (RBA) Code of Conduct guidance and employer-paid recruitment practices." },
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
  hiddenSections: { intro: false, stats: false, pillars: false, returning: false },
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
    lead: "Workers who deploy through our RBA-compliant pipelines don't just return with financial capital; they return with human capital.",
    body: "Having worked in world-class facilities abroad, they bring back international standards of safety, quality, and technical expertise. Many of our returning candidates go on to become entrepreneurs, foremen, and leaders within Nepal's own developing industries. By enabling safe migration, we are accelerating the transfer of global skills back to the local economy.",
  },
};

export const leadershipCopy = {
  hiddenSections: { intro: false, chairmanQuote: false, board: false, accountability: false },
  hero: {
    title: "Guided by Experience.",
    subtitle: "Our Leadership",
    imageSrc: "/images/corporate_office_interview_1782920412325.png",
  },
  intro: {
    title: "Commitment from the Top Down.",
    subtitle: "Executive Team",
    lead: "Ethical recruitment is not just a policy; it requires active leadership, continuous oversight, and an unwavering commitment to doing the right thing.",
    body: "Our executive team brings decades of combined experience in international labor laws, cross-border deployment logistics, and human rights advocacy. They lead by example, ensuring that our zero-tolerance policy against exploitation is enforced at every level of the organization, from our sourcing partners in remote villages to our corporate office in Kathmandu.",
  },
  chairmanQuote: {
    quote:
      "\"We have built Seven Seas on a foundation of transparency. When an employer partners with us, they should be able to expect clear processes and accountable conduct.\"",
    attribution: "Chairman & Founder",
    organisation: "Seven Seas Intercontinental",
  },
  board: {
    eyebrow: "OUR LEADERSHIP",
    heading: "Experienced leadership.\nResponsible recruitment.",
    description:
      "Our leadership team brings decades of experience in international recruitment, workforce mobilisation and responsible employment practices.",
    // Shown when the team-members collection returns no leadership profiles.
    emptyState: "Leadership profiles are being updated.",
  },
  accountability: {
    eyebrow: "Our Core Belief",
    heading: "Accountability at the highest level.",
    lead: "We believe that ethical compliance cannot be outsourced or delegated. It must be woven into the fabric of the organization starting from the board room.",
    body: "Our directors are deeply involved in the daily operations of our sourcing networks, training centers, and deployment pipelines. By maintaining a hands-on approach, we ensure that our promises of transparency and zero-fees are not just marketing slogans, but operational realities.",
    badgeTitle: "RBA-Compliant",
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
    lead: "Behind every successful deployment is a team of over 150 dedicated professionals supporting candidates and deployed workers.",
    paragraphs: [
      "Ethical recruitment requires more than just good intentions—it requires incredible logistical precision and deep human empathy. Our staff comprises former expatriate workers, legal experts, certified trainers, and logistics specialists who understand the migration journey firsthand.",
      "We invest heavily in the continuous training of our own people, ensuring that every team member is fully versed in RBA guidelines, international labor laws, and modern human resources practices.",
    ],
  },
  hiddenSections: {
    intro: false,
    departments: false,
    band: false,
    culture: false,
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
  hiddenSections: { intro: false, cta: false },
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
  hiddenSections: { intro: false, cta: false },
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
  hiddenSections: { operations: false },
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
  hiddenSections: { channels: false, commitment: false, escalation: false },
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
  hiddenSections: { intro: false },
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
    { title: "RBA-Compliant Sourcing", desc: "Processes designed around ethical recruitment frameworks and employer-paid recruitment principles." },
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
  hiddenSections: { intro: false, cta: false },
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
  // Plain text only — this is rendered as a React string, so an HTML entity
  // here shows up literally as "&rarr;". The button supplies its own arrow icon.
  readMoreLabel: "Read Full Story",
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

export interface PageContent {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  missionHeading?: string;
  missionText?: string[];
  features?: {
    title: string;
    desc: string;
    /**
     * Optional link target. When set, DynamicPageTemplate renders the whole
     * feature card as a semantic <Link> instead of a static <div>.
     */
    href?: string;
  }[];
  documents?: {
    title: string;
    image: string;
    /** Direct link to the document file (e.g. Cloudinary PDF/JPG). Optional. */
    fileUrl?: string;
  }[];
  /** "Our Process" numbered steps. Rendered as its own section when present. */
  process?: {
    title: string;
    desc: string;
  }[];
  processEyebrow?: string;
  processHeading?: string;
  /** Frequently asked questions. Rendered as its own section when present. */
  faqs?: {
    q: string;
    a: string;
  }[];
  faqsEyebrow?: string;
  faqsHeading?: string;
  /**
   * Contextual internal links. Rendered as its own card section when present,
   * so a page can point at the sectors, facilities and records it actually
   * relates to instead of burying them in prose the template renders as text.
   */
  links?: {
    title: string;
    desc?: string;
    href: string;
  }[];
  linksEyebrow?: string;
  linksHeading?: string;
  /** Closing call-to-action band. Rendered when present. */
  cta?: {
    heading: string;
    body: string;
    buttonLabel?: string;
    buttonHref?: string;
    /** Overrides the band's default eyebrow. */
    eyebrow?: string;
    /** Optional second action, for pages serving two distinct audiences. */
    secondaryLabel?: string;
    secondaryHref?: string;
  };
  /**
   * Labels rendered by DynamicPageTemplate itself. Optional: when absent the
   * template falls back to the wording it has always shown.
   */
  overviewSubtitle?: string;
  featuresEyebrow?: string;
  featuresHeading?: string;
  documentsEyebrow?: string;
  documentsHeading?: string;
  documentsCtaLabel?: string;
}

/**
 * Section content shared by every child page in a category (process, FAQs,
 * closing CTA). Kept at category level because the recruitment journey and the
 * common questions are genuinely the same across a category — this fills every
 * page out to 5-6 sections without fabricating mismatched per-page filler, and
 * an individual page can still override any field with its own data.
 */
export const categoryDefaults: Record<string, Partial<PageContent>> = {
  employers: {
    processEyebrow: "How We Work",
    processHeading: "From Requirement to Deployment.",
    process: [
      { title: "Requirement Analysis", desc: "We study your roles, headcount, timelines, and destination-country standards to build a precise sourcing brief." },
      { title: "Sourcing & Screening", desc: "Candidates are identified across Nepal and put through background, medical, and behavioural screening before you ever see a shortlist." },
      { title: "Trade Testing & Interviews", desc: "You interview pre-vetted talent and validate practical skills — remotely or on-site — in our Kathmandu facilities." },
      { title: "Documentation & Deployment", desc: "We manage visas, DOFE clearances, orientation, and travel, then support both worker and employer after arrival." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "What Employers Ask.",
    faqs: [
      { q: "Do candidates pay any recruitment fees?", a: "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer." },
      { q: "How quickly can you mobilise a workforce?", a: "Timelines depend on role, volume, and government processing, but our streamlined documentation and DOFE relationships keep deployment on schedule." },
      { q: "Can we interview candidates before selection?", a: "Yes. You can conduct interviews and monitor trade tests remotely by live video or send your own assessors to our facilities." },
    ],
    cta: {
      heading: "Ready to build your global team?",
      body: "Share your workforce requirements and our corporate relations team will prepare a tailored deployment proposal.",
      buttonLabel: "Request Workforce",
      buttonHref: "/employers/request-workforce",
    },
  },
  "ethical-recruitment": {
    processEyebrow: "Our Safeguards",
    processHeading: "Ethics Built Into Every Step.",
    process: [
      { title: "Responsible Sourcing", desc: "We source only through vetted, audited partners — never unregulated brokers — so no candidate is charged a fee to be recruited." },
      { title: "Transparent Contracts", desc: "Every candidate receives their contract in their own language and fully understands wages, roles, and conditions before committing." },
      { title: "Continuous Monitoring", desc: "Our supply chain is audited regularly, and any partner found charging fees or misleading workers is immediately blacklisted." },
      { title: "Ongoing Welfare Support", desc: "Deployed workers reach our welfare team through multilingual, retaliation-free grievance channels at any time." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Ethical Recruitment, Explained.",
    faqs: [
      { q: "What does the employer-pays principle mean?", a: "All recruitment costs — flights, visas, medicals, and agency fees — are borne by the employer, never the worker." },
      { q: "How do you prevent forced labour?", a: "Workers keep their own passports and documents, contracts are transparent, and our sourcing network is assessed against the Responsible Business Alliance Code of Conduct." },
      { q: "What happens if a worker has a complaint abroad?", a: "Grievance reports can be submitted 24/7 and are acknowledged within 24 hours, then investigated by our welfare team. Reports can be made anonymously." },
    ],
    cta: {
      heading: "Recruitment done the right way.",
      body: "Partner with an agency that treats worker dignity and transparency as non-negotiable.",
      buttonLabel: "Talk to Our Team",
      buttonHref: "/contact",
    },
  },
  industries: {
    processEyebrow: "How We Deliver",
    processHeading: "Sector-Specific Sourcing.",
    process: [
      { title: "Sector Mapping", desc: "We translate your industry's role requirements and standards into a targeted sourcing plan for the Nepali talent pool." },
      { title: "Skill Verification", desc: "Candidates prove practical competency through trade testing in environments that mirror the actual work site." },
      { title: "Readiness Training", desc: "Pre-deployment orientation covers safety, culture, and industry-specific practices so workers are productive from day one." },
      { title: "Deployment & Support", desc: "We handle documentation and travel, then stay engaged through coordination with employers and partners in destination countries." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Sourcing For Your Sector.",
    faqs: [
      { q: "Are candidates skill-tested for this industry?", a: "Yes. Every candidate is trade-tested against sector standards before being shortlisted for deployment." },
      { q: "Can you supply workers at scale?", a: "Our nationwide sourcing network lets us run industry-specific recruitment drives to meet high-volume requirements." },
      { q: "Which destination countries do you serve?", a: "We deploy across the Gulf, Europe, and Asia, with destination-country coordination supporting workers after arrival." },
    ],
    cta: {
      heading: "Need skilled talent for your sector?",
      body: "Tell us your requirements and we will source, screen, and deploy candidates matched to your industry.",
      buttonLabel: "Request Workforce",
      buttonHref: "/employers/request-workforce",
    },
  },
  "training-facilities": {
    processEyebrow: "How We Prepare",
    processHeading: "Ready Before They Fly.",
    process: [
      { title: "Skills Assessment", desc: "We benchmark each candidate's current ability against the destination role to design the right preparation plan." },
      { title: "Hands-On Training", desc: "Candidates practise with the exact tools, equipment, and safety protocols they will use abroad." },
      { title: "Orientation & Language", desc: "Cultural orientation, legal awareness, and targeted language instruction prepare workers for life and work overseas." },
      { title: "Final Trade Test", desc: "A rigorous practical test — which employers can watch live — validates readiness before deployment." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "About Our Facilities.",
    faqs: [
      { q: "Can employers inspect the facilities?", a: "Yes. Transparency is a core value — employers are welcome to inspect our centres or take a virtual tour." },
      { q: "Can we observe trade tests?", a: "Employers can monitor testing sessions live via secure video links or send their own assessors." },
      { q: "What does orientation cover?", a: "Local laws and customs, workplace safety, financial literacy, and stress management for a smooth transition abroad." },
    ],
    cta: {
      heading: "See how we prepare our talent.",
      body: "Arrange a visit or virtual tour of our training and trade-testing facilities in Kathmandu.",
      buttonLabel: "Contact Us",
      buttonHref: "/contact",
    },
  },
  "trust-centre": {
    processEyebrow: "How We Stay Accountable",
    processHeading: "Compliance You Can Verify.",
    process: [
      { title: "Government Licensing", desc: "Operating under Government of Nepal Department of Foreign Employment Licence No. 888/067/068 since 2010." },
      { title: "International Standards", desc: "Our quality management system is ISO 9001:2015 certified, and our recruitment practices are RBA-compliant and Sedex-compliant, operating within an RBA-aligned framework adhering to the Employer-Pays Principle." },
      { title: "Open Documentation", desc: "Official government licences, authority certificates, and incorporation records are published in our Trust Centre, with quality certification records available for partner verification." },
      { title: "Regulatory Oversight", desc: "Recruitment operations are conducted in accordance with Nepal's Foreign Employment Act, 2007 and applicable bilateral labor frameworks." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Trust & Compliance.",
    faqs: [
      { q: "Is Seven Seas government licensed?", a: "Yes. Seven Seas Intercontinental Services operates under Department of Foreign Employment (DoFE) Licence No. 888/067/068, established in 2010." },
      { q: "What certifications and standards do you hold?", a: "We maintain an ISO 9001:2015 certified Quality Management System for recruitment operations, and our recruitment practices are RBA-compliant and Sedex-compliant, operating within an RBA-aligned framework." },
      { q: "Can we review your compliance documents?", a: "Our foreign employment licence, authority certificate for sending trainee workers to Japan, and company incorporation certificate are available in our Trust Centre. Seven Seas also holds an ISO 9001:2015 certificate, which is not publicly posted." },
    ],
    cta: {
      heading: "Partner with confidence.",
      body: "Work with a licensed recruitment agency operating under an ISO 9001:2015 certified quality management system.",
      buttonLabel: "Talk to Our Team",
      buttonHref: "/contact",
    },
  },
};

export const employersContent: PageContent[] = [
  {
    slug: "candidate-sourcing",
    title: "Global Candidate Sourcing Network.",
    subtitle: "Sourcing",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Identifying Top Talent Across Nepal.",
    missionText: [
      "Our sourcing network is deeply integrated across all seven provinces of Nepal. We don't just rely on walk-ins; we actively identify and engage with skilled candidates in their local communities.",
      "Through a vast network of verified, ethical sourcing partners, we ensure that every candidate we present has been responsibly recruited without being subjected to exploitative fees."
    ],
    features: [
      { title: "Nationwide Reach", desc: "Access to talent pools across all 7 provinces." },
      { title: "Ethical Sourcing", desc: "Zero recruitment fees for candidates." },
      { title: "Targeted Campaigns", desc: "Industry-specific recruitment drives." }
    ]
  },
  {
    slug: "screening",
    title: "Rigorous Candidate Screening.",
    subtitle: "Screening",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Quality Assured at Every Step.",
    missionText: [
      "Before a candidate is ever presented to an employer, they undergo a rigorous, multi-stage screening process. This ensures they possess both the technical skills and the psychological readiness for international deployment.",
      "Our screening includes background checks, medical pre-screening, and in-depth interviews by industry experts."
    ],
    features: [
      { title: "Behavioral Interviews", desc: "Assessing psychological readiness for overseas work." },
      { title: "Medical Pre-Screening", desc: "Ensuring candidates meet host-country health standards." },
      { title: "Background Checks", desc: "Verifying criminal records and past employment history." }
    ]
  },
  {
    slug: "trade-testing",
    title: "World-Class Trade Testing.",
    subtitle: "Testing",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Practical Validation of Skills.",
    missionText: [
      "We operate our own state-of-the-art trade testing facilities in Kathmandu. Candidates are required to demonstrate their practical skills using the exact tools and equipment they will use in the host country.",
      "Our testing protocols are developed in consultation with international industry experts."
    ],
    features: [
      { title: "Simulated Workplaces", desc: "Testing in environments identical to the deployment site." },
      { title: "Certified Assessors", desc: "Evaluations conducted by internationally certified trainers." },
      { title: "Custom Protocols", desc: "Tests tailored to your specific corporate requirements." }
    ]
  },
  {
    slug: "training",
    title: "Pre-Deployment Training.",
    subtitle: "Training",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Prepared for Day One.",
    missionText: [
      "Technical skills are only half the equation. Our mandatory pre-deployment orientation ensures candidates understand the cultural norms, labor laws, and safety regulations of their destination country.",
      "This drastically reduces culture shock and ensures immediate productivity upon arrival."
    ],
    features: [
      { title: "Cultural Orientation", desc: "Deep dives into host-country customs and laws." },
      { title: "Safety Briefings", desc: "Rigorous occupational health and safety training." },
      { title: "Language Prep", desc: "Basic language courses for seamless communication." }
    ]
  },
  {
    slug: "documentation",
    title: "Documentation & Processing.",
    subtitle: "Documentation",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Frictionless Legal Compliance.",
    missionText: [
      "International deployment involves navigating a labyrinth of bureaucratic requirements. Our dedicated processing team handles everything from passport acquisition to final embassy approvals.",
      "We maintain excellent relationships with the Department of Foreign Employment (DOFE) to expedite clearances."
    ],
    features: [
      { title: "Visa Processing", desc: "End-to-end management of embassy requirements." },
      { title: "DOFE Clearances", desc: "Fast-tracked government labor approvals." },
      { title: "Contract Transparency", desc: "Ensuring candidates fully understand their contracts in Nepali." }
    ]
  },
  {
    slug: "deployment",
    title: "Deployment & Post-Arrival Support.",
    subtitle: "Deployment",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Beyond the Flight.",
    missionText: [
      "Our responsibility does not end when the candidate boards the plane. We manage flight logistics, airport transfers, and maintain a 24/7 welfare hotline.",
      "Through coordination with employers and partners in destination countries, we are always on hand to resolve grievances and support both the worker and the employer."
    ],
    features: [
      { title: "Flight Logistics", desc: "Coordinating bulk travel arrangements." },
      { title: "24/7 Hotline", desc: "Always-on grievance mechanism for deployed workers." },
      { title: "Destination-Country Coordination", desc: "Ongoing coordination with employers and partners in destination countries." }
    ]
  },
  {
    slug: "workforce-intelligence",
    title: "Workforce Intelligence & Analytics.",
    subtitle: "Intelligence",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp"
  }
];

export const ethicalContent: PageContent[] = [
  {
    slug: "rba-aligned-practices",
    title: "RBA-Compliant Recruitment Practices.",
    subtitle: "RBA Compliance",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "What RBA Compliance Means — And How We Apply It.",
    overviewSubtitle: "The Standard Explained",
    missionText: [
      "The Responsible Business Alliance (RBA) Code of Conduct is one of the world's most widely adopted standards for labour rights in global supply chains. Its provisions are drawn from international instruments — the UN Guiding Principles on Business and Human Rights, core ILO Conventions, and the ILO General Principles and Operational Guidelines for Fair Recruitment — and increasingly define what international employers expect of the agencies that recruit for them.",
      "Seven Seas Intercontinental is a recruitment agency licensed by the Department of Foreign Employment (DoFE), Government of Nepal. Seven Seas Intercontinental is not presented as an RBA membership organization; its recruitment practices are designed to comply with the labour and ethical-recruitment requirements of the RBA Code of Conduct, so that a worker we place is recruited to the same standard a responsible international employer is required to uphold.",
      "In practice, that compliance rests on a few non-negotiable commitments: employment must be freely chosen; no worker may be charged a recruitment fee; every worker must receive a written contract in a language they understand; and workers must be treated humanely, without discrimination, with safe conditions and lawful working hours. These are the same principles an RBA or SMETA social audit would assess, and we hold ourselves to them whether or not a specific client requires an audit.",
      "Because most exploitation enters a supply chain through unregulated sub-agents and brokers, our compliance work concentrates there. We source only through vetted partners who accept these standards in writing, we verify the terms a worker is offered before departure, and we act on any breach rather than looking away. Ethical recruitment is a continuous due-diligence process, not a certificate on a wall.",
    ],
    featuresEyebrow: "The RBA Labour Provisions We Uphold",
    featuresHeading: "Six Commitments Behind Every Placement.",
    features: [
      { title: "Freely Chosen Employment", desc: "No forced, bonded, or involuntary labour. Workers keep their own passports and identity documents and are free to terminate employment with reasonable notice." },
      { title: "No Worker-Paid Fees", desc: "Recruitment fees and related costs are never charged to the worker. Where any such fee is discovered in our chain, it is repaid — consistent with the RBA and ILO position." },
      { title: "Humane Treatment & Non-Discrimination", desc: "Zero tolerance for harassment, abuse, or discrimination on the basis of origin, gender, religion, or any protected status, at every stage of recruitment." },
      { title: "Transparent Employment Contracts", desc: "Every candidate receives a written agreement in their native language stating wages, role, hours, benefits, and conditions before they commit." },
      { title: "Health, Safety & Working Hours", desc: "We place only with employers who guarantee lawful working hours, rest days, fair wages, and safe living and working conditions." },
      { title: "Due Diligence & Remedy", desc: "Ongoing monitoring of our sourcing network, with corrective action, blacklisting, and worker remediation when standards are breached." },
    ],
    processEyebrow: "How We Operationalise It",
    processHeading: "Our RBA-Compliant Due-Diligence Cycle.",
    process: [
      { title: "Policy Commitment", desc: "Our recruitment policy adopts the RBA labour provisions and the Employer-Pays Principle as binding internal rules for all staff and partners." },
      { title: "Partner Vetting & Onboarding", desc: "Every sub-agent and employer signs up to these standards in writing before any candidate is sourced through them. Unregulated brokers are excluded." },
      { title: "Pre-Departure Verification", desc: "Before a worker leaves, we verify that the contract, wages, and cost allocation match what was promised — and that no fee was charged to the worker." },
      { title: "Monitoring & Corrective Action", desc: "We stay engaged after deployment through our destination-country contacts, investigate concerns, and remediate or terminate partners who breach the code." },
    ],
    faqsEyebrow: "Honest Answers",
    faqsHeading: "RBA Compliance, Clarified.",
    faqs: [
      { q: "Are you an RBA membership organization?", a: "We are not presented as an RBA membership organization and do not claim RBA certification. As a licensed recruitment agency, our recruitment practices are RBA-compliant — designed to meet the labour provisions of the RBA Code of Conduct." },
      { q: "Which standards actually inform your framework?", a: "The RBA Code of Conduct, the ILO General Principles and Operational Guidelines for Fair Recruitment, the IOM IRIS principles of ethical recruitment, the Dhaka Principles for Migration with Dignity, and Nepal's Foreign Employment Act, 2007." },
      { q: "What is the single most important RBA principle for a migrant worker?", a: "That employment is freely chosen and free of worker-paid fees. Fees charged to workers are the most common route into debt bondage and forced labour, which is why we prohibit them outright." },
      { q: "What happens if one of your partners breaches the code?", a: "We investigate, ensure any worker-paid fee is repaid, require corrective action, and blacklist partners who will not comply. Compliance is enforced, not assumed." },
    ],
  },
  {
    slug: "worker-rights",
    title: "Protecting Worker Rights.",
    subtitle: "Worker Rights",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "The Rights Every Worker Carries — At Every Stage.",
    overviewSubtitle: "Rights, Defined",
    missionText: [
      "A migrant worker leaving Nepal for a job abroad is often taking the biggest financial and personal risk of their life, frequently in a language and legal system they do not know. That is precisely why a defined set of rights must travel with them — and why an ethical agency's job is to protect those rights at every stage, not just to fill a vacancy.",
      "Our approach follows the Dhaka Principles for Migration with Dignity and the ILO framework for fair recruitment. In plain terms, that means a worker has the right to accurate information before they decide, the right to keep their own passport and documents, freedom of movement and the freedom to change or leave a job, a written contract with no unexpected substitution of terms, safe and lawful living and working conditions, and access to remedy if something goes wrong.",
      "We treat contract transparency as the foundation. Every candidate receives their employment agreement in a language they read, and we walk them through wages, deductions, working hours, accommodation, and their rights in the destination country before any commitment is made. Contract substitution — being handed a worse contract on arrival — is one of the clearest signs of exploitation, and we work to prevent it.",
      "Rights only matter if they can be exercised. Our welfare contacts in destination countries, our multilingual grievance channels, and our relationships with employers give a deployed worker a real route to raise a problem and have it addressed. We see ourselves as the worker's advocate for the full length of their contract, not only until they board the plane.",
    ],
    featuresEyebrow: "The Rights We Safeguard",
    featuresHeading: "Six Protections That Follow The Worker.",
    features: [
      { title: "Control of Their Documents", desc: "Workers retain possession of their passport and identity documents. Withholding documents to restrict movement is prohibited." },
      { title: "Contract in Their Language", desc: "A written contract in the worker's native language, explained in full, with no substitution of terms on arrival." },
      { title: "The Right to Be Informed", desc: "Honest, accurate information about the job, wages, deductions, and living conditions before any decision is made — never misleading promises." },
      { title: "Freedom of Movement & to Resign", desc: "Employment is voluntary. Workers can move freely and end their employment with reasonable notice, without penalty or coercion." },
      { title: "Safe Living & Working Conditions", desc: "We place only with employers who guarantee lawful hours, rest days, fair wages, and safe accommodation and worksites." },
      { title: "Access to Remedy", desc: "Clear, retaliation-free channels to raise a grievance and have it investigated, wherever the worker is deployed." },
    ],
    processEyebrow: "Protection Across The Journey",
    processHeading: "How Rights Are Protected, Stage By Stage.",
    process: [
      { title: "Informed Consent at Sourcing", desc: "Before applying, candidates receive accurate details of the role, employer, wages, and costs — so the decision to migrate is genuinely their own." },
      { title: "Pre-Departure Briefing", desc: "We review the signed contract in the worker's language, confirm their rights in the destination country, and ensure they keep their documents." },
      { title: "Arrival & Handover", desc: "We coordinate with the employer so the contract, wages, and conditions on arrival match what was agreed — guarding against contract substitution." },
      { title: "Ongoing Welfare Monitoring", desc: "Through destination-country contacts and grievance channels, workers can reach us throughout their contract if anything changes." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Worker Rights, Explained.",
    faqs: [
      { q: "Who keeps the worker's passport?", a: "The worker does. No employer or agent in our chain is permitted to confiscate a passport or identity document to restrict a worker's movement." },
      { q: "What is contract substitution and how do you prevent it?", a: "It is replacing the agreed contract with a worse one after arrival. We give the worker their contract before departure and coordinate with the employer so the terms on arrival match what was signed." },
      { q: "Can a worker change or leave their job abroad?", a: "Employment is voluntary. Subject to the lawful terms of their contract and local law, a worker is free to resign with reasonable notice and cannot be held against their will." },
      { q: "What frameworks guide your approach to rights?", a: "The Dhaka Principles for Migration with Dignity, the ILO General Principles for Fair Recruitment, and the labour provisions of the RBA Code of Conduct." },
    ],
  },
  {
    slug: "recruitment-fees",
    title: "Zero Recruitment Fees Policy.",
    subtitle: "Fee Transparency",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "The Employer-Pays Principle, In Full.",
    overviewSubtitle: "Why Fees Matter",
    missionText: [
      "Recruitment fees charged to workers are, according to the RBA and the ILO alike, one of the most widespread factors that push people into forced labour. A worker who borrows heavily to pay for a job arrives in debt, unable to leave, and vulnerable to exploitation. Removing that fee is therefore not a courtesy — it is the single most protective thing an ethical agency can do.",
      "We apply the Employer-Pays Principle, defined by the Leadership Group for Responsible Recruitment and adopted across responsible supply chains: no worker should pay for a job, and the costs of recruitment should be borne by the employer, not the worker. This reverses the traditional 'worker-pays' model that has trapped migrant workers in debt for decades.",
      "The ILO's definition of recruitment fees and related costs is deliberately broad — it covers not just an agency's placement fee but medical checks, visa and permit costs, travel, and any other charge related to securing the job. Our policy follows that broad definition: these costs are allocated to the employer, and the worker is not asked to fund them directly or indirectly.",
      "Enforcement is where a fee policy is proven. We require every sub-agent and partner to accept the no-fee rule in writing, we confirm with the worker before departure that they were charged nothing, and if a fee is ever discovered in our chain we require it to be repaid to the worker — the remediation standard set by the RBA. A policy without verification and remediation is only a slogan.",
    ],
    featuresEyebrow: "How Zero-Fee Works",
    featuresHeading: "Fee Transparency In Practice.",
    features: [
      { title: "Zero Fees to Workers", desc: "Candidates pay nothing for placement, processing, or documentation to obtain a job through us." },
      { title: "Employer-Paid Costs", desc: "Agency fees, visas and permits, medical checks, and travel are allocated to the employer under the Employer-Pays Principle." },
      { title: "The Full ILO Definition", desc: "We treat 'recruitment fees and related costs' broadly, as the ILO does — no repackaging of worker charges under another name." },
      { title: "Sub-Agent Enforcement", desc: "Every partner accepts the no-fee rule in writing; those found charging workers are removed from our network." },
      { title: "Repayment & Remediation", desc: "If a worker-paid fee is ever found in our chain, it is repaid to the worker, consistent with RBA remediation standards." },
      { title: "Transparent Record-Keeping", desc: "Costs and cost allocation are documented, so it is clear who paid for what at every step." },
    ],
    processEyebrow: "How We Enforce It",
    processHeading: "From Agreement To Verification.",
    process: [
      { title: "Cost Allocation Agreement", desc: "Before recruitment begins, the employer agrees in writing to bear the recruitment costs, and the fee-free basis is fixed." },
      { title: "Fee-Free Candidate Onboarding", desc: "Candidates are sourced and processed at no charge, through vetted partners who have accepted the no-fee rule." },
      { title: "Pre-Departure Verification", desc: "We confirm directly with the worker that no fee was charged by us or any sub-agent before they travel." },
      { title: "Audit & Remediation", desc: "We monitor the chain for hidden charges and, where any are found, require repayment to the worker and corrective action." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Recruitment Fees, Explained.",
    faqs: [
      { q: "What is the Employer-Pays Principle?", a: "The principle that no worker should pay for a job and that the costs of recruitment should be borne by the employer, not the worker. It was defined by the Leadership Group for Responsible Recruitment and is adopted across responsible supply chains." },
      { q: "Which costs does the employer cover?", a: "Under the ILO's broad definition of recruitment fees and related costs: agency fees, visas and work permits, medical examinations, and travel — everything related to obtaining the job." },
      { q: "What if a sub-agent secretly charges a worker?", a: "That partner is removed from our network, and any fee paid is repaid to the worker — the remediation standard set by the RBA Code of Conduct." },
      { q: "Why is a zero-fee policy so important?", a: "Fees charged to workers are the most common route into debt bondage and forced labour. Removing them is the most effective single protection against exploitation." },
    ],
  },
  {
    slug: "grievance-process",
    title: "Transparent Grievance Process.",
    subtitle: "Grievances",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Access To Remedy That Actually Works.",
    overviewSubtitle: "The Right to be Heard",
    missionText: [
      "A right that cannot be enforced is not a right. Ethical recruitment therefore requires more than good intentions — it requires a working grievance mechanism through which a deployed worker can raise a problem and have it addressed, without fear of losing their job or being sent home.",
      "We model our grievance mechanism on the effectiveness criteria in the UN Guiding Principles on Business and Human Rights: it should be legitimate, accessible, predictable, equitable, transparent, and a source of continuous learning. In everyday terms, a worker should know how to reach us, be able to do so in their own language, understand what will happen next, and trust that raising an issue will not be used against them.",
      "Access matters most for workers who are thousands of kilometres away. Our channels are multilingual and available around the clock, complaints can be raised confidentially, and our welfare contacts in destination countries can engage directly with employers when a situation needs on-the-ground attention.",
      "Every grievance is logged, acknowledged, investigated, and followed through to resolution, with the worker kept informed. Where an employer or partner is at fault, we escalate — and, where necessary, involve the relevant authorities. Patterns in the grievances we receive feed back into how we vet partners and prepare workers, so the same problem is less likely to recur.",
    ],
    featuresEyebrow: "What Makes It Effective",
    featuresHeading: "A Mechanism Built On The UNGP Criteria.",
    features: [
      { title: "Multilingual Channels", desc: "Workers can raise concerns in a language they are comfortable with, not only in English or the employer's language." },
      { title: "Anonymity & Non-Retaliation", desc: "Complaints can be made confidentially, and retaliation against a worker for raising a grievance is not tolerated." },
      { title: "Around-The-Clock Access", desc: "Deployed workers can reach a grievance channel at any time, not only during Nepal office hours." },
      { title: "24-Hour Acknowledgement & Case Tracking", desc: "Every grievance is formally acknowledged within 24 hours to confirm intake, separating initial logging from subsequent bilateral investigation and resolution." },
      { title: "Destination Welfare Contacts", desc: "On-the-ground contacts in destination countries can engage employers directly when a case needs local attention." },
      { title: "Escalation & Remedy", desc: "Where an employer or partner is at fault, we escalate to them and, where necessary, to the relevant authorities." },
    ],
    processEyebrow: "How A Grievance Is Handled",
    processHeading: "From Report To Resolution.",
    process: [
      { title: "Raise", desc: "A worker contacts a grievance channel — by phone, message, or through a destination-country welfare contact — in their own language." },
      { title: "Acknowledge", desc: "The grievance is logged and acknowledged so the worker knows it has been received and what will happen next." },
      { title: "Investigate", desc: "We gather the facts, engage the employer or partner where relevant, and assess the case fairly against the contract and the worker's rights." },
      { title: "Resolve & Follow Up", desc: "We drive the issue to a resolution, confirm the outcome with the worker, and feed lessons back into partner vetting and worker preparation." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "The Grievance Process, Explained.",
    faqs: [
      { q: "Can a worker complain without their employer finding out?", a: "Yes. Grievances can be raised confidentially, and retaliation against a worker for raising one is not tolerated in our network." },
      { q: "What kinds of issues can be raised?", a: "Anything from unpaid or incorrect wages and contract terms to accommodation, safety, or treatment concerns — any gap between what was promised and what the worker is experiencing." },
      { q: "How quickly are grievances handled?", a: "Every grievance is formally acknowledged within 24 hours of submission to confirm receipt and assign a case officer. Bilateral investigation and dispute resolution proceed through destination welfare contacts and employers, with urgent safety concerns prioritized immediately." },
      { q: "What if the employer is at fault?", a: "We escalate directly to the employer, press for remedy for the worker, and involve the relevant authorities where the situation requires it." },
    ],
    cta: {
      heading: "Need to raise a concern?",
      body: "If you are a deployed worker or a family member, our welfare team is here to help. Reach out through our worker grievance channel.",
      buttonLabel: "Open a Grievance",
      buttonHref: "/worker-grievance",
    },
  },
  {
    slug: "policies",
    title: "Our Ethical Policies.",
    subtitle: "Policies",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "The Governance Behind The Promise.",
    overviewSubtitle: "The Framework",
    missionText: [
      "Commitments to ethical recruitment mean little without written policies that make them binding on staff and partners. Our policies are the governing framework of the organisation — they define how we source, screen, contract, and deploy workers, and what happens when a standard is breached.",
      "That framework sits on a clear legal foundation. Seven Seas Intercontinental operates under a licence from the Department of Foreign Employment and within Nepal's Foreign Employment Act, 2007, which governs how Nepali workers may be recruited for overseas employment. Our internal policies build on that legal baseline and align it with international standards for fair recruitment.",
      "The policy suite covers the areas where migrant workers are most at risk: a Code of Conduct binding staff and partners; an Ethical Recruitment Policy adopting the Employer-Pays Principle and the no-fee rule; an Anti-Bribery and Anti-Corruption policy; a Worker Welfare and Grievance policy; a Data Protection and Privacy policy governing the personal documents workers entrust to us; and Health and Safety expectations for the employers we place with.",
      "Policies are only real when they are applied. We train staff and partners on them, monitor compliance through our vetting and pre-departure checks, and review the policies as standards and laws evolve. Our licences and company registration documents are available in our Trust Centre for verification through official channels.",
    ],
    featuresEyebrow: "The Policy Suite",
    featuresHeading: "Six Policies That Govern Our Work.",
    features: [
      { title: "Code of Conduct", desc: "Binding rules of ethical behaviour for all staff, sub-agents, and partners, with defined consequences for breaches." },
      { title: "Ethical Recruitment Policy", desc: "Adopts the Employer-Pays Principle, the no-fee rule, and the labour provisions of the RBA and ILO fair-recruitment frameworks." },
      { title: "Anti-Bribery & Anti-Corruption", desc: "Zero tolerance for bribery, kickbacks, or corruption at any point in the recruitment chain." },
      { title: "Worker Welfare & Grievance", desc: "Defines the multilingual, retaliation-free grievance mechanism and the welfare support available to deployed workers." },
      { title: "Data Protection & Privacy", desc: "Governs how we handle the passports, certificates, and personal data workers entrust to us, and who may access them." },
      { title: "Health & Safety Expectations", desc: "The safe-conditions, lawful-hours, and fair-wage standards required of the employers we place workers with." },
    ],
    processEyebrow: "How Policy Becomes Practice",
    processHeading: "From Document To Daily Operation.",
    process: [
      { title: "Policy Development", desc: "Policies are drafted against Nepal's Foreign Employment Act, 2007 and international fair-recruitment standards, and approved by management." },
      { title: "Staff & Partner Training", desc: "Staff and partners are trained on the policies and must accept the Code of Conduct as a condition of working with us." },
      { title: "Implementation & Monitoring", desc: "Compliance is checked through partner vetting, pre-departure verification, and the grievance mechanism." },
      { title: "Review & Improvement", desc: "Policies are reviewed as laws and standards evolve and as lessons emerge from grievances and audits." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Our Policies, Explained.",
    faqs: [
      { q: "Under what legal authority do you operate?", a: "Under a licence from the Department of Foreign Employment (DoFE) and within Nepal's Foreign Employment Act, 2007. Our licence and registration documents are available in our Trust Centre." },
      { q: "Are these policies just for show?", a: "No. They are trained, monitored, and enforced through partner vetting, pre-departure checks, and the grievance mechanism, with real consequences for breaches." },
      { q: "How do you protect the personal documents workers give you?", a: "Our Data Protection and Privacy policy governs how passports, certificates, and personal data are stored, who may access them, and how long they are kept." },
      { q: "Where can I verify your licences?", a: "In our Trust Centre, where our Licence of Foreign Employment, Certificate of Incorporation, and other records can be viewed and verified through official channels." },
    ],
  },
];

export const industriesContent: PageContent[] = [
  { 
    slug: "security-services", 
    title: "Security Services Talent.", 
    subtitle: "Guarding & Protective Services", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    overviewSubtitle: "Disciplined Security Talent",
    missionHeading: "Disciplined Security Personnel from Nepal.",
    missionText: [
      "Nepal has a long-standing tradition of providing disciplined and dependable security personnel for commercial, industrial, and infrastructure protection across international markets. Seven Seas Intercontinental deploys thoroughly screened security guards, access control specialists, and asset protection personnel tailored to client-specified facility requirements.",
      "We recruit across two candidate categories: former service personnel from the Nepalese Army, Nepal Police, and Armed Police Force (APF), alongside screened civilian security personnel. Vetting procedures include mandatory Police Clearance Certificates issued by Nepal Police Headquarters, inspection of original service discharge documentation, and structured situational interviews.",
      "Physical readiness is benchmarked against vacancy-specific employer requisitions. Where mandated by clients, candidates are screened for physical criteria (such as minimum height of 5'7\" / 170 cm for male static guards, proportional BMI, normal color and corrected 20/20 vision, and physical stamina) alongside practical drill evaluations and basic emergency awareness.",
      "Our pre-departure orientation provides foundational familiarization aligned with Middle Eastern and international security environments, including operational concepts relevant to Dubai's Security Industry Regulatory Agency (SIRA) and Abu Dhabi's Private Security Business Department (PSBD) frameworks. Candidates receive preparatory instruction in English incident logging, basic CCTV observation concepts, access control protocols, and conflict de-escalation prior to official host-country examinations conducted in destination territories."
    ],
    featuresEyebrow: "Screening & Standards",
    featuresHeading: "Vetting, Preparation & Client-Specified Standards.",
    features: [
      { title: "Ex-Service Personnel & Civilian Guards", desc: "Sourcing former personnel from the Nepalese Army and Armed Police Force with verified original discharge documentation, alongside screened civilian guards." },
      { title: "Preparatory Curriculum Alignment", desc: "Pre-departure preparation covering foundational operational concepts relevant to GCC security environments prior to mandatory in-country licensing." },
      { title: "Client-Specified Fitness Screening", desc: "Physical screening conducted strictly against employer-mandated criteria, including height, BMI, vision, and general health clearances." },
      { title: "Static Guarding & Perimeter Protection", desc: "Preparation in access control, visitor badging, bag search procedures, patrol logging, and gatehouse management." },
      { title: "CCTV Observation & English Incident Reporting", desc: "Instruction in surveillance monitoring basics, two-way radio communication protocols, and clear written English incident reporting." },
      { title: "Emergency Response & First-Aid Basics", desc: "Instruction in building evacuation procedures, basic life support (BLS) fundamentals, and emergency fire response basics." }
    ],
    processEyebrow: "Security Mobilization",
    processHeading: "From Sourcing to International Deployment.",
    process: [
      { title: "Police Clearance & Discharge Inspection", desc: "Official criminal record vetting via Nepal Police Headquarters and physical verification of original discharge certificates for veterans." },
      { title: "Employer-Specified Physical Assessment", desc: "Verification against client-defined physical benchmarks (height, vision, BMI) and endurance testing under supervised conditions." },
      { title: "SOP Familiarization & Security English", desc: "Pre-departure instruction in access control etiquette, two-way radio procedures, customer de-escalation, and incident documentation." },
      { title: "DoFE Clearances & Mobilization", desc: "Department of Foreign Employment approval, bilateral contract authentication, and coordinated deployment to destination ports." }
    ],
    faqsEyebrow: "Security FAQ",
    faqsHeading: "Frequently Asked Questions for Security Employers.",
    faqs: [
      { q: "Do you supply both ex-military personnel and civilian security guards?", a: "Yes. We source both ex-military and police personnel (Nepalese Army, Nepal Police, Armed Police Force) for high-security, asset protection, and critical infrastructure roles, as well as screened and trained civilian guards where clients specify civilian candidates." },
      { q: "How are candidates verified for criminal and disciplinary records?", a: "Every candidate must present an official Police Clearance Certificate issued by Nepal Police Headquarters, which is mandatory for government labor approval. For ex-service personnel, our team inspects original discharge documentation (Pension Patra) and service conduct records to verify honorable service. We do not claim automated or institutional verification with military pension boards." },
      { q: "Can your security personnel pass SIRA (Dubai) or PSBD (Abu Dhabi) exams?", a: "Seven Seas does not issue SIRA or PSBD licenses, as official regulatory testing and licensing are legally administered exclusively by authorized government authorities within the UAE. In Kathmandu, we provide pre-departure preparatory instruction covering relevant terminology, English reporting formats, access control principles, and physical conditioning to prepare candidates for their official examinations upon arrival." },
      { q: "What physical standards do you require for security guards?", a: "Physical criteria are determined by specific employer requisitions and destination-country regulatory guidelines. When mandated by clients, standard benchmarks typically specify a minimum height of 5'7\" (170 cm) for male static guards, proportional BMI, adequate vision, and sound cardiovascular fitness verified during pre-employment medical examinations." }
    ],
    cta: {
      heading: "Deploy Disciplined Security Personnel.",
      body: "Protect your facilities, infrastructure, and corporate operations with verified, highly disciplined security talent from Nepal.",
      buttonLabel: "Request Security Personnel",
      buttonHref: "/employers/request-workforce"
    }
  },
  { 
    slug: "construction-and-technical-trades", 
    title: "Construction & Technical Trades.", 
    subtitle: "Construction", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Building the Future.",
    missionText: [
      "The global construction boom requires a workforce that is both highly skilled and resilient. We supply everything from general laborers to specialized civil engineers, masons, and heavy equipment operators.",
      "Every candidate undergoes practical trade testing in our Kathmandu facilities to verify their competency before deployment."
    ],
    features: [
      { title: "Practical Trade Testing", desc: "Skills verified in simulated construction environments." },
      { title: "Heavy Equipment", desc: "Certified operators for cranes, excavators, and bulldozers." },
      { title: "Specialized Trades", desc: "Expert welders, electricians, plumbers, and carpenters." }
    ]
  },
  { 
    slug: "hospitality-and-hotels", 
    title: "Hospitality & Hotels Staffing.", 
    subtitle: "Hospitality & Catering", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    overviewSubtitle: "Hospitality Talent Solutions",
    missionHeading: "Hospitality and Catering Staffing from Nepal.",
    missionText: [
      "Nepalese hospitality professionals are valued across the Gulf Cooperation Council (GCC), Europe, and international hospitality hubs for their dedication, professional discipline, and service orientation. Seven Seas Intercontinental deploys vetted, English-proficient talent across hotels, resorts, restaurants, and catering operations.",
      "Our selection process evaluates practical trade capabilities alongside service presentation and conversational English proficiency. From commis, line cooks, and pastry bakers to front-desk agents, guest service staff, baristas, and food servers, we align candidate skill levels with international 4-star and 5-star brand standards.",
      "Back-of-house operations receive equal attention. We source room attendants, laundry operators, public area cleaners, and kitchen stewards trained in commercial cleaning practices, chemical safety basics (COSHH), and room turnaround efficiency. We source candidates with verified food hygiene credentials and require comprehensive medical and food-handler health clearances before deployment. Seven Seas does not issue HACCP certificates directly; we verify candidate qualifications and facilitate practical evaluations.",
      "Through practical trade testing partnerships with hospitality institutes and commercial kitchen facilities in Kathmandu, employers can conduct live in-person or remote video trade tests, observing candidates prepare specific recipes, demonstrate table service routines, or execute front-office roleplay."
    ],
    featuresEyebrow: "Hospitality Capabilities",
    featuresHeading: "Specialized Hospitality Workforce Solutions.",
    features: [
      { title: "Culinary Talent & Food Safety Awareness", desc: "Sourcing commis, line cooks, and kitchen staff with verified training in HACCP food hygiene protocols and commercial kitchen safety standards." },
      { title: "Front Office & Guest Services", desc: "Customer-facing receptionists and concierges screened for English fluency, front-desk property management system (PMS) familiarity, and hospitality etiquette." },
      { title: "Food & Beverage (F&B) Service", desc: "Waitstaff, banquet captains, and trained baristas experienced in table setting, sequence of service, and high-volume banquet operations." },
      { title: "Housekeeping & Facilities Support", desc: "Room attendants and public area cleaners trained in luxury turndown standards, chemical handling safety, and room inspection protocols." },
      { title: "Practical Trade Testing Facilities", desc: "Skill verification conducted in Kathmandu through partner commercial kitchen and hospitality training facilities." },
      { title: "Cultural & Workplace Orientation", desc: "Pre-departure briefings covering Middle Eastern and European workplace expectations, customer diversity, and professional grooming standards." }
    ],
    processEyebrow: "Hospitality Deployment Flow",
    processHeading: "From Trade Testing to International Placement.",
    process: [
      { title: "Trade Testing & Skill Audits", desc: "Candidates execute practical recipe preparation, knife skills, table setting, or service roleplay in partner facilities in Kathmandu." },
      { title: "English Fluency & Grooming Screening", desc: "Structured conversational interviews assess spoken English proficiency, professional presentation, and customer service attitude." },
      { title: "Medical & Food Handler Clearances", desc: "Comprehensive health screenings, communicable disease panels, and food-handler medical certifications at approved medical centers." },
      { title: "Orientation & Coordinated Mobilization", desc: "Host-country hospitality norms briefing, visa stamping, DoFE labor approvals, and coordinated travel arrangements." }
    ],
    faqsEyebrow: "Hospitality FAQ",
    faqsHeading: "Frequently Asked Questions for Hoteliers.",
    faqs: [
      { q: "What hospitality roles does Seven Seas supply?", a: "We supply all tiers of hospitality staffing including Executive Chefs, Sous Chefs, Commis (I, II, III), Pastry Chefs, Waiters/Waitresses, Banquet Captains, Baristas, Bartenders, Front Desk Agents, Guest Service Officers, Bellhops, Housekeeping Attendants, Laundry Operators, and Kitchen Stewards." },
      { q: "How do you test culinary candidates before client selection?", a: "Seven Seas does not issue HACCP certificates directly. Instead, culinary candidates demonstrate practical competency in partner commercial kitchen facilities in Kathmandu. Candidates are evaluated on knife handling, recipe execution, hygiene practices, timing, and presentation under the observation of qualified culinary instructors or directly via client video stream." },
      { q: "What English language standards do your hospitality candidates meet?", a: "Customer-facing candidates (Front Office, F&B Service, Guest Relations) undergo structured English oral assessments aligned with CEFR B1–B2 standards, ensuring fluent comprehension and polite guest communication." },
      { q: "What is the typical deployment timeline for hotel openings or seasonal demand?", a: "For GCC destinations, mobilization typically ranges between 30 and 45 days under standard processing conditions. For European seasonal resorts, work permit processing lead times typically vary between 90 and 150 days. These timelines are indicative operational estimates; actual lead times depend on employer document attestation, host-government permit issuance, and consular processing." }
    ],
    cta: {
      heading: "Build Your High-Performance Hospitality Team.",
      body: "Whether you are staffing a luxury hotel opening, seasonal resort, or commercial restaurant group, Seven Seas delivers vetted, 5-star hospitality talent from Nepal.",
      buttonLabel: "Request Hospitality Workforce",
      buttonHref: "/employers/request-workforce"
    }
  },
  { 
    slug: "facility-management", 
    title: "Facility Management Professionals.", 
    subtitle: "Facilities", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Maintaining Excellence.",
    missionText: [
      "Modern mega-structures and corporate campuses require dedicated professionals to maintain operations. We supply complete facility management teams.",
      "Our personnel ensure that your facilities remain safe, clean, and fully operational 24/7."
    ],
    features: [
      { title: "MEP Technicians", desc: "Mechanical, Electrical, and Plumbing specialists." },
      { title: "Soft Services", desc: "Professional cleaning, landscaping, and waste management." },
      { title: "Supervisory Staff", desc: "Experienced foremen and facility managers." }
    ]
  },
  { 
    slug: "aviation-and-ground-handling", 
    title: "Aviation & Ground Handling.", 
    subtitle: "Aviation", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Keeping Operations Flying.",
    missionText: [
      "The aviation sector demands precision and absolute reliability. We supply trained personnel for airports and airlines across the Middle East and beyond.",
      "Our candidates are ready for the high-pressure environment of international aviation operations."
    ],
    features: [
      { title: "Ground Handling", desc: "Baggage handlers, ramp agents, and cargo loaders." },
      { title: "Customer Service", desc: "Ticketing agents and passenger assistance staff." },
      { title: "Aviation Security", desc: "Specialized security personnel for airport environments." }
    ]
  },
  { 
    slug: "manufacturing", 
    title: "Manufacturing & Assembly.", 
    subtitle: "Manufacturing", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Powering Production.",
    missionText: [
      "We supply the workforce engine that powers global manufacturing. From assembly line operators to quality control inspectors, our candidates are ready to scale your production.",
      "We focus on supplying personnel who are detail-oriented and capable of operating in high-efficiency industrial environments."
    ],
    features: [
      { title: "Assembly Operators", desc: "Dexterous personnel for electronics and automotive assembly." },
      { title: "Quality Control", desc: "Inspectors trained to identify defects and ensure standards." },
      { title: "Warehouse Logistics", desc: "Forklift operators, pickers, and inventory clerks." }
    ]
  },
  { 
    slug: "healthcare-support", 
    title: "Healthcare Support Staff.", 
    subtitle: "Healthcare", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Compassionate Care.",
    missionText: [
      "The global demand for healthcare support is unprecedented. We source compassionate, qualified, and verified support staff for hospitals and care facilities.",
      "Our rigorous medical and background screening ensures that only the most reliable candidates are deployed to sensitive healthcare environments."
    ],
    features: [
      { title: "Caregivers", desc: "Compassionate staff for elder care and special needs." },
      { title: "Nursing Assistants", desc: "Qualified support for registered nurses in hospital settings." },
      { title: "Hospitality Services", desc: "Cleaners and ward boys specifically trained for clinical areas." }
    ]
  },
  { 
    slug: "logistics-and-transport", 
    title: "Logistics & Transport.", 
    subtitle: "Logistics", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Moving the World.",
    missionText: [
      "Global supply chains rely on dependable drivers and logistics personnel. We supply internationally licensed drivers and supply chain workers.",
      "All transport candidates undergo rigorous driving tests and background verifications before deployment."
    ],
    features: [
      { title: "Heavy Vehicle Drivers", desc: "Licensed operators for trailers, tankers, and buses." },
      { title: "Delivery Personnel", desc: "Efficient riders and drivers for last-mile logistics." },
      { title: "Supply Chain", desc: "Warehouse managers, dispatchers, and cargo handlers." }
    ]
  }
];

export const trainingContent: PageContent[] = [
  { 
    slug: "training-centres", 
    title: "Our Training Centres.", 
    subtitle: "Facilities", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "State-of-the-Art Preparation.",
    missionText: [
      "We believe that a prepared candidate is a successful candidate. Our expansive training facilities in Kathmandu are designed to replicate international working environments.",
      "By familiarizing candidates with the exact tools, safety protocols, and cultural nuances they will encounter abroad, we drastically reduce acclimatization time."
    ],
    features: [
      { title: "Simulated Environments", desc: "Mock-ups of actual deployment sites." },
      { title: "Expert Instructors", desc: "Training led by industry veterans and former expats." },
      { title: "Comprehensive Curriculum", desc: "Covering both technical skills and soft skills." }
    ]
  },
  { 
    slug: "trade-test-centre", 
    title: "Trade Test Centre.", 
    subtitle: "Testing", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Validating Excellence.",
    missionText: [
      "Our Trade Test Centre is a rigorous evaluation hub. We do not rely solely on certificates or past experience; we require candidates to prove their practical competency.",
      "Employers are invited to monitor testing sessions live via secure video links or send their own assessors to utilize our facilities."
    ],
    features: [
      { title: "Live Streaming", desc: "Employers can watch trade tests remotely in real-time." },
      { title: "Standardized Testing", desc: "Evaluations benchmarked against international standards." },
      { title: "Custom Evaluations", desc: "Tests tailored to your specific project requirements." }
    ]
  },
  { 
    slug: "orientation", 
    title: "Candidate Orientation.", 
    subtitle: "Orientation", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Beyond the Technical.",
    missionText: [
      "Technical competency is only half of the equation for a successful deployment. Our mandatory orientation program prepares candidates for life abroad.",
      "We cover everything from local laws and customs to financial literacy and stress management, ensuring candidates are psychologically ready."
    ],
    features: [
      { title: "Cultural Immersion", desc: "Deep dives into host country etiquette and norms." },
      { title: "Legal Awareness", desc: "Educating workers on their rights and local labor laws." },
      { title: "Financial Literacy", desc: "Guidance on remittances and managing earnings." }
    ]
  },
  { 
    slug: "language", 
    title: "Language Preparation.", 
    subtitle: "Language", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Breaking Barriers.",
    missionText: [
      "Effective communication is critical for safety and efficiency on any job site. Our language labs provide targeted instruction in English and basic Arabic.",
      "We focus on industry-specific vocabulary to ensure candidates can understand instructions and communicate effectively from day one."
    ],
    features: [
      { title: "Industry Vocabulary", desc: "Focusing on words used daily on the job site." },
      { title: "Interactive Labs", desc: "Audio-visual learning for faster retention." },
      { title: "Conversational Practice", desc: "Simulated scenarios for practical usage." }
    ]
  },
  { 
    slug: "facility-gallery", 
    title: "Facility Gallery.", 
    subtitle: "Gallery", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "See For Yourself.",
    missionText: [
      "Transparency is one of our core values. We are proud of the investments we have made in our training infrastructure and welcome employer inspections.",
      "Take a virtual tour of our modern classrooms, fully equipped trade testing areas, and administrative hubs."
    ],
    features: [
      { title: "Modern Classrooms", desc: "Air-conditioned, audio-visual equipped learning spaces." },
      { title: "Practical Workshops", desc: "Fully stocked with heavy equipment and tools." },
      { title: "Central Location", desc: "Easily accessible facilities in the heart of Kathmandu." }
    ]
  }
];

export const trustContent: PageContent[] = [
  {
    slug: "company-facts",
    title: "Official Company Facts & Verified Data.",
    subtitle: "Company Facts",
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Verified Facts. Documented Transparency.",
    overviewSubtitle: "Authoritative Data",
    missionText: [
      "Seven Seas Intercontinental Services Pvt. Ltd. was established in 2010 in Kathmandu, Nepal, operating under Government of Nepal, Department of Foreign Employment (DoFE) Licence No. 888/067/068.",
      "Since our establishment in 2010, Seven Seas has successfully deployed over 150,000 qualified workers to reputable employers across the Middle East, Asia, and Europe, maintaining active recruitment partnerships with more than 350 international employers.",
      "Our operations strictly follow the Employer-Pays Principle: all candidate recruitment, documentation, and processing costs are covered by employers, and candidates are never charged recruitment or placement fees.",
      "We maintain an ISO 9001:2015 certified Quality Management System and design our recruitment workflows to align with the labour provisions of the Responsible Business Alliance (RBA) Code of Conduct.",
      "This page serves as the authoritative single source of truth for our verified corporate details, official contact channels, and operational metrics."
    ],
    featuresEyebrow: "Key Metrics & Corporate Identity",
    featuresHeading: "Verified Company Data.",
    features: [
      { title: "Established 2010", desc: "Operating continuously from Kathmandu, Nepal under DoFE Licence 888/067/068." },
      { title: "150,000+ Workers Deployed", desc: "Evidenced record of international candidate mobilisations across GCC, Europe, and Asia since 2010." },
      { title: "350+ Employer Partners", desc: "Trusted recruitment partner for multinational corporations and leading regional enterprises." },
      { title: "Zero Recruitment Fees", desc: "Candidates pay nothing for recruitment, placement, documentation, or processing." },
      { title: "ISO 9001:2015 Certified", desc: "Quality Management Systems audited and verified for recruitment operations." },
      { title: "Official Corporate Office", desc: "DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal. Phone: +977 1 5107440." }
    ],
    documentsEyebrow: "Supporting Records",
    documentsHeading: "Official Licences & Documents.",
    documents: [
      { title: "License of Foreign Employment (DoFE 888/067/068)", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998968/SSIS_License_of_Foreign_Employment_xwnjyf.pdf", image: "" },
      { title: "Certificate of Incorporation", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998959/WhatsApp_Image_2026-07-24_at_1.40.38_PM_wb8zdf.jpg", image: "" },
      { title: "Authority Certificate — Sending Trainee Workers to Japan", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998960/WhatsApp_Image_2026-07-24_at_1.41.30_PM_knnzf2.jpg", image: "" }
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Frequently Asked Questions About Seven Seas.",
    faqs: [
      { q: "When was Seven Seas Intercontinental established?", a: "Seven Seas Intercontinental Services Pvt. Ltd. was established in 2010 in Kathmandu, Nepal, and has operated continuously under DoFE Licence No. 888/067/068." },
      { q: "How many workers has Seven Seas deployed?", a: "Since establishment in 2010, Seven Seas has deployed over 150,000 qualified workers to verified employers worldwide." },
      { q: "What is your recruitment fee policy for job seekers?", a: "Seven Seas follows the Employer-Pays Principle. Candidates are never charged recruitment or placement fees, and all candidate costs are covered, including documentation and processing." },
      { q: "What is the official office address and contact number?", a: "Our corporate office is located at DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal. Primary phone: +977 1 5107440." }
    ],
    cta: {
      heading: "Verify our official documentation.",
      body: "Review our government licences, compliance documents, and verified partner network.",
      buttonLabel: "View Official Licences",
      buttonHref: "/trust-centre/licences",
    }
  },
  { 
    slug: "licences", 
    title: "Our Recruitment Licences.", 
    subtitle: "Licences", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "Government Approved.",
    missionText: [
      "Seven Seas Intercontinental operates with authorization from the Government of Nepal, Department of Foreign Employment (DoFE) under Licence No. 888/067/068.",
      "Our operations adhere to Nepal's Foreign Employment Act, 2007 and applicable bilateral labor frameworks, establishing transparent legal procedures for overseas deployment."
    ],
    features: [
      { title: "DoFE Licensed", desc: "Operating under Government of Nepal Department of Foreign Employment Licence No. 888/067/068." },
      { title: "Statutory Adherence", desc: "Operations conducted in structured accordance with government-mandated foreign employment procedures." },
      { title: "Licence Verification", desc: "Official government licences and incorporation certificates available for employer review." }
    ],
    documents: [
      { title: "License of Foreign Employment", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998968/SSIS_License_of_Foreign_Employment_xwnjyf.pdf", image: "" },
      { title: "Authority Certificate — Sending Trainee Workers to Japan", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998960/WhatsApp_Image_2026-07-24_at_1.41.30_PM_knnzf2.jpg", image: "" },
      { title: "Certificate of Incorporation of Company", fileUrl: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784998959/WhatsApp_Image_2026-07-24_at_1.40.38_PM_wb8zdf.jpg", image: "" }
    ]
  },
  { 
    slug: "certifications", 
    title: "Global Certifications.", 
    subtitle: "Certifications", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "Internationally Recognized.",
    missionText: [
      "Our recruitment workflows operate under an ISO 9001:2015 certified Quality Management System, and our recruitment practices are RBA-compliant and Sedex-compliant.",
      "This certification validates that our organizational procedures for candidate intake, document handling, and client coordination conform to documented quality management standards."
    ],
    features: [
      { title: "ISO 9001:2015 Certified", desc: "Quality Management System certification covering recruitment and placement processes, subject to documented certificate scope." },
      { title: "RBA-Aligned Framework", desc: "Recruitment operations structured around the labour provisions of the Responsible Business Alliance Code of Conduct." },
      { title: "Standardized Procedures", desc: "Workflows governed by documented operational quality management procedures under our ISO 9001:2015 framework." }
    ]
  },
  { 
    slug: "compliance-documents", 
    title: "Compliance Documents.", 
    subtitle: "Compliance", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Total Transparency.",
    missionText: [
      "We believe that trust is built on transparency. Key operational licences, registration records, and association memberships are available for employer review.",
      "By maintaining accessible documentation, we assure our partners that they are working with a legally registered and authorized recruitment enterprise."
    ],
    features: [
      { title: "DoFE Registration", desc: "Operating under Department of Foreign Employment Licence No. 888/067/068." },
      { title: "Company Incorporation", desc: "Registered with the Office of the Company Registrar, Government of Nepal." },
      { title: "NAFEA Membership", desc: "Active members of the Nepal Association of Foreign Employment Agencies." }
    ]
  },
  { 
    slug: "policies", 
    title: "Ethical Recruitment Policies.", 
    subtitle: "Policies", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/1e36b5a4-baac-42b6-86e3-94cd2136cfe3_jve70w.webp",
    missionHeading: "The Rules We Live By.",
    missionText: [
      "Our internal policies are strict, uncompromising, and designed to protect the most vulnerable. They dictate our zero-tolerance stance on forced labor and recruitment fees.",
      "Every staff member and sub-agent is required to sign and adhere to our Ethical Recruitment Code of Conduct."
    ],
    features: [
      { title: "Zero Recruitment Fees", desc: "Strict enforcement of the Employer-Pays principle." },
      { title: "Anti-Bribery", desc: "Comprehensive anti-corruption policies across our network." },
      { title: "Data Protection", desc: "Stringent privacy policies securing candidate personal information." }
    ]
  },
  { 
    slug: "verified-partners", 
    title: "Verified Partnerships.", 
    subtitle: "Partnerships", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/7c2ea761-c5b5-417b-b502-4204e0f476c6_xqz9gq.webp",
    missionHeading: "A Trusted Network.",
    missionText: [
      "A recruitment agency is only as ethical as its sourcing network. We do not use unregulated brokers. Instead, we rely on a heavily vetted network of verified sourcing partners.",
      "These partners are audited regularly to ensure they do not charge candidates fees or provide misleading information about job roles."
    ],
    features: [
      { title: "Direct Sourcing", desc: "Minimizing middle-men to reduce the risk of exploitation." },
      { title: "Partner Audits", desc: "Regular investigations into the practices of our sourcing network." },
      { title: "Blacklisting Policy", desc: "Immediate severance with any entity found violating our ethical codes." }
    ]
  },
  { 
    slug: "grievance", 
    title: "Grievance & Complaint Support.", 
    subtitle: "Support", 
    heroImage: "https://res.cloudinary.com/o99xd4mq/image/upload/v1784873183/d84731bc-1469-4e0b-926e-f20c5b4455fb_g40mbj.webp",
    missionHeading: "Always Listening.",
    missionText: [
      "Even with the best preparation, issues can arise during deployment. Our Grievance Mechanism provides a safe, accessible way for workers to report concerns.",
      "Our dedicated welfare officers investigate every claim, working with both the worker and the employer to find an equitable resolution."
    ],
    features: [
      { title: "Anonymous Reporting", desc: "Secure channels for workers to report issues without fear." },
      { title: "Welfare Officers", desc: "Dedicated staff in major deployment hubs to mediate disputes." },
      { title: "24-Hour Acknowledgement", desc: "Grievance reports can be submitted 24/7 and are acknowledged within 24 hours to confirm intake, followed by structured inquiry and destination-country dispute resolution." }
    ],
    processEyebrow: "Grievance Intake & Handling",
    processHeading: "How Worker Grievances Are Processed.",
    process: [
      { title: "Submission & Intake", desc: "Deployed workers or family members submit concerns through the worker grievance portal at /worker-grievance, telephone, or messaging channels." },
      { title: "24-Hour Acknowledgement", desc: "Every submitted report is logged and acknowledged within 24 hours to confirm intake and assign an operational case reference." },
      { title: "Documentation Review", desc: "The welfare desk reviews contractual records, deployment details, and candidate-provided documentation to identify the specific issue." },
      { title: "Employer Communication", desc: "Our team coordinates directly with the employer or destination partner to address the matter in accordance with the employment agreement." }
    ],
    faqsEyebrow: "Grievance FAQ",
    faqsHeading: "Frequently Asked Questions About Grievance Support.",
    faqs: [
      { q: "How can a deployed worker submit a grievance?", a: "Workers can submit grievances online 24/7 via the worker grievance portal at /worker-grievance, or by contacting our Kathmandu office through direct telephone and messaging channels." },
      { q: "How quickly is a submitted grievance acknowledged?", a: "Grievance reports can be submitted 24/7 and are acknowledged within 24 hours to confirm intake and register the case with our welfare support desk." },
      { q: "What details should be included with a grievance report?", a: "To assist inquiry, workers should provide their full name, passport number, employer name, destination country, contact details, and a factual description of the issue." },
      { q: "Where does the grievance process direct for formal submission?", a: "Formal online reports should be submitted directly through /worker-grievance, where details are routed to our Kathmandu welfare desk for case review." }
    ],
    cta: {
      heading: "Need to submit a grievance or report an issue?",
      body: "Our welfare support desk operates 24/7. Reports can be submitted confidentially and are acknowledged within 24 hours, followed by structured inquiry and resolution tracking.",
      buttonLabel: "Submit Grievance",
      buttonHref: "/worker-grievance",
    }
  }
];


// ============================================================
// DESTINATIONS (recruitment by destination) + STANDALONE SEO PAGES
// ============================================================
// Saudi Arabia, the United Arab Emirates and Qatar are featured destinations
// on the website. Seven Seas also actively recruits for additional destinations.
// Everything written here is drawn from capabilities the
// website already documents (sectors, screening, trade testing, training,
// documentation, ethical recruitment) — no country-specific visa procedure,
// salary figure, deployment volume, employer name, office abroad, or
// placement guarantee is claimed anywhere below.

/** Indicative, explicitly non-guaranteed mobilisation wording. One source. */
export const INDICATIVE_TIMEFRAME =
  "Our current indicative mobilisation timeframe for Gulf destinations is 30 to 45 days. This is an estimate rather than a guarantee: actual lead times depend on the requirement, document attestation, government approvals, medical clearances and other relevant factors.";

/**
 * Timeframe wording for destinations outside the Gulf. The 30-45 day figure in
 * INDICATIVE_TIMEFRAME is explicitly scoped to Gulf destinations, so quoting it
 * for Malaysia, Japan or Europe would be an unsupported claim. No substitute
 * number is invented here: the lead time is confirmed per requirement instead.
 */
export const NON_GULF_TIMEFRAME =
  "Mobilisation lead times outside the Gulf vary by destination and by requirement, and we do not publish a single figure for them. Actual timing depends on the requirement, document attestation, government approvals, medical clearances and other relevant factors. We confirm an indicative timeframe for your specific requirement once we have reviewed it.";

/** Sector links shared by the destination pages — the sectors already listed on the website. */
const SECTOR_LINKS = [
  { title: "Security Services", desc: "Guards and security personnel screened for overseas security roles.", href: "/industries/security-services" },
  { title: "Construction & Technical Trades", desc: "Masons, steel fixers, welders, electricians, plumbers and allied trades.", href: "/industries/construction-and-technical-trades" },
  { title: "Hospitality & Hotels", desc: "Kitchen, food and beverage, housekeeping and front-of-house staff.", href: "/industries/hospitality-and-hotels" },
  { title: "Facility Management", desc: "Cleaning, maintenance and soft-services teams for managed facilities.", href: "/industries/facility-management" },
  { title: "Aviation & Ground Handling", desc: "Ground handling, ramp, cargo and airport support roles.", href: "/industries/aviation-and-ground-handling" },
  { title: "Manufacturing", desc: "Production operators, machine handlers and factory support workers.", href: "/industries/manufacturing" },
  { title: "Healthcare Support", desc: "Support and auxiliary roles within healthcare environments.", href: "/industries/healthcare-support" },
  { title: "Logistics & Transport", desc: "Drivers, warehouse and distribution personnel.", href: "/industries/logistics-and-transport" },
];

/**
 * Sections shared by every destination page. The Nepal-side recruitment path,
 * the employer FAQs and the closing CTA are genuinely identical across these
 * destinations, so they are written once here rather than re-spun three times
 * to make the pages look more different than they are.
 */
const destinationDefaults: Partial<PageContent> = {
  processEyebrow: "How We Mobilise",
  processHeading: "The Nepal-Side Recruitment Path.",
  process: [
    {
      title: "Demand Documents & Attestation",
      desc: "Your demand letter, power of attorney and employment agreement are verified through the Chamber of Commerce and the Nepal Embassy, and the requirement is registered with Nepal's Department of Foreign Employment before any candidate is approached.",
    },
    {
      title: "Sourcing & Screening",
      desc: "Candidates are identified through our sourcing network across all seven provinces of Nepal and put through background, medical and behavioural screening before any shortlist reaches you.",
    },
    {
      title: "Trade Testing & Employer Selection",
      desc: "Shortlisted candidates are trade-tested in our Kathmandu facilities. You can interview them and observe the trade tests by live video, or send your own assessors to Kathmandu.",
    },
    {
      title: "Documentation, Orientation & Departure",
      desc: "We coordinate medical examinations, visa documentation, Department of Foreign Employment labour approval and the mandatory pre-departure orientation, then schedule travel and stay in contact after arrival.",
    },
  ],
  faqsEyebrow: "Employer Questions",
  faqsHeading: "What Employers Ask Us.",
  linksEyebrow: "Sectors and Preparation",
  linksHeading: "Roles We Source and How They Are Prepared.",
  links: [
    ...SECTOR_LINKS,
    { title: "Trade Test Centre", desc: "Practical skill assessment in our Kathmandu facilities, observable remotely.", href: "/training-facilities/trade-test-centre" },
    { title: "Pre-Departure Orientation", desc: "Mandatory orientation covering the role, the contract and life abroad.", href: "/training-facilities/orientation" },
    { title: "Recruitment Fee Transparency", desc: "How the employer-pays principle is applied in practice.", href: "/ethical-recruitment/recruitment-fees" },
    { title: "Licences & Registration", desc: "Our foreign employment licence and registration records.", href: "/trust-centre/licences" },
  ],
  cta: {
    eyebrow: "Workforce Deployment Proposal",
    heading: "Ready to build your team from Nepal?",
    body: "Share your role requirements, headcount and target start date. Our corporate relations team will respond within 24 hours with a tailored recruitment proposal.",
    buttonLabel: "Request Workforce",
    buttonHref: "/employers/request-workforce",
  },
};

// Registered here rather than inline in `categoryDefaults` because the shared
// sections are defined further down the file with the destination content.
categoryDefaults.destinations = destinationDefaults;

/**
 * Employer FAQs shared across the destination pages, with the country named.
 *
 * `timeframe` defaults to the Gulf figure. Non-Gulf destinations must pass
 * NON_GULF_TIMEFRAME — the published 30-45 day estimate is scoped to the Gulf
 * and does not transfer to Malaysia, Japan or Europe.
 */
function destinationFaqs(
  country: string,
  timeframe: string = INDICATIVE_TIMEFRAME
): { q: string; a: string }[] {
  return [
    {
      q: "Do candidates pay any recruitment fees?",
      a: `Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer. This applies to every requirement we accept for ${country}.`,
    },
    {
      q: "How long does mobilisation usually take?",
      a: timeframe,
    },
    {
      q: "Can we interview and trade-test candidates before selecting them?",
      a: `Yes. You can interview shortlisted candidates and observe practical trade tests by live video from ${country}, or send your own assessors to our Kathmandu facilities.`,
    },
    {
      q: `Does Seven Seas have an office in ${country}?`,
      a: `No. Seven Seas Intercontinental operates from a single office in Kathmandu, Nepal. Work in ${country} is handled through coordination with employers and partners in destination countries, not through a branch of our own.`,
    },
    {
      q: "What recruitment standards do you work to?",
      a: "We maintain an ISO 9001:2015 certified Quality Management System for recruitment operations, and our recruitment practices are RBA-compliant and Sedex-compliant, operating within an RBA-aligned framework adhering to the Employer-Pays Principle.",
    },
    {
      q: "Which sectors can you recruit for?",
      a: "The sectors listed on this page are the ones we recruit for: security services, construction and technical trades, hospitality and hotels, facility management, aviation and ground handling, manufacturing, healthcare support, and logistics and transport. This describes what we can source, screen and trade-test for; it does not indicate that a vacancy is currently open in any particular sector or destination. Published openings appear on our Demands page.",
    },
  ];
}

const DESTINATION_HERO_IMAGE = "/images/hero_training_orientation_1782920391505.png";

/** Country pages. Paragraph structure is shared on purpose; only supportable country context differs. */
export const destinationsContent: PageContent[] = [
  {
    slug: "saudi-arabia",
    title: "Recruitment of Nepali Workers for Saudi Arabia.",
    subtitle: "Saudi Arabia",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Saudi Employers.",
    missionText: [
      "Saudi Arabia is an active recruitment destination for Seven Seas Intercontinental. Employers in Saudi Arabia appoint us to source, screen, trade-test and mobilise Nepali workers, with every step of the Nepal-side process handled by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Saudi Arabia: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every Saudi Arabian requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Saudi Arabian Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Saudi Arabia." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Saudi Arabian deployment." },
    ],
    faqs: destinationFaqs("Saudi Arabia"),
  },
  {
    slug: "united-arab-emirates",
    title: "Recruitment of Nepali Workers for the United Arab Emirates.",
    subtitle: "United Arab Emirates",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for UAE Employers.",
    missionText: [
      "The United Arab Emirates is an active recruitment destination for Seven Seas Intercontinental. Employers across the UAE appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in the United Arab Emirates: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every UAE requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a UAE Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from the UAE." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every UAE deployment." },
    ],
    faqs: destinationFaqs("the United Arab Emirates"),
  },
  {
    slug: "qatar",
    title: "Recruitment of Nepali Workers for Qatar.",
    subtitle: "Qatar",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Qatari Employers.",
    missionText: [
      "Qatar is an active recruitment destination for Seven Seas Intercontinental. Employers in Qatar appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Qatar: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every Qatari requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Qatari Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Qatar." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Qatari deployment." },
    ],
    faqs: destinationFaqs("Qatar"),
  },
  {
    slug: "oman",
    title: "Recruitment of Nepali Workers for Oman.",
    subtitle: "Oman",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Omani Employers.",
    missionText: [
      "Oman is a recruitment destination Seven Seas Intercontinental accepts requirements for. Employers in Oman appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Oman: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every Omani requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How an Omani Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Oman." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Omani deployment." },
    ],
    faqs: destinationFaqs("Oman"),
  },
  {
    slug: "bahrain",
    title: "Recruitment of Nepali Workers for Bahrain.",
    subtitle: "Bahrain",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Bahraini Employers.",
    missionText: [
      "Bahrain is a recruitment destination Seven Seas Intercontinental accepts requirements for. Employers in Bahrain appoint us to source, screen, trade-test and mobilise Nepali workers, with every step of the Nepal-side process handled by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Bahrain: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every Bahraini requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Bahraini Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Bahrain." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Bahraini deployment." },
    ],
    faqs: destinationFaqs("Bahrain"),
  },
  {
    slug: "kuwait",
    title: "Recruitment of Nepali Workers for Kuwait.",
    subtitle: "Kuwait",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Kuwaiti Employers.",
    missionText: [
      "Kuwait is a recruitment destination Seven Seas Intercontinental accepts requirements for. Employers in Kuwait appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Kuwait: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer, and that position is applied to every Kuwaiti requirement without exception.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Kuwaiti Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Kuwait." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Kuwaiti deployment." },
    ],
    faqs: destinationFaqs("Kuwait"),
  },
  {
    slug: "malaysia",
    title: "Recruitment of Nepali Workers for Malaysia.",
    subtitle: "Malaysia",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Malaysian Employers.",
    missionText: [
      "Malaysia is a recruitment destination Seven Seas Intercontinental accepts requirements for. Employers in Malaysia appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Malaysia: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Malaysia sits outside the Gulf, so we do not apply our indicative Gulf mobilisation estimate to it. Lead times are confirmed against your specific requirement rather than quoted in advance. What does not change is the fee position: candidates are never charged recruitment, placement, or processing fees, and recruitment costs are paid by the employer.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Malaysian Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Malaysia." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Pre-Departure Orientation", desc: "Every selected worker completes the mandatory orientation covering the role, contract and destination." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Malaysian deployment." },
    ],
    faqs: destinationFaqs("Malaysia", NON_GULF_TIMEFRAME),
  },
  {
    slug: "japan",
    title: "Recruitment of Nepali Workers for Japan.",
    subtitle: "Japan",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Licensed Recruitment Partner for Japanese Employers.",
    missionText: [
      "Japan is a recruitment destination Seven Seas Intercontinental accepts requirements for. Employers in Japan appoint us to source, screen, trade-test and mobilise Nepali workers, with the Nepal-side process handled end to end by our Kathmandu team.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu. We do not operate a branch in Japan: your requirement is processed in Nepal under the Department of Foreign Employment framework, in coordination with you and your appointed representatives.",
      "Japan sits outside the Gulf, and employer requirements for it differ enough that we discuss them case by case rather than publishing a standard lead time or a fixed preparation path. The fee position is the same everywhere we work: candidates are never charged recruitment, placement, or processing fees, and recruitment costs are paid by the employer.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What You Get",
    featuresHeading: "How a Japanese Requirement Is Handled.",
    features: [
      { title: "Documented Demand Handling", desc: "Demand letter, power of attorney and employment agreement verified and registered before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable by live video from Japan." },
      { title: "Requirement-Led Preparation", desc: "Role-specific preparation agreed with you before mobilisation, rather than a single fixed path applied to every requirement." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate on every Japanese deployment." },
    ],
    faqs: destinationFaqs("Japan", NON_GULF_TIMEFRAME),
  },
  {
    slug: "europe",
    title: "Recruitment of Nepali Workers for Europe.",
    subtitle: "Europe",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "A Nepal-Side Recruitment Partner for European Employers.",
    missionText: [
      "Seven Seas Intercontinental supports employers across Europe with sourcing, screening, trade testing and mobilisation of Nepali workers, coordinated from our Kathmandu office. Employers are invited to contact our team to discuss country-specific workforce requirements.",
      "This is a regional page rather than a country page, and the distinction matters. Europe is not a single jurisdiction: entry rules, employer obligations and permitted recruitment routes differ from one European country to the next, and nothing here should be read as a statement about any particular country's requirements. We confirm what is possible for your country and your role once we have reviewed the requirement with you.",
      "We are a licensed Nepali recruitment agency established in 2010, working from a single office in Kathmandu, with no offices or branches in Europe. Candidates are never charged recruitment, placement, or processing fees; recruitment costs are paid by the employer.",
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "What We Handle",
    featuresHeading: "The Nepal-Side Work We Carry Out.",
    features: [
      { title: "Documented Demand Handling", desc: "Your requirement documents verified and registered under Nepal's Department of Foreign Employment framework before sourcing begins." },
      { title: "Nationwide Sourcing", desc: "Candidates identified across all seven provinces of Nepal, not only from Kathmandu walk-ins." },
      { title: "Practical Trade Testing", desc: "Skills validated in our Kathmandu trade test centre, observable remotely." },
      { title: "Employer-Led Selection", desc: "You interview and select. No worker is deployed to you without your approval." },
      { title: "Country-Specific Discussion", desc: "Feasibility, route and timing reviewed against your specific European country and role before anything is committed." },
      { title: "Employer-Pays Recruitment", desc: "Zero fees charged to the candidate, on every requirement we accept." },
    ],
    faqsEyebrow: "Employer Questions",
    faqsHeading: "What European Employers Ask Us.",
    faqs: [
      {
        q: "Do candidates pay any recruitment fees?",
        a: "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer. This applies to every requirement we accept, in every destination.",
      },
      {
        q: "Does this page mean you can recruit into any European country?",
        a: "No. This page describes the Nepal-side work we carry out for European employers; it is not a statement that recruitment is possible into every European country, nor a claim of authorisation in any specific one. Feasibility is confirmed per country and per requirement after we review it with you.",
      },
      {
        q: "Is 'Europe' here the same as the EU?",
        a: "No. We use Europe in the geographic sense, not as a reference to the European Union or to any other bloc or agreement. Membership of any such group does not determine how a requirement is handled.",
      },
      {
        q: "Are the rules the same across Europe?",
        a: "No. Entry rules, employer obligations and permitted recruitment routes differ from one European country to another, and they change over time. We do not publish country-specific requirements on this page, and nothing here should be treated as advice for a particular jurisdiction.",
      },
      {
        q: "How long does mobilisation take for a European requirement?",
        a: NON_GULF_TIMEFRAME,
      },
      {
        q: "Does Seven Seas have an office in Europe?",
        a: "No. Seven Seas Intercontinental operates from a single office in Kathmandu, Nepal. Work in Europe is handled through coordination with employers and partners in destination countries, not through a branch of our own.",
      },
      {
        q: "What recruitment standards do you work to?",
        a: "We maintain an ISO 9001:2015 certified Quality Management System for recruitment operations, and our recruitment practices are RBA-compliant and Sedex-compliant, operating within an RBA-aligned framework adhering to the Employer-Pays Principle.",
      },
    ],
    cta: {
      eyebrow: "Country-Specific Enquiry",
      heading: "Tell us which country you are hiring into.",
      body: "Share the European country, the roles, the headcount and your target start date. Our corporate relations team will respond within 24 hours to discuss what is possible for that specific requirement.",
      buttonLabel: "Request Workforce",
      buttonHref: "/employers/request-workforce",
    },
  },
];

/**
 * Pages that live at the site root rather than under a `[slug]` category. They
 * reuse the same resolver, template and CMS-override behaviour; only the CMS
 * slug and the canonical path differ.
 */
export const standaloneContent: PageContent[] = [
  {
    slug: "destinations",
    title: "Recruitment by Destination.",
    subtitle: "Destinations",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "Where We Recruit Nepali Workers For.",
    missionText: [
      "Seven Seas Intercontinental is a licensed Nepali recruitment agency, established in 2010 and working from a single office in Kathmandu. Employers appoint us to source, screen, trade-test and mobilise Nepali workers for their operations abroad.",
      "Eight countries have a destination page on this website — Saudi Arabia, the United Arab Emirates, Qatar, Oman, Bahrain, Kuwait, Malaysia and Japan — alongside a regional page covering our Nepal-side work for employers in Europe. These are the destinations currently featured here, not a closed list: Seven Seas Intercontinental accepts requirements for additional destinations, and the pages published here are expected to grow. Employers with staffing requirements for these or other destinations are invited to contact our team.",
      "The Nepal-side recruitment process is consistent across every jurisdiction we work in: each requirement is documented and registered under Nepal's Department of Foreign Employment framework, candidates are sourced and screened across all seven provinces, skills are trade-tested in Kathmandu, and every selected worker completes a mandatory pre-departure orientation before travel. What differs between destinations is the employer-side context, which we confirm against your specific requirement rather than publishing as general guidance.",
      INDICATIVE_TIMEFRAME,
    ],
    overviewSubtitle: "Overview",
    featuresEyebrow: "Individual Countries",
    featuresHeading: "Countries With a Destination Page.",
    features: [
      { title: "Saudi Arabia", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Saudi Arabian employers." },
      { title: "United Arab Emirates", desc: "Nepali workers sourced, screened, trade-tested and mobilised for UAE employers." },
      { title: "Qatar", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Qatari employers." },
      { title: "Oman", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Omani employers." },
      { title: "Bahrain", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Bahraini employers." },
      { title: "Kuwait", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Kuwaiti employers." },
      { title: "Malaysia", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Malaysian employers. Outside the Gulf, so lead times are confirmed per requirement." },
      { title: "Japan", desc: "Nepali workers sourced, screened, trade-tested and mobilised for Japanese employers. Requirements are discussed case by case." },
    ],
    linksEyebrow: "Destination Pages",
    linksHeading: "Explore Each Destination.",
    links: [
      { title: "Saudi Arabia", desc: "How we recruit Nepali workers for employers in Saudi Arabia.", href: "/destinations/saudi-arabia" },
      { title: "United Arab Emirates", desc: "How we recruit Nepali workers for employers in the UAE.", href: "/destinations/united-arab-emirates" },
      { title: "Qatar", desc: "How we recruit Nepali workers for employers in Qatar.", href: "/destinations/qatar" },
      { title: "Oman", desc: "How we recruit Nepali workers for employers in Oman.", href: "/destinations/oman" },
      { title: "Bahrain", desc: "How we recruit Nepali workers for employers in Bahrain.", href: "/destinations/bahrain" },
      { title: "Kuwait", desc: "How we recruit Nepali workers for employers in Kuwait.", href: "/destinations/kuwait" },
      { title: "Malaysia", desc: "How we recruit Nepali workers for employers in Malaysia.", href: "/destinations/malaysia" },
      { title: "Japan", desc: "How we recruit Nepali workers for employers in Japan.", href: "/destinations/japan" },
      { title: "Europe (Regional)", desc: "Regional page, not a country page. Our Nepal-side work for European employers, discussed country by country.", href: "/destinations/europe" },
      { title: "Sectors We Recruit For", desc: "The industries we source and screen Nepali workers for.", href: "/industries" },
      { title: "Current Demands", desc: "Published demands open for application right now.", href: "/demands" },
      { title: "Our Kathmandu Office", desc: "The office every requirement is processed from.", href: "/manpower-agency-in-kathmandu" },
    ],
    processEyebrow: "How We Mobilise",
    processHeading: "The Nepal-Side Recruitment Path.",
    process: destinationDefaults.process,
    faqsEyebrow: "Employer Questions",
    faqsHeading: "What Employers Ask Us.",
    faqs: [
      {
        q: "Which destinations do you recruit for?",
        a: "Saudi Arabia, the United Arab Emirates, Qatar, Oman, Bahrain, Kuwait, Malaysia and Japan are the country destination pages currently featured on our website, alongside a regional page for Europe. Seven Seas Intercontinental also recruits for additional destinations, and this list is expected to grow. Employers with workforce requirements for these or other destinations are invited to contact our team to discuss their specific needs.",
      },
      {
        q: "Is Europe a destination country on this site?",
        a: "No. Europe is a regional page describing the Nepal-side work we carry out for European employers. It is not a country page, and it is not a statement that recruitment is possible into every European country. Europe is not a single jurisdiction, so feasibility is confirmed per country and per requirement.",
      },
      {
        q: "Do candidates pay any recruitment fees?",
        a: "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer.",
      },
      {
        q: "How long does mobilisation usually take?",
        a: INDICATIVE_TIMEFRAME,
      },
      {
        q: "Does Seven Seas have offices in destination countries?",
        a: "No. Seven Seas Intercontinental operates from a single office in Kathmandu, Nepal. Work abroad is handled through coordination with employers and partners in destination countries, not through branches of our own.",
      },
      {
        q: "What recruitment standards do you work to?",
        a: "We maintain an ISO 9001:2015 certified Quality Management System for recruitment operations, and our recruitment practices are RBA-compliant and Sedex-compliant, operating within an RBA-aligned framework adhering to the Employer-Pays Principle.",
      },
    ],
    cta: {
      eyebrow: "Workforce Deployment Proposal",
      heading: "Ready to hire from Nepal?",
      body: "Share your role requirements, headcount and target start date. Our corporate relations team will respond within 24 hours with a tailored recruitment proposal.",
      buttonLabel: "Request Workforce",
      buttonHref: "/employers/request-workforce",
    },
  },
  {
    slug: "manpower-agency-in-kathmandu",
    title: "Manpower Agency in Kathmandu, Nepal.",
    subtitle: "Kathmandu Office",
    heroImage: DESTINATION_HERO_IMAGE,
    missionHeading: "Our Office in Guheswori, Kathmandu.",
    missionText: [
      "Seven Seas Intercontinental is a licensed manpower and overseas employment agency established in 2010, working from DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal. This is our only office; we have no other branches in Nepal or abroad.",
      "Every requirement we accept is processed here: sourcing across all seven provinces, screening, practical trade testing, training, pre-departure orientation, and the documentation required under Nepal's Department of Foreign Employment framework.",
      "You can reach the office on 01-5107440 or at info@smanpower.com. Employers should send workforce requirements through the Request Workforce form. Jobseekers should apply only through the published demands on our Demands page, and should never pay a recruitment fee to anyone.",
    ],
    overviewSubtitle: "Visit Us",
    featuresEyebrow: "Office Details",
    featuresHeading: "Where to Find Us.",
    features: [
      { title: "Address", desc: "DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal." },
      { title: "Phone", desc: "01-5107440, or +977 1 5107440 from outside Nepal." },
      { title: "Email", desc: "info@smanpower.com for employer and general enquiries." },
      { title: "Licensed Agency", desc: "Our foreign employment licence and registration records are published in the Trust Centre." },
      { title: "On-Site Facilities", desc: "Trade test, training and orientation facilities used throughout the recruitment process." },
      { title: "One Office Only", desc: "Kathmandu is our only office. Verify anyone who claims to represent us elsewhere before paying them anything." },
    ],
    linksEyebrow: "Two Ways to Work With Us",
    linksHeading: "Employers and Jobseekers.",
    links: [
      { title: "Employers: Request Workforce", desc: "Send us your role requirements, headcount and target start date.", href: "/employers/request-workforce" },
      { title: "Jobseekers: Current Demands", desc: "Apply only through the published demands. Never pay a recruitment fee.", href: "/demands" },
      { title: "Recruitment by Destination", desc: "The destinations we currently recruit for.", href: "/destinations" },
      { title: "Our Facilities", desc: "Trade test, training and orientation facilities at our Kathmandu operation.", href: "/training-facilities" },
      { title: "Licences & Registration", desc: "Verify our licence and registration records before engaging us.", href: "/trust-centre/licences" },
      { title: "Worker Grievance Channel", desc: "Confidential channel for workers and applicants to raise a concern.", href: "/worker-grievance" },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Visiting and Verifying Us.",
    faqs: [
      {
        q: "Where is the Seven Seas Intercontinental office?",
        a: "DAI Complex, Panchakanya Marga, Guheswori, Kathmandu, Bagmati Province 44600, Nepal. It is our only office.",
      },
      {
        q: "Does Seven Seas have other branches or any office abroad?",
        a: "No. Kathmandu is our only office. Work in destination countries is handled through coordination with employers and partners in destination countries.",
      },
      {
        q: "I am a jobseeker. How do I apply?",
        a: "Apply only through the published demands on our Demands page. Do not send CVs through the employer enquiry form, and do not pay a recruitment fee to anyone claiming to represent us.",
      },
      {
        q: "I am an employer. How do I start?",
        a: "Use the Request Workforce form and include your role requirements, headcount and target start date. Our corporate relations team responds within 24 hours.",
      },
      {
        q: "How can I verify that Seven Seas is licensed?",
        a: "Our foreign employment licence, authority certificate for sending trainee workers to Japan, and company incorporation certificate are published in our Trust Centre.",
      },
    ],
    cta: {
      eyebrow: "Kathmandu Head Office",
      heading: "Talk to our Kathmandu team.",
      body: "Employers can submit a workforce requirement and receive a response within 24 hours. Jobseekers should review the currently published demands and apply through the official demand listing.",
      buttonLabel: "Request Workforce",
      buttonHref: "/employers/request-workforce",
      secondaryLabel: "View Current Demands",
      secondaryHref: "/demands",
    },
  },
];

// Helper to look up content
export function getContentBySlug(category: string, slug: string): PageContent | undefined {
  const map: Record<string, PageContent[]> = {
    employers: employersContent,
    "ethical-recruitment": ethicalContent,
    industries: industriesContent,
    "training-facilities": trainingContent,
    "trust-centre": trustContent,
    destinations: destinationsContent,
    standalone: standaloneContent,
  };

  const page = map[category]?.find((p) => p.slug === slug);
  if (!page) return undefined;

  // Layer the category-wide process / FAQ / CTA sections underneath the page's
  // own data so every child page renders 5-6 sections; page fields win.
  return { ...categoryDefaults[category], ...page };
}

/**
 * Resolve the destination page href for a destinations-hub feature card.
 *
 * The hub's "Countries With a Destination Page" cards carry only a title/desc
 * (in both the CMS and the content.ts fallback), so the link target is derived
 * from `destinationsContent`, matching the card title against a destination's
 * display name. Returns undefined for a title with no destination page, so
 * non-country feature cards elsewhere stay non-clickable.
 */
export function destinationHrefForFeature(title: string): string | undefined {
  const match = destinationsContent.find((c) => c.subtitle === title);
  return match ? `/destinations/${match.slug}` : undefined;
}

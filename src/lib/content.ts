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
  }[];
  documents?: {
    title: string;
    image: string;
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
  /** Closing call-to-action band. Rendered when present. */
  cta?: {
    heading: string;
    body: string;
    buttonLabel?: string;
    buttonHref?: string;
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
      { q: "Do candidates pay any recruitment fees?", a: "No. We operate strictly on the employer-pays principle. Candidates are never charged placement or processing fees." },
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
      { q: "How do you prevent forced labour?", a: "Workers keep their own passports and documents, contracts are transparent, and our sourcing network is audited against RBA standards." },
      { q: "What happens if a worker has a complaint abroad?", a: "They can report anonymously through our 24/7 grievance channels, and dedicated welfare officers investigate every case." },
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
      { title: "Deployment & Support", desc: "We handle documentation and travel, then stay engaged through our on-ground offices in destination countries." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Sourcing For Your Sector.",
    faqs: [
      { q: "Are candidates skill-tested for this industry?", a: "Yes. Every candidate is trade-tested against sector standards before being shortlisted for deployment." },
      { q: "Can you supply workers at scale?", a: "Our nationwide sourcing network lets us run industry-specific recruitment drives to meet high-volume requirements." },
      { q: "Which destination countries do you serve?", a: "We deploy across the Gulf, Europe, and Asia, with coordination offices supporting workers after arrival." },
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
      { title: "Government Licensing", desc: "We operate under full authorization from Nepal's Department of Foreign Employment, maintained through regular audits." },
      { title: "International Standards", desc: "Our processes are certified against ISO quality management and aligned with the Responsible Business Alliance code." },
      { title: "Open Documentation", desc: "Licenses, certifications, and compliance records are available for employer review under our open-book policy." },
      { title: "Independent Audits", desc: "We submit to unannounced third-party checks and maintain a flawless regulatory compliance record." },
    ],
    faqsEyebrow: "Common Questions",
    faqsHeading: "Trust & Compliance.",
    faqs: [
      { q: "Is Seven Seas government licensed?", a: "Yes. We are fully licensed by the Department of Foreign Employment (DOFE), Nepal, with a clean compliance record." },
      { q: "What certifications do you hold?", a: "We hold ISO 9001:2015 for quality management and operate on a Responsible Business Alliance–aligned framework." },
      { q: "Can we review your compliance documents?", a: "Absolutely. Our major licenses, tax clearances, and certifications are open for partner review." },
    ],
    cta: {
      heading: "Partner with confidence.",
      body: "Work with a licensed, audited, and internationally certified recruitment partner.",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
    missionHeading: "Beyond the Flight.",
    missionText: [
      "Our responsibility does not end when the candidate boards the plane. We manage flight logistics, airport transfers, and maintain a 24/7 welfare hotline.",
      "With coordination offices in the Middle East, we are always on hand to resolve grievances and support both the worker and the employer."
    ],
    features: [
      { title: "Flight Logistics", desc: "Coordinating bulk travel arrangements." },
      { title: "24/7 Hotline", desc: "Always-on grievance mechanism for deployed workers." },
      { title: "On-Ground Offices", desc: "Physical presence in major destination countries." }
    ]
  },
  {
    slug: "workforce-intelligence",
    title: "Workforce Intelligence & Analytics.",
    subtitle: "Intelligence",
    heroImage: "/images/corporate_office_interview_1782920412325.png"
  }
];

export const ethicalContent: PageContent[] = [
  {
    slug: "rba-aligned-practices",
    title: "RBA-Aligned Recruitment Practices.",
    subtitle: "RBA Alignment",
    heroImage: "/images/corporate_office_interview_1782920412325.png",
    missionHeading: "What RBA Alignment Means — And How We Apply It.",
    overviewSubtitle: "The Standard Explained",
    missionText: [
      "The Responsible Business Alliance (RBA) Code of Conduct is one of the world's most widely adopted standards for labour rights in global supply chains. Its provisions are drawn from international instruments — the UN Guiding Principles on Business and Human Rights, core ILO Conventions, and the ILO General Principles and Operational Guidelines for Fair Recruitment — and increasingly define what international employers expect of the agencies that recruit for them.",
      "Seven Seas Intercontinental is a recruitment agency licensed by the Department of Foreign Employment (DoFE), Government of Nepal. We are not a manufacturer or an RBA member company, so we do not claim RBA membership. What we do is align our own operating procedures with the labour provisions of the RBA Code of Conduct, so that a worker we place is recruited to the same standard a responsible international employer is required to uphold.",
      "In practice, that alignment rests on a few non-negotiable commitments: employment must be freely chosen; no worker may be charged a recruitment fee; every worker must receive a written contract in a language they understand; and workers must be treated humanely, without discrimination, with safe conditions and lawful working hours. These are the same principles an RBA or SMETA social audit would assess, and we hold ourselves to them whether or not a specific client requires an audit.",
      "Because most exploitation enters a supply chain through unregulated sub-agents and brokers, our alignment work concentrates there. We source only through vetted partners who accept these standards in writing, we verify the terms a worker is offered before departure, and we act on any breach rather than looking away. Ethical recruitment is a continuous due-diligence process, not a certificate on a wall.",
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
    processHeading: "Our RBA-Aligned Due-Diligence Cycle.",
    process: [
      { title: "Policy Commitment", desc: "Our recruitment policy adopts the RBA labour provisions and the Employer-Pays Principle as binding internal rules for all staff and partners." },
      { title: "Partner Vetting & Onboarding", desc: "Every sub-agent and employer signs up to these standards in writing before any candidate is sourced through them. Unregulated brokers are excluded." },
      { title: "Pre-Departure Verification", desc: "Before a worker leaves, we verify that the contract, wages, and cost allocation match what was promised — and that no fee was charged to the worker." },
      { title: "Monitoring & Corrective Action", desc: "We stay engaged after deployment through our destination-country contacts, investigate concerns, and remediate or terminate partners who breach the code." },
    ],
    faqsEyebrow: "Honest Answers",
    faqsHeading: "RBA Alignment, Clarified.",
    faqs: [
      { q: "Are you an RBA member or RBA-certified?", a: "No. The RBA's membership is for brands and manufacturers. As a licensed recruitment agency we align our procedures with the labour provisions of the RBA Code of Conduct — we do not claim membership or certification we don't hold." },
      { q: "Which standards actually inform your framework?", a: "The RBA Code of Conduct, the ILO General Principles and Operational Guidelines for Fair Recruitment, the IOM IRIS principles of ethical recruitment, the Dhaka Principles for Migration with Dignity, and Nepal's Foreign Employment Act, 2007." },
      { q: "What is the single most important RBA principle for a migrant worker?", a: "That employment is freely chosen and free of worker-paid fees. Fees charged to workers are the most common route into debt bondage and forced labour, which is why we prohibit them outright." },
      { q: "What happens if one of your partners breaches the code?", a: "We investigate, ensure any worker-paid fee is repaid, require corrective action, and blacklist partners who will not comply. Alignment is enforced, not assumed." },
    ],
  },
  {
    slug: "worker-rights",
    title: "Protecting Worker Rights.",
    subtitle: "Worker Rights",
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
      { title: "Case Logging & Tracking", desc: "Every grievance is recorded, acknowledged, and tracked to resolution, with the worker kept informed of progress." },
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
      { q: "How quickly are grievances handled?", a: "Every grievance is acknowledged promptly and investigated without undue delay; urgent safety issues are prioritised for immediate attention." },
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    subtitle: "Security", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
    missionHeading: "Vigilance and Discipline.",
    missionText: [
      "Nepal has a legendary history of providing some of the world's most disciplined and reliable security personnel. We source ex-military, ex-police, and highly trained civilian guards for international deployment.",
      "Our security personnel are currently deployed across the Middle East and Asia, protecting critical infrastructure, luxury hotels, and corporate headquarters."
    ],
    features: [
      { title: "Ex-Military Expertise", desc: "Access to veterans from the Nepalese Army and Police forces." },
      { title: "Physical Conditioning", desc: "Rigorous physical and psychological fitness testing." },
      { title: "Asset Protection", desc: "Specialized training in VIP and critical infrastructure security." }
    ]
  },
  { 
    slug: "construction-and-technical-trades", 
    title: "Construction & Technical Trades.", 
    subtitle: "Construction", 
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    subtitle: "Hospitality", 
    heroImage: "/images/corporate_office_interview_1782920412325.png",
    missionHeading: "The Art of Service.",
    missionText: [
      "Nepalese hospitality is world-renowned for its warmth and genuine care. We supply luxury hotels, resorts, and restaurants globally with top-tier service staff.",
      "From front-desk concierges and executive chefs to housekeeping and F&B servers, our candidates are trained to meet 5-star international standards."
    ],
    features: [
      { title: "Language Proficiency", desc: "Fluent English speakers with excellent communication skills." },
      { title: "5-Star Standards", desc: "Training aligned with luxury international hotel chains." },
      { title: "Culinary Expertise", desc: "Specialized chefs and kitchen staff for diverse cuisines." }
    ]
  },
  { 
    slug: "facility-management", 
    title: "Facility Management Professionals.", 
    subtitle: "Facilities", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    slug: "licences", 
    title: "Our Recruitment Licences.", 
    subtitle: "Licences", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
    missionHeading: "Government Approved.",
    missionText: [
      "Seven Seas Intercontinental operates with full authorization from the Government of Nepal, Department of Foreign Employment (DOFE).",
      "Our licenses are maintained through strict adherence to national labor laws and regular governmental audits, ensuring your recruitment process is 100% legally compliant."
    ],
    features: [
      { title: "DOFE Authorized", desc: "Fully licensed by the Department of Foreign Employment, Nepal." },
      { title: "Zero Infractions", desc: "A flawless compliance record with national regulatory bodies." },
      { title: "Regular Renewals", desc: "Licenses maintained through consistent, successful audits." }
    ],
    documents: [
      { title: "License of Foreign Employment", image: "/images/hero_training_orientation_1782920391505.png" },
      { title: "Authority Certificate — Sending Trainee Workers to Japan", image: "/images/trade_test_centre_1782920400836.png" },
      { title: "Certificate of Incorporation of Company", image: "/images/corporate_office_interview_1782920412325.png" }
    ]
  },
  { 
    slug: "certifications", 
    title: "Global Certifications.", 
    subtitle: "Certifications", 
    heroImage: "/images/trade_test_centre_1782920400836.png",
    missionHeading: "Internationally Recognized.",
    missionText: [
      "Our commitment to quality and ethics is validated by international standards bodies. We hold ISO certifications for Quality Management Systems.",
      "These certifications guarantee that our internal processes for sourcing, screening, and deployment meet the highest global benchmarks for reliability."
    ],
    features: [
      { title: "ISO 9001:2015", desc: "Certified for rigorous Quality Management Systems." },
      { title: "RBA Alignment", desc: "Operational framework built on the Responsible Business Alliance code." },
      { title: "Continuous Audits", desc: "Subject to unannounced third-party compliance checks." }
    ]
  },
  { 
    slug: "compliance-documents", 
    title: "Compliance Documents.", 
    subtitle: "Compliance", 
    heroImage: "/images/corporate_office_interview_1782920412325.png",
    missionHeading: "Total Transparency.",
    missionText: [
      "We believe that trust is built on transparency. All our major compliance documents, tax clearances, and operational licenses are available for employer review.",
      "By maintaining an open-book policy, we assure our partners that they are working with a financially stable and legally unassailable entity."
    ],
    features: [
      { title: "Tax Clearances", desc: "Up-to-date financial compliance with the Government of Nepal." },
      { title: "Chamber of Commerce", desc: "Registered and active members of the national business chamber." },
      { title: "NAFEA Membership", desc: "Active members of the Nepal Association of Foreign Employment Agencies." }
    ]
  },
  { 
    slug: "policies", 
    title: "Ethical Recruitment Policies.", 
    subtitle: "Policies", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
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
    heroImage: "/images/trade_test_centre_1782920400836.png",
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
    heroImage: "/images/corporate_office_interview_1782920412325.png",
    missionHeading: "Always Listening.",
    missionText: [
      "Even with the best preparation, issues can arise during deployment. Our Grievance Mechanism provides a safe, anonymous way for workers to report concerns.",
      "Our dedicated welfare officers investigate every claim, working with both the worker and the employer to find an equitable resolution."
    ],
    features: [
      { title: "Anonymous Reporting", desc: "Secure channels for workers to report issues without fear." },
      { title: "Welfare Officers", desc: "Dedicated staff in major deployment hubs to mediate disputes." },
      { title: "48-Hour Response", desc: "Mandated rapid-response protocol for all severe grievances." }
    ]
  }
];

// Helper to look up content
export function getContentBySlug(category: string, slug: string): PageContent | undefined {
  const map: Record<string, PageContent[]> = {
    employers: employersContent,
    "ethical-recruitment": ethicalContent,
    industries: industriesContent,
    "training-facilities": trainingContent,
    "trust-centre": trustContent,
  };

  const page = map[category]?.find((p) => p.slug === slug);
  if (!page) return undefined;

  // Layer the category-wide process / FAQ / CTA sections underneath the page's
  // own data so every child page renders 5-6 sections; page fields win.
  return { ...categoryDefaults[category], ...page };
}

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
  /**
   * Labels rendered by DynamicPageTemplate itself. Optional: when absent the
   * template falls back to the wording it has always shown.
   */
  overviewSubtitle?: string;
  featuresEyebrow?: string;
  featuresHeading?: string;
  documentsEyebrow?: string;
  documentsHeading?: string;
}

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
    missionHeading: "The Gold Standard in Ethics.",
    missionText: [
      "The Responsible Business Alliance (RBA) sets the global standard for supply chain sustainability and worker rights. At Seven Seas, our entire operational framework is built on RBA principles.",
      "We believe that ethical recruitment is a non-negotiable requirement for modern global business."
    ],
    features: [
      { title: "Zero Forced Labor", desc: "Strict prohibitions against debt bondage or involuntary labor." },
      { title: "Humane Treatment", desc: "Ensuring all candidates are treated with absolute dignity." },
      { title: "Regular Audits", desc: "Frequent internal and third-party audits of our sourcing network." }
    ]
  },
  { 
    slug: "worker-rights", 
    title: "Protecting Worker Rights.", 
    subtitle: "Worker Rights", 
    heroImage: "/images/trade_test_centre_1782920400836.png",
    missionHeading: "Advocating for the Vulnerable.",
    missionText: [
      "Migrant workers are often the most vulnerable population in the global workforce. We act as their fierce advocates from the moment they step into our offices.",
      "We ensure complete transparency regarding contracts, living conditions, and host-country labor laws before any commitment is made."
    ],
    features: [
      { title: "Contract Transparency", desc: "All contracts are provided in the candidate's native language." },
      { title: "Freedom of Movement", desc: "Workers retain full control of their passports and identity documents." },
      { title: "Safe Environments", desc: "We only partner with employers who guarantee safe working conditions." }
    ]
  },
  { 
    slug: "recruitment-fees", 
    title: "Zero Recruitment Fees Policy.", 
    subtitle: "Fee Transparency", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
    missionHeading: "The Employer-Pays Principle.",
    missionText: [
      "The burden of recruitment costs should never fall on the worker. We strictly enforce the 'Employer-Pays Principle' across our entire network.",
      "Any sub-agent or partner found charging fees to candidates is immediately blacklisted."
    ],
    features: [
      { title: "Zero Fees Charged", desc: "Candidates pay nothing for placement or processing." },
      { title: "Cost Coverage", desc: "Employers cover flights, visas, medicals, and agency fees." },
      { title: "Strict Enforcement", desc: "Continuous monitoring of our supply chain for fee-charging." }
    ]
  },
  { 
    slug: "grievance-process", 
    title: "Transparent Grievance Process.", 
    subtitle: "Grievances", 
    heroImage: "/images/corporate_office_interview_1782920412325.png",
    missionHeading: "A Voice That is Heard.",
    missionText: [
      "Ethical recruitment requires a mechanism for workers to report issues without fear of retaliation. We provide accessible, multilingual grievance channels.",
      "Our welfare team in the Middle East ensures that every complaint is investigated and resolved swiftly."
    ],
    features: [
      { title: "24/7 Hotline", desc: "A dedicated toll-free number for deployed workers." },
      { title: "Anonymity Guaranteed", desc: "Workers can report issues without fear of retaliation." },
      { title: "Swift Resolution", desc: "Dedicated teams ensure grievances are addressed within 48 hours." }
    ]
  },
  { 
    slug: "policies", 
    title: "Our Ethical Policies.", 
    subtitle: "Policies", 
    heroImage: "/images/hero_training_orientation_1782920391505.png",
    missionHeading: "A Framework of Integrity.",
    missionText: [
      "Our policies are not just documents; they are the governing laws of our organization. They dictate how we source, screen, and deploy talent globally.",
      "By maintaining these strict internal regulations, we ensure that Seven Seas remains a beacon of ethical recruitment in Nepal."
    ],
    features: [
      { title: "Code of Conduct", desc: "Mandatory compliance for all staff and partners." },
      { title: "Anti-Bribery Policy", desc: "Zero tolerance for corruption or kickbacks." },
      { title: "Continuous Training", desc: "Regular staff training on ethical compliance updates." }
    ]
  }
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
      { title: "DOFE Operating License", image: "/images/hero_training_orientation_1782920391505.png" },
      { title: "Company Registration", image: "/images/trade_test_centre_1782920400836.png" },
      { title: "Tax Clearance Certificate", image: "/images/corporate_office_interview_1782920412325.png" }
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
  
  return map[category]?.find((p) => p.slug === slug);
}

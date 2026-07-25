// ============================================================
// Demo Pages Data
// ============================================================

import type { CmsPage, CmsContentBlock, TiptapContent } from "@/types/content";
import { demoMedia } from "./media";

function richText(text: string): TiptapContent {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function richHeading(text: string): TiptapContent {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text }],
      },
    ],
  };
}

// Convert a simple page structure to CmsPage with an image_text block
const createPage = (
  slug: string,
  title: string,
  subtitle: string,
  missionHeading: string,
  missionText: string[],
  features: { title: string; desc: string }[] = [],
  documents: { title: string; image: string }[] = []
): CmsPage => {
  const blocks: CmsContentBlock[] = [
    {
      id: `block-${slug}-intro`,
      blockKey: `${slug}-intro`,
      blockType: "image_text",
      pageSlug: slug,
      order: 1,
      visible: true,
      richHeading: richHeading(missionHeading),
      content: {
        paragraphs: missionText,
        features: features,
        documents: documents,
      },
      image: demoMedia.corporateOffice, // Generic fallback
    }
  ];

  return {
    id: `page-${slug}`,
    slug,
    title,
    subtitle,
    status: "PUBLISHED",
    seo: {
      metaTitle: `${title} | Seven Seas Intercontinental`,
    },
    blocks,
  };
};

import { aboutPage } from "./pages/about";
import { employersPage } from "./pages/employers";
import { ethicalRecruitmentPage } from "./pages/ethical-recruitment";
import { industriesPage } from "./pages/industries";
import { trainingFacilitiesPage } from "./pages/training-facilities";
import { trustCentrePage } from "./pages/trust-centre";

export const demoPages: CmsPage[] = [
  aboutPage,
  employersPage,
  ethicalRecruitmentPage,
  industriesPage,
  trainingFacilitiesPage,
  trustCentrePage,
  // Employers
  createPage(
    "employers/candidate-sourcing",
    "Global Candidate Sourcing Network.",
    "Sourcing",
    "Identifying Top Talent Across Nepal.",
    [
      "Our sourcing network is deeply integrated across all seven provinces of Nepal. We don't just rely on walk-ins; we actively identify and engage with skilled candidates in their local communities.",
      "Through a vast network of verified, ethical sourcing partners, we ensure that every candidate we present has been responsibly recruited without being subjected to exploitative fees."
    ],
    [
      { title: "Nationwide Reach", desc: "Access to talent pools across all 7 provinces." },
      { title: "Ethical Sourcing", desc: "Zero recruitment fees for candidates." },
      { title: "Targeted Campaigns", desc: "Industry-specific recruitment drives." }
    ]
  ),
  createPage(
    "employers/screening",
    "Rigorous Candidate Screening.",
    "Screening",
    "Quality Assured at Every Step.",
    [
      "Before a candidate is ever presented to an employer, they undergo a rigorous, multi-stage screening process. This ensures they possess both the technical skills and the psychological readiness for international deployment.",
      "Our screening includes background checks, medical pre-screening, and in-depth interviews by industry experts."
    ],
    [
      { title: "Behavioral Interviews", desc: "Assessing psychological readiness for overseas work." },
      { title: "Medical Pre-Screening", desc: "Ensuring candidates meet host-country health standards." },
      { title: "Background Checks", desc: "Verifying criminal records and past employment history." }
    ]
  ),
  createPage(
    "employers/trade-testing",
    "World-Class Trade Testing.",
    "Testing",
    "Practical Validation of Skills.",
    [
      "We operate our own state-of-the-art trade testing facilities in Kathmandu. Candidates are required to demonstrate their practical skills using the exact tools and equipment they will use in the host country.",
      "Our testing protocols are developed in consultation with international industry experts."
    ],
    [
      { title: "Simulated Workplaces", desc: "Testing in environments identical to the deployment site." },
      { title: "Certified Assessors", desc: "Evaluations conducted by internationally certified trainers." },
      { title: "Custom Protocols", desc: "Tests tailored to your specific corporate requirements." }
    ]
  ),
  createPage(
    "employers/training",
    "Pre-Deployment Training.",
    "Training",
    "Prepared for Day One.",
    [
      "Technical skills are only half the equation. Our mandatory pre-deployment orientation ensures candidates understand the cultural norms, labor laws, and safety regulations of their destination country.",
      "This drastically reduces culture shock and ensures immediate productivity upon arrival."
    ],
    [
      { title: "Cultural Orientation", desc: "Deep dives into host-country customs and laws." },
      { title: "Safety Briefings", desc: "Rigorous occupational health and safety training." },
      { title: "Language Prep", desc: "Basic language courses for seamless communication." }
    ]
  ),
  createPage(
    "employers/documentation",
    "Documentation & Processing.",
    "Documentation",
    "Frictionless Legal Compliance.",
    [
      "International deployment involves navigating a labyrinth of bureaucratic requirements. Our dedicated processing team handles everything from passport acquisition to final embassy approvals.",
      "We maintain excellent relationships with the Department of Foreign Employment (DOFE) to expedite clearances."
    ],
    [
      { title: "Visa Processing", desc: "End-to-end management of embassy requirements." },
      { title: "DOFE Clearances", desc: "Fast-tracked government labor approvals." },
      { title: "Contract Transparency", desc: "Ensuring candidates fully understand their contracts in Nepali." }
    ]
  ),
  createPage(
    "employers/deployment",
    "Deployment & Post-Arrival Support.",
    "Deployment",
    "Beyond the Flight.",
    [
      "Our responsibility does not end when the candidate boards the plane. We manage flight logistics, airport transfers, and maintain a 24/7 welfare hotline.",
      "With coordination offices in the Middle East, we are always on hand to resolve grievances and support both the worker and the employer."
    ],
    [
      { title: "Flight Logistics", desc: "Coordinating bulk travel arrangements." },
      { title: "24/7 Hotline", desc: "Always-on grievance mechanism for deployed workers." },
      { title: "On-Ground Offices", desc: "Physical presence in major destination countries." }
    ]
  ),
  createPage(
    "employers/workforce-intelligence",
    "Workforce Intelligence & Analytics.",
    "Intelligence",
    "Data-Driven Recruitment.",
    [
      "We leverage data to optimize recruitment strategies, providing employers with insights into talent availability, salary trends, and skill gaps across Nepal."
    ]
  ),

  // Ethical
  createPage(
    "ethical-recruitment/rba-aligned-practices",
    "RBA-Aligned Recruitment Practices.",
    "RBA Alignment",
    "The Gold Standard in Ethics.",
    [
      "The Responsible Business Alliance (RBA) sets the global standard for supply chain sustainability and worker rights. At Seven Seas, our entire operational framework is built on RBA principles.",
      "We believe that ethical recruitment is a non-negotiable requirement for modern global business."
    ],
    [
      { title: "Zero Forced Labor", desc: "Strict prohibitions against debt bondage or involuntary labor." },
      { title: "Humane Treatment", desc: "Ensuring all candidates are treated with absolute dignity." },
      { title: "Regular Audits", desc: "Frequent internal and third-party audits of our sourcing network." }
    ]
  ),
  createPage(
    "ethical-recruitment/worker-rights",
    "Protecting Worker Rights.",
    "Worker Rights",
    "Advocating for the Vulnerable.",
    [
      "Migrant workers are often the most vulnerable population in the global workforce. We act as their fierce advocates from the moment they step into our offices.",
      "We ensure complete transparency regarding contracts, living conditions, and host-country labor laws before any commitment is made."
    ],
    [
      { title: "Contract Transparency", desc: "All terms explained clearly in the candidate's native language." },
      { title: "Freedom of Movement", desc: "Absolute prohibition on passport or document retention." },
      { title: "Fair Compensation", desc: "Ensuring wages meet or exceed host-country legal standards." }
    ]
  ),
  createPage(
    "ethical-recruitment/recruitment-fees",
    "Zero Recruitment Fees.",
    "Recruitment Fees",
    "The Employer-Pays Principle.",
    [
      "We operate strictly on the 'Employer-Pays Principle'. No worker should ever have to pay for a job. Period.",
      "We actively educate candidates on avoiding fraudulent sub-agents and maintain strict auditing of our entire sourcing pipeline to ensure zero hidden costs."
    ],
    [
      { title: "Zero Placement Fees", desc: "Candidates are never charged for our recruitment services." },
      { title: "Cost Coverage", desc: "Employers cover visas, flights, and medical screening." },
      { title: "Refund Policy", desc: "Immediate remediation if any unauthorized fees are discovered." }
    ]
  ),
  createPage(
    "ethical-recruitment/privacy-policy",
    "Privacy and Data Protection.",
    "Privacy",
    "Securing Personal Data.",
    [
      "We handle sensitive personal, medical, and financial data for thousands of candidates. Our data protection protocols are designed to ensure this information is never compromised or misused.",
      "We comply with all relevant national and international data privacy regulations."
    ],
    [
      { title: "Secure Storage", desc: "All candidate data is encrypted and stored on secure servers." },
      { title: "Strict Access Controls", desc: "Data is only accessible to required processing staff." },
      { title: "Right to Deletion", desc: "Candidates can request their data be removed from our systems." }
    ]
  ),

  // Trust Centre
  createPage(
    "trust-centre/licences",
    "Our Recruitment Licences.",
    "Licences",
    "Government Approved.",
    [
      "Seven Seas Intercontinental operates with full authorization from the Government of Nepal, Department of Foreign Employment (DOFE).",
      "Our licenses are maintained through strict adherence to national labor laws and regular governmental audits, ensuring your recruitment process is 100% legally compliant."
    ],
    [
      { title: "DOFE Authorized", desc: "Fully licensed by the Department of Foreign Employment, Nepal." },
      { title: "Zero Infractions", desc: "A flawless compliance record with national regulatory bodies." },
      { title: "Regular Renewals", desc: "Licenses maintained through consistent, successful audits." }
    ],
    [
      { title: "License of Foreign Employment", fileUrl: "/docs/recruitment-licence.pdf", image: "" },
      { title: "Authority Certificate — Sending Trainee Workers to Japan", fileUrl: "/docs/japan-trainee-certificate.pdf", image: "" },
      { title: "Certificate of Incorporation of Company", fileUrl: "/docs/incorporation-certificate.pdf", image: "" }
    ]
  ),
  createPage(
    "trust-centre/certifications",
    "Global Certifications.",
    "Certifications",
    "Internationally Recognized.",
    [
      "Our commitment to quality and ethics is validated by international standards bodies. We hold ISO certifications for Quality Management Systems.",
      "These certifications guarantee that our internal processes for sourcing, screening, and deployment meet the highest global benchmarks for reliability."
    ],
    [
      { title: "ISO 9001:2015", desc: "Certified for rigorous Quality Management Systems." },
      { title: "RBA Alignment", desc: "Operational framework built on the Responsible Business Alliance code." },
      { title: "Continuous Audits", desc: "Subject to unannounced third-party compliance checks." }
    ]
  ),
  createPage(
    "trust-centre/compliance-documents",
    "Compliance Documents.",
    "Compliance",
    "Total Transparency.",
    [
      "We believe that trust is built on transparency. All our major compliance documents, tax clearances, and operational licenses are available for employer review.",
      "By maintaining an open-book policy, we assure our partners that they are working with a financially stable and legally unassailable entity."
    ],
    [
      { title: "Tax Clearances", desc: "Up-to-date financial compliance with the Government of Nepal." },
      { title: "Chamber of Commerce", desc: "Registered and active members of the national business chamber." },
      { title: "NAFEA Membership", desc: "Active members of the Nepal Association of Foreign Employment Agencies." }
    ]
  ),
  createPage(
    "trust-centre/policies",
    "Ethical Recruitment Policies.",
    "Policies",
    "The Rules We Live By.",
    [
      "Our internal policies are strict, uncompromising, and designed to protect the most vulnerable. They dictate our zero-tolerance stance on forced labor and recruitment fees.",
      "Every staff member and sub-agent is required to sign and adhere to our Ethical Recruitment Code of Conduct."
    ],
    [
      { title: "Zero Recruitment Fees", desc: "Strict enforcement of the Employer-Pays principle." },
      { title: "Anti-Bribery", desc: "Comprehensive anti-corruption policies across our network." },
      { title: "Data Protection", desc: "Stringent privacy policies securing candidate personal information." }
    ]
  ),
  createPage(
    "trust-centre/verified-partners",
    "Verified Partnerships.",
    "Partnerships",
    "A Trusted Network.",
    [
      "A recruitment agency is only as ethical as its sourcing network. We do not use unregulated brokers. Instead, we rely on a heavily vetted network of verified sourcing partners.",
      "These partners are audited regularly to ensure they do not charge candidates fees or provide misleading information about job roles."
    ],
    [
      { title: "Direct Sourcing", desc: "Minimizing middle-men to reduce the risk of exploitation." },
      { title: "Partner Audits", desc: "Regular investigations into the practices of our sourcing network." },
      { title: "Blacklisting Policy", desc: "Immediate severance with any entity found violating our ethical codes." }
    ]
  ),
  createPage(
    "trust-centre/grievance",
    "Grievance & Complaint Support.",
    "Support",
    "Always Listening.",
    [
      "Even with the best preparation, issues can arise during deployment. Our Grievance Mechanism provides a safe, anonymous way for workers to report concerns.",
      "Our dedicated welfare officers investigate every claim, working with both the worker and the employer to find an equitable resolution."
    ],
    [
      { title: "Anonymous Reporting", desc: "Secure channels for workers to report issues without fear." },
      { title: "Welfare Officers", desc: "Dedicated staff in major deployment hubs to mediate disputes." },
      { title: "48-Hour Response", desc: "Mandated rapid-response protocol for all severe grievances." }
    ]
  )
];

// ============================================================
// Demo Industries Data
// ============================================================

import type { CmsIndustry } from "@/types/content";
import { demoMedia } from "./media";

export const demoIndustries: CmsIndustry[] = [
  {
    id: "ind-1",
    name: "Security Services",
    slug: "security-services",
    description: "Vigilance and Discipline.",
    icon: "ShieldCheck",
    image: demoMedia.heroTraining,
    order: 1,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-2",
    name: "Construction & Technical Trades",
    slug: "construction-and-technical-trades",
    description: "Building the Future.",
    icon: "HardHat",
    image: demoMedia.tradeTestCentre,
    order: 2,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-3",
    name: "Hospitality & Hotels",
    slug: "hospitality-and-hotels",
    description: "The Art of Service.",
    icon: "Coffee",
    image: demoMedia.corporateOffice,
    order: 3,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-4",
    name: "Facility Management",
    slug: "facility-management",
    description: "Maintaining Excellence.",
    icon: "Building",
    image: demoMedia.heroTraining,
    order: 4,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-5",
    name: "Aviation & Ground Handling",
    slug: "aviation-and-ground-handling",
    description: "Keeping Operations Flying.",
    icon: "Plane",
    image: demoMedia.tradeTestCentre,
    order: 5,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-6",
    name: "Manufacturing",
    slug: "manufacturing",
    description: "Powering Production.",
    icon: "Factory",
    image: demoMedia.corporateOffice,
    order: 6,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-7",
    name: "Healthcare Support",
    slug: "healthcare-support",
    description: "Compassionate Care.",
    icon: "HeartPulse",
    image: demoMedia.heroTraining,
    order: 7,
    isActive: true,
    pageContent: {
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
    }
  },
  {
    id: "ind-8",
    name: "Logistics & Transport",
    slug: "logistics-and-transport",
    description: "Moving the World.",
    icon: "Truck",
    image: demoMedia.tradeTestCentre,
    order: 8,
    isActive: true,
    pageContent: {
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
  }
];

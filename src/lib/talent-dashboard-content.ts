/**
 * Editable content for the homepage Map Intelligence section (TalentDashboard).
 *
 * Extracted verbatim from the component, which previously ignored its CMS block
 * entirely. These values are the defaults and the fallback, so the section
 * renders exactly as it does today when the block is empty.
 *
 * Progress-bar and donut widths remain design in the component: they are
 * Tailwind arbitrary values compiled at build time and cannot be driven from
 * data without changing the rendered markup.
 */
export const talentDashboardDefaults = {
  eyebrow: "Data & Insights",
  headingLead: "Nepal Talent",
  headingHighlight: "Intelligence.",
  description:
    "Live aggregated overview of workforce demographics, readiness, and sourcing potential across the nation.",
  map: {
    titleLead: "National ",
    titleHighlight: "Sourcing Hubs",
    subtitle: "Interactive deployment tracking across 7 provinces.",
    liveBadge: "Live Data",
    tooltipActiveTalent: "Active Talent",
    tooltipTopSector: "Top Sector",
    provinces: [
      { district: "Kathmandu", value: 1200000, activeTalent: "1.2M", topSector: "Hospitality", hub: "Bagmati Hub" },
      { district: "Rupandehi", value: 850000, activeTalent: "850K", topSector: "Construction", hub: "Lumbini Hub" },
      { district: "Morang", value: 620000, activeTalent: "620K", topSector: "Manufacturing", hub: "Koshi Hub" },
    ],
  },
  pool: {
    heading: "Global Deployment",
    domesticLabel: "Available Domestic Pool",
    domesticTarget: 3200000,
    deployedLabel: "Successfully Deployed",
    deployedTarget: 2800000,
  },
  readiness: {
    heading: "Readiness & Compliance",
    items: [
      { label: "Medical Clearance", value: "98%" },
      { label: "Pre-departure Training", value: "100%" },
      { label: "Background Verification", value: "95%" },
    ],
  },
  demographics: {
    heading: "Demographics",
    donutValue: "68%",
    coreLabel: "Core Demographic",
    coreValue: "Age Group (18-35)",
    literacyLabel: "Literacy Rate",
    literacyValue: "82%",
    literacySuffix: "Workforce",
  },
  sectors: {
    heading: "Primary Sectors",
    items: [
      { name: "Hospitality", value: "35%", desc: "Hotels & Tourism" },
      { name: "Construction", value: "28%", desc: "Infrastructure" },
      { name: "Healthcare", value: "15%", desc: "Nursing & Care" },
      { name: "Security", value: "12%", desc: "Guards & Safety" },
    ],
  },
};

export type TalentDashboardContent = typeof talentDashboardDefaults;

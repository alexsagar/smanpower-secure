import { PrismaClient, StoryType, ContentStatus } from "@prisma/client";
import { seedPermissions } from "../src/scripts/seed-permissions";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await seedPermissions(prisma);

  // ── Admin User ────────────────────────────────────
  // Removed hardcoded admin user creation.
  // Use `npm run admin:set-super-admin` to bootstrap the admin account securely.

  // ── Industries ────────────────────────────────────
  const industries = [
    { name: "Security Services", slug: "security-services", nameNe: "सुरक्षा सेवाहरू", order: 1 },
    { name: "Construction & Technical Trades", slug: "construction-and-technical-trades", nameNe: "निर्माण र प्राविधिक व्यापार", order: 2 },
    { name: "Hospitality & Hotels", slug: "hospitality-and-hotels", nameNe: "आतिथ्य र होटेलहरू", order: 3 },
    { name: "Facility Management", slug: "facility-management", nameNe: "सुविधा व्यवस्थापन", order: 4 },
    { name: "Aviation & Ground Handling", slug: "aviation-and-ground-handling", nameNe: "उड्डयन र ग्राउन्ड ह्यान्डलिङ", order: 5 },
    { name: "Manufacturing", slug: "manufacturing", nameNe: "उत्पादन", order: 6 },
    { name: "Healthcare Support", slug: "healthcare-support", nameNe: "स्वास्थ्य सेवा सहयोग", order: 7 },
    { name: "Logistics & Transport", slug: "logistics-and-transport", nameNe: "लजिस्टिक्स र यातायात", order: 8 },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: { name: industry.name, nameNe: industry.nameNe, order: industry.order },
      create: industry,
    });
  }
  console.log("  ✓ Industries created");

  // ── Countries ─────────────────────────────────────
  const countries = [
    { name: "Qatar", code: "QA", nameNe: "कतार" },
    { name: "United Arab Emirates", code: "AE", nameNe: "संयुक्त अरब इमिरेट्स" },
    { name: "Saudi Arabia", code: "SA", nameNe: "साउदी अरब" },
    { name: "Kuwait", code: "KW", nameNe: "कुवेत" },
    { name: "Bahrain", code: "BH", nameNe: "बहराइन" },
    { name: "Oman", code: "OM", nameNe: "ओमान" },
    { name: "Malaysia", code: "MY", nameNe: "मलेसिया" },
    { name: "Japan", code: "JP", nameNe: "जापान" },
    { name: "South Korea", code: "KR", nameNe: "दक्षिण कोरिया" },
    { name: "Poland", code: "PL", nameNe: "पोल्याण्ड" },
    { name: "Romania", code: "RO", nameNe: "रोमानिया" },
    { name: "Croatia", code: "HR", nameNe: "क्रोएशिया" },
    { name: "Portugal", code: "PT", nameNe: "पोर्चुगल" },
    { name: "Malta", code: "MT", nameNe: "माल्टा" },
    { name: "Cyprus", code: "CY", nameNe: "साइप्रस" },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { name: country.name, nameNe: country.nameNe },
      create: country,
    });
  }
  console.log("  ✓ Countries created");

  // ── Article Categories ────────────────────────────
  const categories = [
    { name: "Ethical Recruitment Guides", slug: "ethical-recruitment-guides", nameNe: "नैतिक भर्ना गाइडहरू", order: 1 },
    { name: "Employer Resources", slug: "employer-resources", nameNe: "रोजगारदाता स्रोतहरू", order: 2 },
    { name: "Candidate Safety Guides", slug: "candidate-safety-guides", nameNe: "उम्मेदवार सुरक्षा गाइडहरू", order: 3 },
    { name: "Nepal Workforce Insights", slug: "nepal-workforce-insights", nameNe: "नेपाल जनशक्ति अन्तर्दृष्टि", order: 4 },
    { name: "Training & Skills", slug: "training-and-skills", nameNe: "तालिम र सीपहरू", order: 5 },
    { name: "Company News", slug: "company-news", nameNe: "कम्पनी समाचार", order: 6 },
  ];

  for (const cat of categories) {
    await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameNe: cat.nameNe, order: cat.order },
      create: cat,
    });
  }
  console.log("  ✓ Article categories created");

  // ── Permissions ───────────────────────────────────
  // Canonical permissions, roles and RolePermission links are created by
  // seedPermissions() (invoked at the top of main()), sourced from
  // ROLE_PERMISSIONS / ALL_PERMISSIONS. The former generic "<module>.<action>"
  // CRUD matrix was removed because it created permissions that are not part of
  // the application's real vocabulary (ALL_PERMISSIONS), which the RBAC audit
  // now flags as orphans. Use `npm run admin:rbac-sync` to prune any left over
  // in an existing database.

  // ── Success Stories ───────────────────────────────
  const successStories = [
    {
      title: "Candidate Journey",
      slug: "candidate-journey-1",
      personName: "Rajendra Thapa",
      showPersonName: true,
      summary: "Heavy Equipment Operator — Doha, Qatar",
      content: "Seven Seas didn't just find me a job; they trained me. The trade test centre prepared me for the exact machinery I use today in Doha. Best of all, I didn't pay a single rupee in recruitment fees.",
      storyType: StoryType.CANDIDATE,
      status: ContentStatus.PUBLISHED,
      isFeatured: true
    },
    {
      title: "Employer Partnership",
      slug: "employer-partnership-1",
      personName: "Al-Safwa Logistics",
      showPersonName: true,
      summary: "Fleet Expansion Project — Dubai, UAE",
      content: "We needed 150 certified drivers within a month. Seven Seas mobilized their network, conducted rigorous driving tests at their facility, and delivered a fully compliant workforce ahead of schedule.",
      storyType: StoryType.EMPLOYER,
      status: ContentStatus.PUBLISHED,
      isFeatured: true
    },
    {
      title: "Candidate Journey",
      slug: "candidate-journey-2",
      personName: "Sunita Rai",
      showPersonName: true,
      summary: "Hospitality Supervisor — Kuwait City",
      content: "The pre-departure orientation gave me the confidence I needed. I understood the culture, my legal rights, and exactly what to expect before I even boarded the plane. Now, I lead a team of 12.",
      storyType: StoryType.CANDIDATE,
      status: ContentStatus.PUBLISHED,
      isFeatured: true
    }
  ];

  for (const story of successStories) {
    await prisma.successStory.upsert({
      where: { slug: story.slug },
      update: {},
      create: story,
    });
  }
  console.log("  ✓ Success Stories created");

  // ── Training Facilities ───────────────────────────
  const facilities = [
    { name: "Our Training Centres", slug: "training-centres", description: "State of the art preparation", isActive: true },
    { name: "Trade Test Centre", slug: "trade-test-centre", description: "Validating excellence", isActive: true },
    { name: "Candidate Orientation", slug: "orientation", description: "Beyond the technical", isActive: true },
    { name: "Language Preparation", slug: "language", description: "Breaking barriers", isActive: true },
    { name: "Facility Gallery", slug: "facility-gallery", description: "See for yourself", isActive: true }
  ];

  for (const facility of facilities) {
    await prisma.trainingFacility.upsert({
      where: { slug: facility.slug },
      update: {},
      create: facility,
    });
  }
  console.log("  ✓ Training Facilities created");

  // ── Compliance Documents ──────────────────────────
  const complianceDocs = [
    { title: "Recruitment Licences", documentType: "licence", isPublic: true, isVerified: true, order: 1 },
    { title: "Global Certifications", documentType: "certificate", isPublic: true, isVerified: true, order: 2 },
    { title: "Compliance Documents", documentType: "policy", isPublic: true, isVerified: true, order: 3 },
    { title: "Ethical Policies", documentType: "policy", isPublic: true, isVerified: true, order: 4 },
    { title: "Verified Partnerships", documentType: "certificate", isPublic: true, isVerified: true, order: 5 },
    { title: "Grievance Support", documentType: "policy", isPublic: true, isVerified: true, order: 6 }
  ];

  for (const doc of complianceDocs) {
    // Generate a slug-like string for matching (since there's no unique field besides ID, we will just create them if DB is empty)
    // Or we can use title and documentType. But we don't have a unique constraint on title. 
    // Just create them if they don't exist.
    const exists = await prisma.complianceDocument.findFirst({ where: { title: doc.title } });
    if (!exists) {
      await prisma.complianceDocument.create({ data: doc });
    }
  }
  console.log("  ✓ Compliance Documents created");

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

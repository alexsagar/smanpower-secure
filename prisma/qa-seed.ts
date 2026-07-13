import { PrismaClient } from '@prisma/client';
import { seedPermissions } from '../src/scripts/seed-permissions';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding QA Test accounts...");

  await seedPermissions(prisma);

  const passwordHash = await bcrypt.hash("QaTestPassword2026!", 10);

  const roles = [
    { name: "super_admin", email: "qa-super-admin@local.test" },
    { name: "editor", email: "qa-executive-admin@local.test" },
    { name: "content_manager", email: "qa-content-manager@local.test" },
    { name: "recruitment_manager", email: "qa-recruitment-manager@local.test" },
    { name: "compliance_manager", email: "qa-compliance-manager@local.test" },
    { name: "training_manager", email: "qa-training-manager@local.test" },
    { name: "hr_manager", email: "qa-hr-manager@local.test" },
    { name: "analyst", email: "qa-analyst@local.test" },
    { name: "viewer", email: "qa-viewer@local.test" }
  ];

  for (const roleDef of roles) {
    const role = await prisma.role.findUnique({ where: { name: roleDef.name } });
    if (!role) {
      console.warn(`Role ${roleDef.name} not found. Skipping QA user creation for this role.`);
      continue;
    }

    await prisma.user.upsert({
      where: { email: roleDef.email },
      update: {
        passwordHash: passwordHash,
        role: {
          connect: { id: role.id }
        },
        isActive: true,
        emailVerified: new Date()
      },
      create: {
        email: roleDef.email,
        name: `QA ${roleDef.name.replace("_", " ")}`,
        passwordHash: passwordHash,
        role: {
          connect: { id: role.id }
        },
        isActive: true,
        emailVerified: new Date()
      }
    });

    console.log(`Upserted QA test user: ${roleDef.email}`);
  }

  // Create a QA Demand
  const qaDemandSlug = "qa-test-demand-2026";
  const existingDemand = await prisma.demand.findUnique({ where: { slug: qaDemandSlug } });
  
  if (!existingDemand) {
    await prisma.demand.create({
      data: {
        title: "QA_TEST_ Demand for Testing",
        slug: qaDemandSlug,
        companyName: "QA Test Employer LLC",
        country: {
          connectOrCreate: {
            where: { code: "QA" },
            create: {
              name: "QA Testland",
              code: "QA"
            }
          }
        },
        status: "PUBLISHED",
        isPublic: true,
        enableApplication: true,
        seoTitle: "QA Test Demand Title",
        metaDescription: "QA Test Meta Description for demand testing",
      }
    });
    console.log("Created QA Test Demand");
  }

  console.log("QA Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

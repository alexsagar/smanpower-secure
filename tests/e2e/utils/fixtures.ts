import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function assertQaEnvironment() {
  if (process.env.QA_MODE !== 'true') {
    throw new Error('Fixture helper must only be run with QA_MODE=true');
  }
  
  if (!process.env.DATABASE_URL?.includes('smanpower_qa')) {
    throw new Error('Fixture helper must only run against smanpower_qa database');
  }
}

export async function setupQaTestDocument() {
  assertQaEnvironment();

  // Clean up previous runs
  await teardownQaTestDocument();

  // Create a Demand and Position to link against
  const country = await prisma.country.findFirst() || await prisma.country.create({
    data: { name: 'E2E_TEST_COUNTRY', code: '+E2E' }
  });

  const demand = await prisma.demand.create({
    data: {
      title: 'E2E_TEST_DEMAND',
      slug: 'e2e-test-demand-' + Date.now(),
      companyName: 'E2E Corp',
      countryId: country.id,
      status: 'PUBLISHED',
      isPublic: true,
      positions: {
        create: {
          title: 'E2E_TEST_POSITION',
          status: 'OPEN',
          totalCount: 1,
          isPublic: true,
          minimumQualification: 'Test',
          requiredExperience: 'Test',
          requiredSkills: 'Test'
        }
      }
    },
    include: { positions: true }
  });

  const profile = await prisma.candidateProfile.create({
    data: {
      fullName: 'E2E Test Applicant',
      email: `e2e_test_${Date.now()}@example.com`,
      phone: '+123456789'
    }
  });

  const app = await prisma.demandApplication.create({
    data: {
      demandId: demand.id,
      positionId: demand.positions[0].id,
      candidateId: profile.id,
      status: 'SUBMITTED'
    }
  });

  const docs = await Promise.all(['SAFE', 'PENDING_SCAN', 'SCANNING', 'REJECTED', 'SCAN_FAILED'].map(async (status) => {
    return prisma.candidateDocument.create({
      data: {
        candidateId: profile.id,
        documentType: 'CV',
        fileName: `e2e_${status.toLowerCase()}_document.pdf`,
        fileUrl: `https://res.cloudinary.com/demo/image/upload/v1234/e2e/e2e_${status.toLowerCase()}_${randomUUID()}.pdf`,
        fileSize: 1024,
        status: status as any
      }
    });
  }));

  const docsMap = docs.reduce((acc, doc) => {
    acc[doc.status] = doc.id;
    return acc;
  }, {} as Record<string, string>);

  return { docsMap, profile, app, demand };
}

export async function teardownQaTestDocument() {
  assertQaEnvironment();

  await prisma.candidateDocument.deleteMany({
    where: { fileName: { startsWith: 'e2e_' } }
  });

  await prisma.demandApplication.deleteMany({
    where: { candidate: { email: { startsWith: 'e2e_test_' } } }
  });

  await prisma.candidateProfile.deleteMany({
    where: { email: { startsWith: 'e2e_test_' } }
  });

  await prisma.demandPosition.deleteMany({
    where: { title: { startsWith: 'E2E_TEST_' } }
  });

  await prisma.demand.deleteMany({
    where: { title: { startsWith: 'E2E_TEST_' } }
  });
}

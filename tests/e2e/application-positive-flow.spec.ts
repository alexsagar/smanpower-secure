import { test, expect, request as playwrightRequest } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import path from "path";

test.describe.configure({ mode: "serial" });

const prisma = new PrismaClient();
const reviewerStorageState = path.join(__dirname, "../../playwright/.auth/reviewer.json");
const contentManagerStorageState = path.join(__dirname, "../../playwright/.auth/content_manager.json");

const pdfBuffer = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
  "utf8"
);

let demandSlug = "";
let demandId = "";
let positionId = "";
let applicationId = "";
let candidateId = "";
let documentId = "";
let candidateName = "";
let cvRequirementId = "";
let certRequirementId = "";

function projectKey(projectName: string) {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function createFixture(projectName: string) {
  const key = projectKey(projectName);
  candidateName = `E2E Positive ${projectName} ${Date.now()}`;
  demandSlug = "security-guards-supervisors-dubai-2026";
  demandId = "demand-1";
  positionId = "pos-1-1";
  cvRequirementId = `qa-e2e-demand-cv-${key}`;
  certRequirementId = `qa-e2e-demand-trade-cert-${key}`;

  const country = await prisma.country.findFirst({
    where: { code: "AE" },
  }) || await prisma.country.create({
    data: { name: "United Arab Emirates", code: "AE" },
  });

  await prisma.demand.upsert({
    where: { id: demandId },
    update: {
      slug: demandSlug,
      title: "Security Guards & Supervisors — Dubai",
      companyName: "Demo Gulf Security Corp",
      countryId: country.id,
      status: "PUBLISHED",
      isPublic: true,
      enableApplication: true,
      feeTransparencyNotice: "Seven Seas Intercontinental does not charge candidates any fee for job placement.",
      candidateSafetyNotice: "Do not make any payment or submit original documents unless instructed through an official Seven Seas Intercontinental communication channel.",
      publishedAt: new Date("2026-07-01T00:00:00Z"),
    },
    create: {
      id: demandId,
      slug: demandSlug,
      title: "Security Guards & Supervisors — Dubai",
      companyName: "Demo Gulf Security Corp",
      countryId: country.id,
      status: "PUBLISHED",
      isPublic: true,
      enableApplication: true,
      feeTransparencyNotice: "Seven Seas Intercontinental does not charge candidates any fee for job placement.",
      candidateSafetyNotice: "Do not make any payment or submit original documents unless instructed through an official Seven Seas Intercontinental communication channel.",
      publishedAt: new Date("2026-07-01T00:00:00Z"),
    },
  });

  await prisma.demandPosition.upsert({
    where: { id: positionId },
    update: {
      demandId,
      title: "Security Guard",
      totalCount: 120,
      minimumQualification: "High School Diploma (SLC/SEE)",
      requiredExperience: "1+ year security experience",
      requiredSkills: "Physical fitness, English communication",
      salaryCurrency: "AED",
      salaryAmount: "2,200",
      nprEquivalent: "~NPR 80,000",
      workHoursPerDay: "8",
      workDaysPerWeek: "6",
      status: "OPEN",
      isPublic: true,
    },
    create: {
      id: positionId,
      demandId,
      displayOrder: 1,
      title: "Security Guard",
      totalCount: 120,
      minimumQualification: "High School Diploma (SLC/SEE)",
      requiredExperience: "1+ year security experience",
      requiredSkills: "Physical fitness, English communication",
      salaryCurrency: "AED",
      salaryAmount: "2,200",
      nprEquivalent: "~NPR 80,000",
      workHoursPerDay: "8",
      workDaysPerWeek: "6",
      status: "OPEN",
      isPublic: true,
    },
  });

  await prisma.applicationDocumentRequirement.upsert({
    where: { id: cvRequirementId },
    update: {
      demandId,
      positionId,
      documentType: "CV",
      required: false,
      maxSizeMb: 5,
      allowedMimeTypes: "application/pdf",
    },
    create: {
      id: cvRequirementId,
      demandId,
      positionId,
      documentType: "CV",
      required: false,
      maxSizeMb: 5,
      allowedMimeTypes: "application/pdf",
    },
  });

  await prisma.applicationDocumentRequirement.upsert({
    where: { id: certRequirementId },
    update: {
      demandId,
      positionId,
      documentType: "TRADE_CERTIFICATE",
      required: false,
      maxSizeMb: 5,
      allowedMimeTypes: "application/pdf,image/jpeg,image/png",
    },
    create: {
      id: certRequirementId,
      demandId,
      positionId,
      documentType: "TRADE_CERTIFICATE",
      required: false,
      maxSizeMb: 5,
      allowedMimeTypes: "application/pdf,image/jpeg,image/png",
    },
  });
}

async function cleanupFixture() {
  if (applicationId) {
    await prisma.auditLog.deleteMany({
      where: { entity: "CandidateDocument", entityId: documentId, action: "PRIVATE_DOCUMENT_VIEWED" },
    });
  }

  await prisma.applicationDocumentRequirement.deleteMany({
    where: { id: { in: [cvRequirementId, certRequirementId].filter(Boolean) } },
  });

  if (candidateId) {
    await prisma.demandApplication.deleteMany({ where: { candidateId } });
    await prisma.candidateDocument.deleteMany({ where: { candidateId } });
    await prisma.candidateProfile.deleteMany({ where: { id: candidateId } });
  }
}

test.beforeAll(async ({}, testInfo) => {
  if (process.env.QA_MODE !== "true" || !process.env.DATABASE_URL?.includes("smanpower_qa")) {
    throw new Error("application-positive-flow.spec.ts must only run in QA_MODE against smanpower_qa");
  }
  if (process.env.PUBLIC_APPLICATIONS_ENABLED !== "true") {
    throw new Error("PUBLIC_APPLICATIONS_ENABLED must be true for the positive application-flow test");
  }
  await cleanupFixture();
  await createFixture(testInfo.project.name);
});

test.afterAll(async () => {
  await cleanupFixture();
  await prisma.$disconnect();
});

test("public application flow saves application, protects documents, and stays noindex", async ({ page, request, browser, baseURL }) => {
  await page.goto(`/demands/${demandSlug}`);

  const applyLink = page.getByRole("link", { name: /apply job/i });
  await expect(applyLink).toBeVisible();
  await expect(applyLink).toHaveAttribute("href", `/demands/${demandSlug}/apply`);

  await applyLink.click();
  await expect(page).toHaveURL(`/demands/${demandSlug}/apply`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { name: /apply for security guards/i })).toBeVisible();

  await page.selectOption('select[name="positionId"]', positionId);
  await page.fill('input[name="fullName"]', candidateName);
  await page.fill('input[name="phone"]', "+9779800001234");
  await page.fill('input[name="email"]', `positive-${Date.now()}@example.com`);
  await page.fill('input[name="dateOfBirth"]', "1995-05-15");
  await page.fill('input[name="provinceDistrict"]', "Bagmati / Kathmandu");
  await page.selectOption('select[name="educationLevel"]', "SLC/SEE");
  await page.fill('input[name="skillCategory"]', "Welder");
  await page.fill('textarea[name="workExperience"]', "3 years overseas fabrication experience.");
  await page.selectOption('select[name="passportStatus"]', "VALID");

  await page.setInputFiles('input[name="cvFile"]', {
    name: "candidate-cv.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
  });

  await page.setInputFiles('input[name="certFile"]', {
    name: "trade-certificate.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
  });

  await page.check('input[name="availableForInterview"]');
  await page.check('input[name="demandDetailsRead"]');
  await page.check('input[name="privacyConsentGiven"]');
  await page.check('input[name="safetyAcknowledgement"]');
  await page.getByRole("button", { name: /submit application/i }).click();

  await expect(
    page.getByRole("heading", { name: /application submitted/i })
  ).toBeVisible({ timeout: 15000 });

  const candidate = await prisma.candidateProfile.findFirstOrThrow({
    where: { fullName: candidateName },
    include: {
      documents: true,
      demandApplications: true,
    },
  });

  candidateId = candidate.id;
  expect(candidate.demandApplications).toHaveLength(1);
  expect(candidate.demandApplications[0].status).toBe("SUBMITTED");
  expect(candidate.demandApplications[0].demandId).toBe(demandId);
  applicationId = candidate.demandApplications[0].id;

  expect(candidate.documents.length).toBeGreaterThan(0);
  const privateDoc = candidate.documents[0];
  documentId = privateDoc.id;
  expect(privateDoc.isPrivate).toBe(true);
  expect(privateDoc.fileUrl).toBeTruthy();
  expect(privateDoc.status).toBe("PENDING_SCAN");

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).not.toContain(`/demands/${demandSlug}/apply`);

  await prisma.candidateDocument.update({
    where: { id: documentId },
    data: { status: "SAFE" },
  });

  const reviewerContext = await browser.newContext({ storageState: reviewerStorageState, baseURL });
  const reviewerPage = await reviewerContext.newPage();

  await reviewerPage.goto("/admin/applications");
  await expect(reviewerPage.getByText(candidateName)).toBeVisible();

  await reviewerPage.locator(`a[href="/admin/applications/${applicationId}"]`).click();
  await expect(reviewerPage).toHaveURL(new RegExp(`/admin/applications/${applicationId}$`));
  await expect(reviewerPage.getByRole("heading", { name: /application details/i })).toBeVisible();
  await expect(reviewerPage.getByText(candidateName)).toBeVisible();

  const preAuditCount = await prisma.auditLog.count({
    where: { entity: "CandidateDocument", action: "PRIVATE_DOCUMENT_VIEWED", entityId: documentId },
  });

  const reviewerRequest = await playwrightRequest.newContext({
    baseURL,
    storageState: reviewerStorageState,
  });
  const reviewerRes = await reviewerRequest.get(`/api/documents/${documentId}/view`, { maxRedirects: 0 });
  expect(reviewerRes.status()).toBe(307);
  expect(reviewerRes.headers()["cache-control"]).toBe("no-store, private");
  expect(reviewerRes.headers()["referrer-policy"]).toBe("no-referrer");

  const postAuditCount = await prisma.auditLog.count({
    where: { entity: "CandidateDocument", action: "PRIVATE_DOCUMENT_VIEWED", entityId: documentId },
  });
  expect(postAuditCount).toBeGreaterThan(preAuditCount);

  const unauthorizedRequest = await playwrightRequest.newContext({
    baseURL,
    storageState: contentManagerStorageState,
  });
  const unauthorizedRes = await unauthorizedRequest.get(`/api/documents/${documentId}/view`, { maxRedirects: 0 });
  expect(unauthorizedRes.status()).toBe(403);

  await reviewerRequest.dispose();
  await unauthorizedRequest.dispose();
  await reviewerContext.close();
});

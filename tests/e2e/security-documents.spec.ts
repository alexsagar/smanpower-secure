import { test, expect } from '@playwright/test';
import { setupQaTestDocument, teardownQaTestDocument } from './utils/fixtures';
import path from 'path';
import { PrismaClient } from '@prisma/client';

test.describe.configure({ mode: 'serial' });

let docsMap: Record<string, string> = {};
const prisma = new PrismaClient();
let fixtureError: Error | null = null;

test.beforeAll(async () => {
  try {
    const setup = await setupQaTestDocument();
    docsMap = setup.docsMap;
  } catch (err: any) {
    fixtureError = err;
    console.error('QA fixture setup failed:', err);
  }
});

test.afterAll(async () => {
  try {
    await teardownQaTestDocument();
  } catch (err) {
    console.error('QA fixture teardown error:', err);
  }
});

test.describe('Document Access Security', () => {

  test('Unauthenticated user receives 401/redirect', async ({ request }) => {
    if (fixtureError) throw new Error(`Fixture setup failed: ${fixtureError.message}`);
    expect(docsMap['SAFE'], 'SAFE doc fixture must exist').toBeTruthy();
    const res = await request.get(`/api/documents/${docsMap['SAFE']}/view`, { maxRedirects: 0 });
    expect(res.status()).not.toBe(307);
    expect(res.status()).not.toBe(200);
  });

  test.describe('Role: QA Content Manager', () => {
    test.use({ storageState: path.join(__dirname, '../../playwright/.auth/content_manager.json') });
    test('Must receive 403', async ({ request }) => {
      const res = await request.get(`/api/documents/${docsMap['SAFE']}/view`, { maxRedirects: 0 });
      expect(res.status()).toBe(403);
    });
  });

  test.describe('Role: QA Viewer', () => {
    test.use({ storageState: path.join(__dirname, '../../playwright/.auth/viewer.json') });
    test('Must receive 403', async ({ request }) => {
      const res = await request.get(`/api/documents/${docsMap['SAFE']}/view`, { maxRedirects: 0 });
      expect(res.status()).toBe(403);
    });
  });

  test.describe('Role: QA Recruitment Reviewer', () => {
    test.use({ storageState: path.join(__dirname, '../../playwright/.auth/reviewer.json') });
    
    test('Allowed access to SAFE document with security headers and audit log', async ({ request }) => {
      const preAuditCount = await prisma.auditLog.count({
        where: { entity: "CandidateDocument", action: "VIEW_DOCUMENT", entityId: docsMap['SAFE'] }
      });

      const res = await request.get(`/api/documents/${docsMap['SAFE']}/view`, { maxRedirects: 0 });
      
      expect(res.status()).toBe(307);
      const location = res.headers()['location'];
      expect(location).toBeDefined();
      expect(location?.includes('cloudinary.com')).toBeTruthy();
      
      expect(res.headers()['cache-control']).toBe('no-store');
      expect(res.headers()['referrer-policy']).toBe('no-referrer');

      // Assert Audit Log created
      const postAuditCount = await prisma.auditLog.count({
        where: { entity: "CandidateDocument", action: "VIEW_DOCUMENT", entityId: docsMap['SAFE'] }
      });
      expect(postAuditCount).toBeGreaterThan(preAuditCount);
    });

    for (const status of ['PENDING_SCAN', 'SCANNING', 'REJECTED', 'SCAN_FAILED']) {
      test(`Denied access to ${status} document safely`, async ({ request }) => {
        const preAuditCount = await prisma.auditLog.count({
          where: { entity: "CandidateDocument", action: "VIEW_DOCUMENT", entityId: docsMap[status] }
        });

        const res = await request.get(`/api/documents/${docsMap[status]}/view`, { maxRedirects: 0 });
        expect(res.status()).toBe(403);

        const postAuditCount = await prisma.auditLog.count({
          where: { entity: "CandidateDocument", action: "VIEW_DOCUMENT", entityId: docsMap[status] }
        });
        expect(postAuditCount).toBe(preAuditCount); // No false audit
      });
    }

    test('Arbitrary nonexistent document ID returns safe 404', async ({ request }) => {
      const res = await request.get(`/api/documents/nonexistent-id-12345/view`, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
    });
  });
});

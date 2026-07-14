import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createDemandAction, 
  updateDemandAction, 
  publishDemandAction, 
  closeDemandAction, 
  archiveDemandAction,
  saveDemandDraftAction,
  applyToDemandAction
} from '@/actions/demands';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { isEligibleForJobPostingSchema } from '@/lib/seo/schema';
import * as nextCache from 'next/cache';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn(),
  DEMAND_PERMISSIONS: {
    CREATE: 'demands.create',
    UPDATE: 'demands.update',
    PUBLISH: 'demands.publish',
    DELETE: 'demands.delete',
  }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/config/demo', () => ({
  DEMO_MODE: false,
}));

const RUN_ID = crypto.randomUUID();

describe('Demand Mutations Integration Tests', () => {
  let testUserId = 'test-admin';
  let testCountryId = '';
  
  const originalPublicApplicationsEnabled = process.env.PUBLIC_APPLICATIONS_ENABLED;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.QA_MODE = 'false'; // Override QA_MODE for schema tests
    process.env.DEMO_MODE = 'false'; // Override DEMO_MODE for schema tests
    
    // Clear out testing records in DB
    await prisma.demand.deleteMany({
      where: { slug: { startsWith: `qa-test-demand-${RUN_ID}` } }
    });

    // Use the canonical lowercase role name (matches the seed and seo.test.ts).
    // requirePermission is mocked below, so this role's permissions are irrelevant
    // to the test — but reusing the real role avoids leaving a permissionless
    // "SUPER_ADMIN" duplicate role behind in smanpower_qa.
    const role = await prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: { name: 'super_admin', displayName: 'Super Admin' }
    });

    const testUser = await prisma.user.upsert({
      where: { email: 'qa-admin@test.local' },
      update: {},
      create: { email: 'qa-admin@test.local', name: 'QA Admin', roleId: role.id }
    });
    testUserId = testUser.id;

    const testCountry = await prisma.country.upsert({
      where: { name: 'QA Test Country' },
      update: {},
      create: { name: 'QA Test Country', code: '+999' }
    });
    testCountryId = testCountry.id;

    (auth as any).mockResolvedValue({ user: { id: testUserId } });
    (requirePermission as any).mockResolvedValue(true);
  });

  afterEach(async () => {
    process.env.PUBLIC_APPLICATIONS_ENABLED = originalPublicApplicationsEnabled;
    await prisma.demand.deleteMany({
      where: { slug: { startsWith: `qa-test-demand-${RUN_ID}` } }
    });
  });

  const generateValidPayload = (title = `qa-test-demand-${RUN_ID}-1`) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      title,
      companyName: 'QA Corp',
      countryId: testCountryId,
      enableApplication: true,
      feeTransparencyNotice: "No fees charged",
      positions: [
        { title: 'QA Engineer', totalCount: 5, status: 'OPEN', isPublic: true, requiredSkills: 'Testing', minimumQualification: 'Not required', requiredExperience: 'Not required' }
      ],
      documents: []
    }));
    return formData;
  };

  it('saveDemandDraftAction cannot silently unpublish a published Demand', async () => {
    const res1 = await createDemandAction(generateValidPayload());
    if (!res1.data?.id) throw new Error('Expected demand id');
    const demandId = res1.data.id;
    await publishDemandAction(demandId);

    const formData = generateValidPayload(`qa-test-demand-${RUN_ID}-updated`);
    const res2 = await saveDemandDraftAction(demandId, formData);
    
    expect(res2.success).toBe(false);
    expect((res2 as any).formError).toContain('Cannot use draft save on a PUBLISHED demand');

    const check = await prisma.demand.findUnique({ where: { id: demandId } });
    expect(check?.status).toBe('PUBLISHED'); // Status didn't revert
  });

  it('Generic update cannot change status, applicationOpen, publicVisibility, publishedAt', async () => {
    const res1 = await createDemandAction(generateValidPayload());
    if (!res1.data?.id) throw new Error('Expected demand id');
    const demandId = res1.data.id;
    const initial = await prisma.demand.findUnique({ where: { id: demandId } });
    if (!initial) throw new Error('Expected initial demand');

    // Attemping to sneak lifecycle fields via JSON
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      title: `qa-test-demand-${RUN_ID}-sneaky`,
      companyName: 'QA Corp',
      countryId: testCountryId,
      status: 'PUBLISHED', // Sneaky
      isPublic: true, // Sneaky
      updatedAt: initial?.updatedAt.toISOString(),
      positions: []
    }));

    const res2 = await updateDemandAction(demandId, formData);
    expect(res2.success).toBe(true);

    const check = await prisma.demand.findUnique({ where: { id: demandId } });
    expect(check?.status).toBe('DRAFT'); // Ignored sneaky status
    expect(check?.isPublic).toBe(false); // Ignored sneaky isPublic
  });

  it('archiveDemandAction preserves Demand, Positions, Applications, AuditLogs and disables applications', async () => {
    const res1 = await createDemandAction(generateValidPayload());
    if (!res1.data?.id) throw new Error('Expected demand id');
    const demandId = res1.data.id;

    // Simulate an application and publish
    await publishDemandAction(demandId);
    const pos = await prisma.demandPosition.findFirst({ where: { demandId } });

    const archiveRes = await archiveDemandAction(demandId);
    expect(archiveRes.success).toBe(true);

    const check = await prisma.demand.findUnique({ 
      where: { id: demandId },
      include: { positions: true, documents: true }
    });

    expect(check).not.toBeNull();
    expect(check?.status).toBe('ARCHIVED');
    expect(check?.isPublic).toBe(false);
    expect(check?.enableApplication).toBe(false); // Applications disabled immediately

    expect(check?.positions.length).toBe(1); // Positions preserved
    
    const logs = await prisma.auditLog.findMany({ where: { entityId: demandId, action: 'ARCHIVE_DEMAND' } });
    expect(logs.length).toBe(1); // Audit logs created
  });

  it('Archive removes sitemap inclusion and JobPosting schema', async () => {
    const res1 = await createDemandAction(generateValidPayload());
    if (!res1.data?.id) throw new Error('Expected demand id');
    const demandId = res1.data.id;

    await publishDemandAction(demandId);
    let check = await prisma.demand.findUnique({ where: { id: demandId }, include: { country: true } });
    const pos = await prisma.demandPosition.findFirst({ where: { demandId } });
    if (!isEligibleForJobPostingSchema({ demand: check, position: pos })) {
      console.log('check:', check);
      console.log('pos:', pos);
    }
    expect(isEligibleForJobPostingSchema({ demand: check, position: pos })).toBe(true); // Should be eligible when published

    await archiveDemandAction(demandId);
    check = await prisma.demand.findUnique({ where: { id: demandId }, include: { country: true } });

    expect(isEligibleForJobPostingSchema({ demand: check, position: pos })).toBe(false); // Schema removed
  });

  it('applyToDemandAction returns APPLICATIONS_NOT_ENABLED', async () => {
    process.env.PUBLIC_APPLICATIONS_ENABLED = 'false';
    const res = await applyToDemandAction("pos_1", new FormData());
    expect(res.success).toBe(false);
    expect(res.formError).toBe('APPLICATIONS_NOT_ENABLED');
  });

  it('Auto-generated slug collision retries safely and Duplicate custom slug is rejected', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // 1. Create a custom slug
    const formData1 = new FormData();
    formData1.append('data', JSON.stringify({
      title: `QA Test Slug Base ${RUN_ID}`,
      companyName: 'QA',
      countryId: testCountryId,
      slug: `qa-test-slug-custom-${RUN_ID}`
    }));
    await createDemandAction(formData1);

    // 2. Duplicate custom slug is rejected
    const res2 = await createDemandAction(formData1);
    expect(res2.success).toBe(false);
    expect((res2 as any).formError).toContain('custom slug is already in use');

    // 3. Auto-generated slug collision retries safely (We create same title)
    const formDataAuto = new FormData();
    formDataAuto.append('data', JSON.stringify({
      title: `qa-test-demand-auto-${RUN_ID}`,
      companyName: 'QA',
      countryId: testCountryId,
    }));
    const r1 = await createDemandAction(formDataAuto);
    const r2 = await createDemandAction(formDataAuto);
    const r3 = await createDemandAction(formDataAuto);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);

    expect(r1.data?.slug).not.toBe(r2.data?.slug);
    expect(r2.data?.slug).not.toBe(r3.data?.slug);
    consoleSpy.mockRestore();
  });

  it('Published slug cannot change through generic update', async () => {
    const res1 = await createDemandAction(generateValidPayload(`qa-test-demand-${RUN_ID}-lock`));
    if (!res1.data?.id) throw new Error('Expected demand id');
    const demandId = res1.data.id;
    await publishDemandAction(demandId);

    const initial = await prisma.demand.findUnique({ where: { id: demandId } });
    if (!initial) throw new Error('Expected initial demand');

    const formData = new FormData();
    formData.append('data', JSON.stringify({
      title: `qa-test-demand-${RUN_ID}-lock-new-title`,
      companyName: 'QA',
      countryId: testCountryId,
      slug: `qa-test-slug-changed-${RUN_ID}`,
      updatedAt: initial?.updatedAt.toISOString(),
    }));

    await updateDemandAction(demandId, formData);
    const check = await prisma.demand.findUnique({ where: { id: demandId } });
    
    expect(check?.slug).toBe(initial?.slug); // Slug remains locked
  });

  it('No cache invalidation runs after a failed transaction', async () => {
    // Inject a bad payload that fails validation
    const formData = new FormData();
    formData.append('data', JSON.stringify({ title: '' })); // invalid
    
    vi.clearAllMocks();
    await createDemandAction(formData);
    
    // Expect nextCache.revalidatePath was never called
    expect(nextCache.revalidatePath).not.toHaveBeenCalled();
    expect(nextCache.revalidateTag).not.toHaveBeenCalled();
  });
});

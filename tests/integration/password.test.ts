import { describe, it, expect, beforeEach, vi } from 'vitest';
import { changePasswordAction } from '@/actions/profile';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireCurrentAdminUser } from '@/lib/permissions';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map([['x-forwarded-for', '127.0.0.1']])),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock('@/lib/permissions', () => ({
  requireCurrentAdminUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    success: true,
  }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

let mockUser: any;
let oldPasswordHash: string;

describe('Authenticated Change Password Tests', () => {

  beforeEach(async () => {
    await prisma.auditLog.deleteMany({ where: { action: { in: ['update_password', 'PASSWORD_CHANGE', 'PASSWORD_CHANGED'] } } });
    await prisma.adminSession.deleteMany({ where: { user: { email: 'admin_pwd@test.com' } } });
    await prisma.user.deleteMany({ where: { email: 'admin_pwd@test.com' } });
    // role is upserted

    const role = await prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: { name: 'super_admin', displayName: 'Super Admin', description: 'desc' }
    });

    oldPasswordHash = await bcrypt.hash('oldPassword123', 10);

    mockUser = await prisma.user.create({
      data: {
        email: 'admin_pwd@test.com',
        name: 'Test Admin',
        passwordHash: oldPasswordHash,
        roleId: role.id,
        accountStatus: 'ACTIVE',
        isActive: true,
        sessionVersion: 1,
        mfaEnabled: false
      },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    (requireCurrentAdminUser as any).mockResolvedValue(mockUser);
  });

  it('1. Valid current password allows password change', async () => {
    const fd = new FormData();
    fd.append('currentPassword', 'oldPassword123');
    fd.append('newPassword', 'newPassword456');
    fd.append('confirmPassword', 'newPassword456');
    
    // Create an active session to test revocation
    await prisma.adminSession.create({
      data: {
        sessionIdHash: 'dummy',
        userId: mockUser.id,
        sessionVersionAtIssue: 1,
        idleExpiresAt: new Date(Date.now() + 100000),
        absoluteExpiresAt: new Date(Date.now() + 100000),
      }
    });

    await changePasswordAction({ success: false }, fd);
    
    const updatedUser = await prisma.user.findUnique({ where: { id: mockUser.id } });
    expect(updatedUser?.passwordHash).not.toBe(oldPasswordHash);
    
    // 13. sessionVersion increments
    expect(updatedUser?.sessionVersion).toBe(2);
    
    // 14. All AdminSession records are revoked
    // 15. Revocation uses PASSWORD_CHANGE
    const session = await prisma.adminSession.findFirst({ where: { userId: mockUser.id } });
    expect(session?.revokedAt).not.toBeNull();
    expect(session?.revokedReason).toBe('PASSWORD_CHANGE');
    
    // 16. A privacy-safe audit record is created
    // 17. Audit records contain no password or hash
    const audits = await prisma.auditLog.findMany();
    expect(audits.length).toBeGreaterThan(0);
    expect(JSON.stringify(audits)).not.toContain('oldPassword');
    expect(JSON.stringify(audits)).not.toContain('newPassword');
  });

  it('2. Incorrect current password is rejected', async () => {
    const fd = new FormData();
    fd.append('currentPassword', 'wrongPassword');
    fd.append('newPassword', 'newPassword456');
    fd.append('confirmPassword', 'newPassword456');
    
    const res = await changePasswordAction({ success: false }, fd);
    expect(res.success).toBe(false);
  });
  
  it('4. Confirmation mismatch is rejected', async () => {
    const fd = new FormData();
    fd.append('currentPassword', 'oldPassword123');
    fd.append('newPassword', 'newPassword456');
    fd.append('confirmPassword', 'differentPassword');
    
    const res = await changePasswordAction({ success: false }, fd);
    expect(res.success).toBe(false);
  });
});

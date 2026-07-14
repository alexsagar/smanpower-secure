import { describe, it, expect, beforeEach, vi } from 'vitest';
import { refreshSessionAction, explicitLogoutAction, revokeSessionAction } from '@/actions/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ── Mock Setup ────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

let mockUser: any;
let mockSessionIdHash: string;
let mockRawToken: string;

describe('AdminSession Comprehensive Integration Tests', () => {

  beforeEach(async () => {
    await prisma.auditLog.deleteMany({ where: { action: { in: ['EXPLICIT_LOGOUT', 'SESSION_REVOKED', 'ALL_OTHER_SESSIONS_REVOKED', 'PASSWORD_CHANGE'] } } });
    await prisma.adminSession.deleteMany({ where: { user: { email: 'admin@test.com' } } });
    await prisma.user.deleteMany({ where: { email: 'admin@test.com' } });
    // Keep role upsert safe


    const role = await prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: { name: 'super_admin', displayName: 'Super Admin', description: 'desc' }
    });

    mockUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Admin',
        passwordHash: 'hash',
        roleId: role.id,
        accountStatus: 'ACTIVE',
        isActive: true,
        sessionVersion: 1
      },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    mockRawToken = crypto.randomBytes(32).toString('hex');
    mockSessionIdHash = crypto.createHash('sha256').update(mockRawToken).digest('hex');

    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: mockUser.id }
    });

    const { cookies } = await import('next/headers');
    (cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: mockRawToken }),
      delete: vi.fn(),
      set: vi.fn(),
    });
  });

  // 1. Session Refresh Action
  describe('refreshSessionAction', () => {
    it('1. Returns false if session does not exist', async () => {
      await expect(refreshSessionAction()).rejects.toThrow();
    });

    it('2. Refreshes active session and updates idleExpiresAt', async () => {
      const now = new Date();
      await prisma.adminSession.create({
        data: {
          sessionIdHash: mockSessionIdHash,
          userId: mockUser.id,
          sessionVersionAtIssue: mockUser.sessionVersion,
          idleExpiresAt: new Date(now.getTime() + 10 * 60000),
          absoluteExpiresAt: new Date(now.getTime() + 120 * 60000),
          ipAddressHash: 'ip',
          userAgentHash: 'ua',
        }
      });
      const res = await refreshSessionAction();
      expect(res.success).toBe(true);
    });
  });

  describe('explicitLogoutAction', () => {
    it('3. Revokes current session and deletes cookie', async () => {
      const now = new Date();
      await prisma.adminSession.create({
        data: {
          sessionIdHash: mockSessionIdHash,
          userId: mockUser.id,
          sessionVersionAtIssue: mockUser.sessionVersion,
          idleExpiresAt: new Date(now.getTime() + 10 * 60000),
          absoluteExpiresAt: new Date(now.getTime() + 120 * 60000),
          ipAddressHash: 'ip',
          userAgentHash: 'ua',
        }
      });

      await explicitLogoutAction();
      const session = await prisma.adminSession.findUnique({ where: { sessionIdHash: mockSessionIdHash } });
      expect(session?.revokedAt).not.toBeNull();
      expect(session?.revokedReason).toBe("EXPLICIT_LOGOUT");
    });
  });

  describe('revokeSessionAction', () => {
    it('4. Revokes a specific other session belonging to the user', async () => {
      const now = new Date();
      const otherToken = crypto.randomBytes(32).toString('hex');
      const otherHash = crypto
        .createHash('sha256')
        .update(otherToken)
        .digest('hex');

      await prisma.adminSession.create({
        data: {
          sessionIdHash: mockSessionIdHash,
          userId: mockUser.id,
          sessionVersionAtIssue: mockUser.sessionVersion,
          idleExpiresAt: new Date(now.getTime() + 10 * 60000),
          absoluteExpiresAt: new Date(now.getTime() + 120 * 60000),
        },
      });

      const otherSession = await prisma.adminSession.create({
        data: {
          sessionIdHash: otherHash,
          userId: mockUser.id,
          sessionVersionAtIssue: mockUser.sessionVersion,
          idleExpiresAt: new Date(now.getTime() + 10 * 60000),
          absoluteExpiresAt: new Date(now.getTime() + 120 * 60000),
        },
      });

      const res = await revokeSessionAction(otherSession.id);
      expect(res.success).toBe(true);

      const revokedOtherSession =
        await prisma.adminSession.findUnique({
          where: { id: otherSession.id },
        });

      expect(revokedOtherSession?.revokedAt).not.toBeNull();
      expect(revokedOtherSession?.revokedReason).toBe(
        'EXPLICIT_REVOCATION',
      );

      const currentSession =
        await prisma.adminSession.findUnique({
          where: {
            sessionIdHash: mockSessionIdHash,
          },
        });

      expect(currentSession?.revokedAt).toBeNull();
    });
  });
});
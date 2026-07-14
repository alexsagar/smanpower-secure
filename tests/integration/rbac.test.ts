import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  requirePermission,
  requireCurrentAdminUser,
  hasPermission,
  DEMAND_PERMISSIONS,
} from '@/lib/permissions';
import {
  UnauthenticatedError,
  SessionInvalidError,
  ForbiddenError,
} from '@/lib/auth-errors';

// Mock Auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminSession: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/** Build a fully-populated DB user mock with the given permissions. */
function buildDbUser(
  permissions: string[],
  overrides: Record<string, any> = {}
) {
  return {
    id: 'u1',
    email: 'user@example.com',
    name: 'Test User',
    isActive: true,
    accountStatus: 'ACTIVE',
    sessionVersion: 1,
    role: {
      name: 'content_manager',
      permissions: permissions.map((name) => ({ permission: { name } })),
    },
    ...overrides,
  };
}

function mockSession(user: any = { id: 'u1', sessionVersion: 1 }, extra: any = {}) {
  (auth as any).mockResolvedValue({ user, ...extra });
}

describe('Server-Side RBAC & Authorization (DB-authoritative)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.DEMO_MODE;
    delete process.env.QA_MODE;

    (cookies as any).mockResolvedValue({
      get: vi.fn((name: string) =>
        name === 'admin_session_token'
          ? { value: 'rbac-test-session-token' }
          : undefined
      ),
    });

    (prisma.adminSession.findUnique as any).mockResolvedValue({
      id: 'admin-session-1',
      sessionIdHash: 'mocked-session-hash',
      userId: 'u1',
      sessionVersionAtIssue: 1,
      revokedAt: null,
      idleExpiresAt: new Date(
        Date.now() + 60 * 60 * 1000
      ),
      absoluteExpiresAt: new Date(
        Date.now() + 8 * 60 * 60 * 1000
      ),
    });
  });

  describe('requireCurrentAdminUser', () => {
    it('throws UnauthenticatedError when there is no session', async () => {
      (auth as any).mockResolvedValue(null);
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(UnauthenticatedError);
    });

    it('throws SessionInvalidError (NOT a 500) when the session user is missing from the DB', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('throws SessionInvalidError when the JWT already flagged the session stale', async () => {
      mockSession({ id: 'u1' }, { error: 'SessionInvalidated' });
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('throws SessionInvalidError for a disabled (SUSPENDED) user', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(
        buildDbUser([DEMAND_PERMISSIONS.VIEW], { accountStatus: 'SUSPENDED' })
      );
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('throws SessionInvalidError for a pending (INVITED) user', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(
        buildDbUser([], { accountStatus: 'INVITED', isActive: false })
      );
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('throws SessionInvalidError when sessionVersion no longer matches the DB', async () => {
      mockSession({ id: 'u1', sessionVersion: 1 });
      (prisma.user.findUnique as any).mockResolvedValue(
        buildDbUser([DEMAND_PERMISSIONS.VIEW], { sessionVersion: 2 })
      );
      await expect(requireCurrentAdminUser()).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('returns the DB user for a valid, active session', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([DEMAND_PERMISSIONS.VIEW]));
      const user = await requireCurrentAdminUser();
      expect(user.permissions).toContain(DEMAND_PERMISSIONS.VIEW);
      expect(user.role).toBe('content_manager');
    });
  });

  describe('requirePermission', () => {
    it('throws ForbiddenError when the user lacks the permission', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([DEMAND_PERMISSIONS.VIEW]));
      await expect(requirePermission(DEMAND_PERMISSIONS.DELETE)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('allows access when the user has the permission', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([DEMAND_PERMISSIONS.DELETE]));
      await expect(requirePermission(DEMAND_PERMISSIONS.DELETE)).resolves.toMatchObject({
        id: 'u1',
      });
    });

    it('gives a permissionless real user a 403 — NEVER a demo fallback grant', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([]));
      await expect(requirePermission(DEMAND_PERMISSIONS.VIEW)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('never grants via role NAME — an empty "SUPER_ADMIN" role is still forbidden', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(
        buildDbUser([], { role: { name: 'SUPER_ADMIN', permissions: [] } })
      );
      await expect(requirePermission(DEMAND_PERMISSIONS.VIEW)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('DEMO_MODE=true does NOT grant admin permissions (missing user still invalid)', async () => {
      process.env.DEMO_MODE = 'true';
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(requirePermission(DEMAND_PERMISSIONS.VIEW)).rejects.toBeInstanceOf(SessionInvalidError);
    });

    it('DEMO_MODE=true does NOT grant a permission the DB role lacks', async () => {
      process.env.DEMO_MODE = 'true';
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([DEMAND_PERMISSIONS.VIEW]));
      await expect(requirePermission(DEMAND_PERMISSIONS.DELETE)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('QA_MODE=true does NOT bypass authorization', async () => {
      process.env.QA_MODE = 'true';
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([]));
      await expect(requirePermission(DEMAND_PERMISSIONS.VIEW)).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe('hasPermission', () => {
    it('returns false for unauthenticated users', async () => {
      (auth as any).mockResolvedValue(null);
      expect(await hasPermission(DEMAND_PERMISSIONS.VIEW)).toBe(false);
    });

    it('returns false for a stale (missing DB) user', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(null);
      expect(await hasPermission(DEMAND_PERMISSIONS.VIEW)).toBe(false);
    });

    it('returns false for unauthorized users', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([]));
      expect(await hasPermission(DEMAND_PERMISSIONS.VIEW)).toBe(false);
    });

    it('returns true for authorized users', async () => {
      mockSession();
      (prisma.user.findUnique as any).mockResolvedValue(buildDbUser([DEMAND_PERMISSIONS.VIEW]));
      expect(await hasPermission(DEMAND_PERMISSIONS.VIEW)).toBe(true);
    });
  });
});

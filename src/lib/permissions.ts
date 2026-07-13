// ============================================================
// Permission Helper — Server-Side Authorization
// ============================================================
// Authorization is DATABASE-AUTHORITATIVE. Permissions, roles and
// their links are read exclusively from the Prisma RolePermission
// table. There is NO demo/static/session-based fallback: a session
// that references a missing, disabled or stale user is treated as
// invalid (SessionInvalidError → redirect to login), and an active
// user lacking a permission gets a controlled 403 (ForbiddenError).
// ============================================================

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  UnauthenticatedError,
  SessionInvalidError,
  ForbiddenError,
} from "@/lib/auth-errors";

// Permission constants and the role→permission map live in a
// dependency-free module so the DB seed can share the exact same
// source of truth. Re-exported here to preserve existing imports.
export {
  DEMAND_PERMISSIONS,
  APPLICATION_PERMISSIONS,
  CANDIDATE_DOCUMENT_PERMISSIONS,
  SEO_PERMISSIONS,
  INSIGHT_PERMISSIONS,
  NEWS_PERMISSIONS,
  CAREER_PERMISSIONS,
  SUCCESS_STORY_PERMISSIONS,
  PARTNER_PERMISSIONS,
  MEDIA_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  NAVIGATION_PERMISSIONS,
  USER_PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  // Deprecated alias kept for older tests/scripts — not used at runtime.
  DEMO_ROLE_PERMISSIONS,
} from "@/lib/permissions.constants";

// ── Types ────────────────────────────────────────────────────

export type CurrentAdminUser = {
  id: string;
  email: string;
  name: string;
  /** Role name (e.g. "super_admin"), sourced from the database. */
  role: string;
  /** Flattened permission names from the DB RolePermission table. */
  permissions: string[];
  sessionVersion: number;
};

// ── Helpers ────────────────────────────────────────────────────

async function expireAdminSession(sessionIdHash: string, userId: string, reason: "IDLE_TIMEOUT" | "ABSOLUTE_TIMEOUT") {
  try {
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      const session = await tx.adminSession.findUnique({ where: { sessionIdHash } });
      if (!session || session.userId !== userId || session.revokedAt) return;

      const result = await tx.adminSession.updateMany({
        where: {
          id: session.id,
          revokedAt: null
        },
        data: {
          revokedAt: now,
          revokedReason: reason
        }
      });
      
      if (result.count === 1) {
        await tx.auditLog.create({
          data: {
            action: reason,
            entity: "AdminSession",
            entityId: session.id,
            userId
          }
        });
      }
    });
  } catch (err) {
    logger.error(`[Auth] Failed to record ${reason} audit`, err);
  }
}

// ── Core: resolve & validate the current admin user ──────────

/**
 * Resolve the current admin user from the session and validate it
 * against the database. Never grants access from static/demo data.
 *
 * Throws:
 *   - {@link UnauthenticatedError} when there is no session.
 *   - {@link SessionInvalidError} when the session references a user
 *     that no longer exists, is disabled/suspended, or whose
 *     sessionVersion no longer matches (stale cookie). Callers
 *     (admin layout / error boundary) turn this into a redirect to
 *     the login page — it must NOT surface as a 500.
 */
export async function requireCurrentAdminUser(): Promise<CurrentAdminUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  if ((session as any).error === "SessionInvalidated") {
    logger.warn("[Auth] Stale session flagged by JWT callback — invalidating.");
    throw new SessionInvalidError();
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session_token")?.value;

  if (!rawToken) {
    logger.warn("[Auth] No admin_session_token cookie found.");
    throw new SessionInvalidError();
  }

  const crypto = await import("crypto");
  const sessionIdHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  let adminSession;
  try {
    adminSession = await prisma.adminSession.findUnique({
      where: { sessionIdHash }
    });
  } catch (err) {
    logger.error("[Auth] Database failure finding adminSession", err);
    throw new SessionInvalidError(); // Fail closed on DB error
  }

  if (!adminSession) {
    logger.warn("[Auth] AdminSession not found for hash.");
    throw new SessionInvalidError();
  }
  
  if (adminSession.userId !== session.user.id) {
    logger.warn("[Auth] AdminSession userId mismatch.");
    throw new SessionInvalidError();
  }

  if (adminSession.revokedAt) {
    logger.warn("[Auth] AdminSession is revoked.");
    throw new SessionInvalidError();
  }

  const now = new Date();
  if (adminSession.idleExpiresAt < now) {
    logger.warn("[Auth] AdminSession passed idle timeout.");
    // Fire and forget the audit log creation
    void expireAdminSession(sessionIdHash, adminSession.userId, "IDLE_TIMEOUT");
    throw new SessionInvalidError();
  }

  if (adminSession.absoluteExpiresAt < now) {
    logger.warn("[Auth] AdminSession passed absolute timeout.");
    void expireAdminSession(sessionIdHash, adminSession.userId, "ABSOLUTE_TIMEOUT");
    throw new SessionInvalidError();
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });
  } catch (err) {
    logger.error("[Auth] Database failure finding user", err);
    throw new SessionInvalidError(); // Fail closed
  }

  if (!user) {
    logger.warn(`[Auth] Session references missing user id=${session.user.id}`);
    throw new SessionInvalidError();
  }

  if (!user.isActive || user.accountStatus !== "ACTIVE") {
    logger.warn(`[Auth] User ${user.email} is not active`);
    throw new SessionInvalidError();
  }

  if (adminSession.sessionVersionAtIssue !== user.sessionVersion) {
    logger.warn(`[Auth] sessionVersion mismatch db=${user.sessionVersion}, sessionAtIssue=${adminSession.sessionVersionAtIssue}`);
    throw new SessionInvalidError();
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    permissions: user.role.permissions.map((rp) => rp.permission.name),
    sessionVersion: user.sessionVersion,
  };
}

// ── Permission gate ──────────────────────────────────────────

/**
 * Require a specific permission. Resolves & validates the current
 * admin user (DB-authoritative), then checks the permission against
 * the database RolePermission set.
 *
 * Throws {@link ForbiddenError} when the user is valid but lacks the
 * permission (→ controlled 403, never a demo fallback grant).
 * Propagates {@link UnauthenticatedError} / {@link SessionInvalidError}
 * from {@link requireCurrentAdminUser}.
 */
export async function requirePermission(permission: string): Promise<CurrentAdminUser> {
  const user = await requireCurrentAdminUser();

  if (!user.permissions.includes(permission)) {
    logger.warn(
      `[Permission] Forbidden: ${user.email} missing "${permission}".`
    );
    throw new ForbiddenError(permission);
  }

  logger.debug(`[Permission] Granted: ${user.email} for ${permission}`);
  return user;
}

/**
 * Non-throwing permission check. Returns false for unauthenticated,
 * stale, disabled or unauthorized users. Never grants from demo data.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const user = await requireCurrentAdminUser();
    return user.permissions.includes(permission);
  } catch {
    return false;
  }
}

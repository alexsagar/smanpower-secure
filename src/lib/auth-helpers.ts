import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/constants";

/**
 * Get the current authenticated session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication. Redirects to login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user || (session as any).error === "SessionInvalidated") {
    redirect("/admin/login?error=SessionInvalidated");
  }
  return session;
}

/**
 * Require one of the given roles. Role is read from the DATABASE,
 * never trusted from the session token. Redirects on failure.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { isActive: true, accountStatus: true, role: { select: { name: true } } },
  });

  // Missing / disabled user = stale session → back to login.
  if (!user || !user.isActive || user.accountStatus !== "ACTIVE") {
    redirect("/admin/login?error=session_expired");
  }

  if (!allowedRoles.includes(user.role.name as UserRole)) {
    redirect("/admin?error=forbidden");
  }

  return session;
}

/**
 * Check if the current user has a specific permission (module+action).
 * DATABASE-authoritative: no super_admin session shortcut, no fallback.
 */
export async function hasPermission(
  module: string,
  action: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id || (session as any).error === "SessionInvalidated") {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive || user.accountStatus !== "ACTIVE") return false;

  return user.role.permissions.some(
    (rp) =>
      rp.permission.module === module && rp.permission.action === action
  );
}

/**
 * Log an audit event securely, omitting any sensitive fields.
 */
export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  const session = await auth();
  
  // Scrub sensitive details
  const safeDetails = { ...params.details };
  const sensitiveKeys = ["password", "token", "secret", "mfa", "code", "passport", "medical"];
  
  for (const key of Object.keys(safeDetails)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      safeDetails[key] = "[REDACTED]";
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: safeDetails as object,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

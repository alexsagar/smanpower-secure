"use server";

import { requireCurrentAdminUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";
import { SESSION_CONFIG } from "@/lib/session-config";
import { signOut } from "@/lib/auth";

export async function refreshSessionAction() {
  const user = await requireCurrentAdminUser(); // Validates everything including limits

  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session_token")?.value;
  if (!rawToken) return { success: false };

  const sessionIdHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  
  const now = new Date();
  const newIdle = new Date(now.getTime() + SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000);

  // Read first to calculate finalIdle
  const session = await prisma.adminSession.findUnique({ where: { sessionIdHash } });
  if (!session) return { success: false };

  const finalIdle = newIdle > session.absoluteExpiresAt ? session.absoluteExpiresAt : newIdle;

  const result = await prisma.adminSession.updateMany({
    where: { 
      sessionIdHash,
      userId: user.id,
      revokedAt: null,
      idleExpiresAt: { gt: now },
      absoluteExpiresAt: { gt: now },
      sessionVersionAtIssue: user.sessionVersion // Enforce version match
    },
    data: {
      lastActivityAt: now,
      idleExpiresAt: finalIdle
    }
  });

  if (result.count !== 1) {
    return { success: false };
  }

  return {
    success: true,
    idleExpiresAt: finalIdle.toISOString(),
    absoluteExpiresAt: session.absoluteExpiresAt.toISOString()
  };
}

export async function listSessionsAction() {
  const user = await requireCurrentAdminUser();
  
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session_token")?.value;
  let currentSessionIdHash = "";
  if (rawToken) {
    currentSessionIdHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  const sessions = await prisma.adminSession.findMany({
    where: { 
      userId: user.id,
      revokedAt: null,
      idleExpiresAt: { gt: new Date() },
      absoluteExpiresAt: { gt: new Date() }
    },
    orderBy: { lastActivityAt: 'desc' }
  });

  return sessions.map(s => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    lastActivityAt: s.lastActivityAt.toISOString(),
    idleExpiresAt: s.idleExpiresAt.toISOString(),
    isCurrent: s.sessionIdHash === currentSessionIdHash,
    // Provide a simple label based on user agent (mocked parsing for now)
    deviceLabel: s.userAgentHash ? "Unknown Device" : "Unknown Device"
  }));
}

export async function revokeSessionAction(sessionId: string) {
  const user = await requireCurrentAdminUser();
  
  const result = await prisma.adminSession.updateMany({
    where: {
      id: sessionId,
      userId: user.id,
      revokedAt: null
    },
    data: {
      revokedAt: new Date(),
      revokedReason: "EXPLICIT_REVOCATION"
    }
  });

  if (result.count === 1) {
    await prisma.auditLog.create({
      data: {
        action: "SESSION_REVOKED",
        entity: "AdminSession",
        entityId: sessionId,
        userId: user.id
      }
    });
  }

  return { success: result.count === 1 };
}

export async function revokeAllOtherSessionsAction() {
  const user = await requireCurrentAdminUser();
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session_token")?.value;
  let currentSessionIdHash = "";
  if (rawToken) {
    currentSessionIdHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  const sessionsToRevoke = await prisma.adminSession.findMany({
    where: {
      userId: user.id,
      sessionIdHash: { not: currentSessionIdHash },
      revokedAt: null
    },
    select: { id: true }
  });

  if (sessionsToRevoke.length === 0) return { success: true, count: 0 };

  const ids = sessionsToRevoke.map(s => s.id);

  const result = await prisma.adminSession.updateMany({
    where: { id: { in: ids } },
    data: {
      revokedAt: new Date(),
      revokedReason: "EXPLICIT_REVOCATION"
    }
  });

  if (result.count > 0) {
    await prisma.auditLog.createMany({
      data: ids.map(id => ({
        action: "ALL_OTHER_SESSIONS_REVOKED",
        entity: "AdminSession",
        entityId: id,
        userId: user.id
      }))
    });
  }

  return { success: true, count: result.count };
}

export async function explicitLogoutAction() {
  try {
    const user = await requireCurrentAdminUser();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("admin_session_token")?.value;
    
    if (rawToken) {
      const sessionIdHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      
      const session = await prisma.adminSession.findUnique({ where: { sessionIdHash } });
      if (session && session.userId === user.id && !session.revokedAt) {
        const result = await prisma.adminSession.updateMany({
          where: { id: session.id, revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: "EXPLICIT_LOGOUT" }
        });
        
        if (result.count === 1) {
          await prisma.auditLog.create({
            data: { action: "EXPLICIT_LOGOUT", entity: "AdminSession", entityId: session.id, userId: user.id }
          });
        }
      }
    }
  } catch (e) {
    // Already invalid or DB failed; proceed to local cleanup
  }
  
  const cookieStore = await cookies();
  const { getAppEnv } = await import("@/lib/env");
  cookieStore.delete({
    name: "admin_session_token",
    path: "/",
    httpOnly: true,
    secure: getAppEnv() !== "local",
    sameSite: "strict"
  });
  
  await signOut({ redirect: true, redirectTo: "/admin/login" });
}

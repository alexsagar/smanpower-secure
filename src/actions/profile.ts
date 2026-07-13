"use server";

import { requireCurrentAdminUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers, cookies } from "next/headers";
import speakeasy from "speakeasy";
import { decryptMfaSecret } from "@/lib/crypto-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  totpCode: z.string().optional()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password cannot be the same as the current password",
  path: ["newPassword"],
});

export type ChangePasswordState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function changePasswordAction(
  prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireCurrentAdminUser();
  const rawData = Object.fromEntries(formData.entries());
  const parsed = changePasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword, totpCode } = parsed.data;
  
  // Rate limiting against brute force on current password / MFA
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const rateLimit = await checkRateLimit("change_password", user.id);
  if (!rateLimit.success) {
    return { success: false, message: rateLimit.message };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, passwordHash: true, mfaEnabled: true, mfaSecretEncrypted: true }
  });

  if (!dbUser || !dbUser.passwordHash) {
    return { success: false, message: "The current password or verification code is invalid." };
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: "The current password or verification code is invalid." };
  }

  if (dbUser.mfaEnabled) {
    if (!totpCode || totpCode.trim().length < 6) {
      return { success: false, message: "The current password or verification code is invalid." };
    }

    let isTotpValid = false;
    try {
      if (dbUser.mfaSecretEncrypted) {
        const decRes = decryptMfaSecret(dbUser.mfaSecretEncrypted);
        isTotpValid = speakeasy.totp.verify({ token: totpCode, secret: decRes.secret, encoding: 'base32' });
      }
    } catch {
      isTotpValid = false;
    }

    if (!isTotpValid) {
      return { success: false, message: "The current password or verification code is invalid." };
    }
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Perform transaction
  const success = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: dbUser.id },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 }
      }
    });

    const activeSessions = await tx.adminSession.findMany({
      where: { userId: dbUser.id, revokedAt: null },
      select: { id: true }
    });

    if (activeSessions.length > 0) {
      const ids = activeSessions.map(s => s.id);
      await tx.adminSession.updateMany({
        where: { id: { in: ids } },
        data: { revokedAt: new Date(), revokedReason: "PASSWORD_CHANGE" }
      });
      
      await tx.auditLog.createMany({
        data: ids.map(id => ({
          action: "PASSWORD_CHANGE",
          entity: "AdminSession",
          entityId: id,
          userId: dbUser.id
        }))
      });
    }

    await tx.auditLog.create({
      data: {
        action: "PASSWORD_CHANGED",
        entity: "User",
        entityId: dbUser.id,
        userId: dbUser.id
      }
    });

    return true;
  }).catch(() => false);

  if (!success) {
    return { success: false, message: "An error occurred while changing your password." };
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
  
  await signOut({ redirect: false });
  
  redirect("/admin/login?reason=password-changed");
}

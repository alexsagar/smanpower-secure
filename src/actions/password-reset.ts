"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/services/email.service";
import { verifyTurnstileToken } from "@/services/turnstile.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  "cf-turnstile-response": z.string().optional(),
});

export type ForgotPasswordState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitForgotPassword(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const ipLimit = await checkRateLimit("forgot_pw_ip", ip);
  if (!ipLimit.success) return { success: false, message: ipLimit.message };
  
  const emailLimit = await checkRateLimit("forgot_pw_email", parsed.data.email);
  if (!emailLimit.success) return { success: false, message: emailLimit.message };

  const turnstileResult = await verifyTurnstileToken(parsed.data["cf-turnstile-response"], "forgot_password");
  if (!turnstileResult.success) {
    return { success: false, message: turnstileResult.message || "Security verification failed." };
  }

  const { email } = parsed.data;
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to avoid email enumeration
  if (!user || user.accountStatus !== "ACTIVE") {
    return { success: true, message: "If your email is registered, you will receive a reset link shortly." };
  }

  // Revoke old tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/admin/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset.</p><p>Click here to reset it: <a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
  });

  await prisma.auditLog.create({
    data: {
      action: "PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
      ipAddress: ip,
    },
  });

  return { success: true, message: "If your email is registered, you will receive a reset link shortly." };
}

const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  "cf-turnstile-response": z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitResetPassword(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const turnstileResult = await verifyTurnstileToken(parsed.data["cf-turnstile-response"], "reset_password");
  if (!turnstileResult.success) {
    return { success: false, message: turnstileResult.message || "Security verification failed." };
  }

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };

  const { token, email, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  const ipLimit = await checkRateLimit("reset_pw_ip", ip);
  if (!ipLimit.success) return { success: false, message: ipLimit.message };
  
  const tokenLimit = await checkRateLimit("reset_pw_token", tokenHash);
  if (!tokenLimit.success) return { success: false, message: tokenLimit.message };

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
      user: {
        email: email.toLowerCase(),
      }
    },
    include: { user: true }
  });

  if (!resetRecord || resetRecord.user.accountStatus !== "ACTIVE") {
    return { success: false, message: "Invalid or expired reset link." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const success = await prisma.$transaction(async (tx) => {
    const { count } = await tx.passwordResetToken.updateMany({
      where: { id: resetRecord.id, usedAt: null },
      data: { usedAt: new Date() }
    });
    if (count !== 1) return false;

    await tx.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    });

    const activeSessions = await tx.adminSession.findMany({
      where: { userId: resetRecord.userId, revokedAt: null },
      select: { id: true }
    });

    if (activeSessions.length > 0) {
      const ids = activeSessions.map(s => s.id);
      await tx.adminSession.updateMany({
        where: { id: { in: ids } },
        data: { revokedAt: new Date(), revokedReason: "SECURITY_CHANGE" }
      });
      await tx.auditLog.createMany({
        data: ids.map(id => ({
          action: "SECURITY_CHANGE",
          entity: "AdminSession",
          entityId: id,
          userId: resetRecord.userId
        }))
      });
    }

    await tx.auditLog.create({
      data: {
        action: "PASSWORD_RESET_COMPLETED",
        entity: "User",
        entityId: resetRecord.userId,
      },
    });
    
    return true;
  });

  if (!success) {
    return { success: false, message: "Invalid or expired reset link." };
  }

  return { success: true };
}

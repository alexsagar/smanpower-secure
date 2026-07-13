"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { getAppEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };

  const ipLimit = await checkRateLimit("login_ip", ip);
  if (!ipLimit.success) return { success: false, message: ipLimit.message };
  
  const emailLimit = await checkRateLimit("login_email", parsed.data.email);
  if (!emailLimit.success) return { success: false, message: emailLimit.message };
  
  const combinedLimit = await checkRateLimit("login_combined", `${ip}_${parsed.data.email}`);
  if (!combinedLimit.success) return { success: false, message: combinedLimit.message };

  let mfaRedirectUrl: string | null = null;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const innerError = (error as any).cause?.err || error;
      try {
        const parsedMessage = JSON.parse(innerError.message);
        if (parsedMessage.code === "MFA_REQUIRED") {
          const cookieStore = await cookies();
          cookieStore.set("mfa_challenge_token", parsedMessage.challengeToken, {
            httpOnly: true,
            secure: getAppEnv() !== "local",
            sameSite: "strict",
            maxAge: 5 * 60, // 5 minutes
            path: "/admin/login/mfa"
          });
          mfaRedirectUrl = "/admin/login/mfa";
        }
      } catch (e) {
        // Not a JSON error, proceed to generic error
      }
      
      if (!mfaRedirectUrl) {
        return {
          success: false,
          message: "Invalid email or password.",
        };
      }
    } else {
      throw error;
    }
  }

  if (mfaRedirectUrl) {
    redirect(mfaRedirectUrl);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const { explicitLogoutAction } = await import("@/actions/session");
  await explicitLogoutAction();
}

export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  // Find or create super_admin role
  let role = await prisma.role.findUnique({
    where: { name: "super_admin" },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "super_admin",
        displayName: "Super Admin",
        description: "Full system access",
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      roleId: role.id,
    },
    update: {
      passwordHash,
    },
  });
}

const acceptInviteSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AcceptInviteState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitAcceptInvite(
  prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = acceptInviteSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { token, email, password } = parsed.data;
  const tokenHash = (await import("crypto")).createHash("sha256").update(token).digest("hex");

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const ipLimit = await checkRateLimit("accept_invite_ip", ip);
  if (!ipLimit.success) return { success: false, message: ipLimit.message };
  
  const tokenLimit = await checkRateLimit("accept_invite_token", token);
  if (!tokenLimit.success) return { success: false, message: tokenLimit.message };

  const invitation = await prisma.adminInvitation.findFirst({
    where: {
      email,
      tokenHash,
      usedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  // Generic message for invalid/expired to prevent email enumeration
  if (!invitation) {
    return { success: false, message: "Invalid or expired invitation link." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const success = await prisma.$transaction(async (tx) => {
    const { count } = await tx.adminInvitation.updateMany({
      where: { id: invitation.id, usedAt: null },
      data: { usedAt: new Date() }
    });
    if (count !== 1) return false;

    const user = await tx.user.update({
      where: { email },
      data: {
        passwordHash,
        accountStatus: "ACTIVE",
        isActive: true,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 }
      },
    });

    const activeSessions = await tx.adminSession.findMany({
      where: { userId: user.id, revokedAt: null },
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
          userId: user.id
        }))
      });
    }

    await tx.auditLog.create({
      data: {
        action: "INVITATION_ACCEPTED",
        entity: "AdminInvitation",
        entityId: invitation.id,
      }
    });

    return true;
  });

  if (!success) {
    return { success: false, message: "Invalid or expired invitation link." };
  }

  return { success: true };
}

export type MfaVerifyState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function verifyMfaAction(
  prevState: MfaVerifyState,
  formData: FormData
): Promise<MfaVerifyState> {
  const code = formData.get("code") as string;
  const isRecovery = formData.get("isRecovery") === "true";
  
  if (!code || code.trim().length < 6) {
    return { success: false, message: "Invalid code provided." };
  }
  
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const cookieStore = await cookies();
  const mfaChallengeToken = cookieStore.get("mfa_challenge_token")?.value;
  
  if (!mfaChallengeToken) {
    return { success: false, message: "MFA challenge expired or invalid. Please login again." };
  }
  
  const mfaLimit = await checkRateLimit("mfa_verify", `${ip}_${mfaChallengeToken}`);
  if (!mfaLimit.success) return { success: false, message: mfaLimit.message };
  
  try {
    await signIn("mfa", {
      mfaChallengeToken,
      ...(isRecovery ? { recoveryCode: code } : { mfaCode: code }),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      cookieStore.delete({ name: "mfa_challenge_token", path: "/admin/login/mfa", secure: getAppEnv() !== "local", httpOnly: true, sameSite: "strict" });
      return { success: false, message: "Invalid code or challenge expired." };
    }
    throw error;
  }
  
  cookieStore.delete({ name: "mfa_challenge_token", path: "/admin/login/mfa", secure: getAppEnv() !== "local", httpOnly: true, sameSite: "strict" });
  redirect("/admin");
}

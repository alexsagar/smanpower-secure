"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import QRCode from "qrcode";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

import { encryptMfaSecret, decryptMfaSecret } from "@/lib/crypto-utils";

export type SetupMfaState = {
  success: boolean;
  message?: string;
  qrCodeUrl?: string;
  secretBase32?: string;
};

export async function beginSetupMfaAction(): Promise<SetupMfaState> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, message: "User not found" };

  if (user.mfaEnabled) {
    return { success: false, message: "MFA is already enabled." };
  }

  // Generate new secret
  const secretData = speakeasy.generateSecret({ name: `Seven Seas Admin (${user.email})` });
  const secret = secretData.base32;
  
  const qrCodeUrl = await QRCode.toDataURL(secretData.otpauth_url!);
  
  // Store encrypted secret temporarily or permanently?
  // We can just store it in DB, but leave mfaEnabled = false until verified.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaSecretEncrypted: encryptMfaSecret(secret),
    }
  });

  return { success: true, qrCodeUrl, secretBase32: secret };
}

const verifySetupSchema = z.object({
  code: z.string().min(6),
  password: z.string().min(1)
});

export type VerifyMfaSetupState = {
  success: boolean;
  message?: string;
  recoveryCodes?: string[];
};

export async function verifyAndEnableMfaAction(
  prevState: VerifyMfaSetupState,
  formData: FormData
): Promise<VerifyMfaSetupState> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const parsed = verifySetupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Invalid input" };

  const { code, password } = parsed.data;

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const rateLimit = await checkRateLimit("mfa_verify", ip);
  if (!rateLimit.success) {
    return { success: false, message: rateLimit.message };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.passwordHash || !user.mfaSecretEncrypted) {
    return { success: false, message: "Invalid user state." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: "Incorrect password." };
  }

  let isValid = false;
  let decRes: import("@/lib/crypto-utils").DecryptMfaResult | undefined;
  try {
    decRes = decryptMfaSecret(user.mfaSecretEncrypted);
    isValid = speakeasy.totp.verify({ token: code, secret: decRes.secret, encoding: 'base32' });
  } catch (err) {
    isValid = false;
  }
  
  if (!isValid) {
    return { success: false, message: "Invalid authenticator code." };
  }

  // Generate 10 recovery codes
  const rawCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex"));
  
  // Hash codes outside the transaction to prevent Prisma timeout (bcrypt takes time)
  const hashedCodes = await Promise.all(
    rawCodes.map(async (raw) => await bcrypt.hash(raw, 10))
  );
  
  await prisma.$transaction(async (tx) => {
    // Clear old codes if any
    await tx.mfaRecoveryCode.deleteMany({ where: { userId: user.id } });
    
    // Insert new hashed codes
    for (const codeHash of hashedCodes) {
      await tx.mfaRecoveryCode.create({
        data: { userId: user.id, codeHash }
      });
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        sessionVersion: { increment: 1 },
        ...(decRes && decRes.isLegacy ? { mfaSecretEncrypted: encryptMfaSecret(decRes.secret) } : {})
      }
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
      data: { action: "MFA_ENABLED", entity: "User", entityId: user.id, userId: user.id }
    });
  });

  return { success: true, recoveryCodes: rawCodes };
}

export type DisableMfaState = {
  success: boolean;
  message?: string;
};

export async function disableMfaAction(
  prevState: DisableMfaState,
  formData: FormData
): Promise<DisableMfaState> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const password = formData.get("password") as string;
  if (!password) return { success: false, message: "Password required." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.passwordHash) return { success: false, message: "Invalid user." };

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) return { success: false, message: "Incorrect password." };

  const code = formData.get("code") as string;
  const isRecovery = formData.get("isRecovery") === "true";
  
  if (!code || code.trim().length < 6) {
    return { success: false, message: "Invalid code provided." };
  }

  let isValid = false;
  if (isRecovery) {
    const codes = await prisma.mfaRecoveryCode.findMany({
      where: { userId: user.id, usedAt: null }
    });
    
    let matchedCodeId: string | null = null;
    for (const c of codes) {
      if (await bcrypt.compare(code, c.codeHash)) {
        matchedCodeId = c.id;
        break;
      }
    }
    if (matchedCodeId) {
      const { count } = await prisma.mfaRecoveryCode.updateMany({
        where: { id: matchedCodeId, usedAt: null },
        data: { usedAt: new Date() }
      });
      if (count === 1) isValid = true;
    }
  } else {
    try {
      const decRes = decryptMfaSecret(user.mfaSecretEncrypted!);
      isValid = speakeasy.totp.verify({ token: code, secret: decRes.secret, encoding: 'base32' });
    } catch {
      isValid = false;
    }
  }

  if (!isValid) return { success: false, message: "Invalid code." };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        sessionVersion: { increment: 1 }
      }
    });

    await tx.mfaChallenge.deleteMany({ where: { userId: user.id } });

    await tx.mfaRecoveryCode.deleteMany({ where: { userId: user.id } });

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
      data: { action: "MFA_DISABLED", entity: "User", entityId: user.id }
    });
  });

  // Force immediate client redirect so the user visually sees they are logged out
  const { redirect } = await import("next/navigation");
  redirect("/admin/login?error=session_expired");
  
  return { success: true };
}

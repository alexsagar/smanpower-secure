import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { InvalidCredentialsError, MfaRequiredError } from "./auth-errors";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("[Auth] Missing credentials");
          return null;
        }
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        const dummyHash = "$2a$12$DUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHD";
        
        if (!user || !user.passwordHash) {
          await bcrypt.compare(password, dummyHash).catch(() => {});
          logger.warn(`[Auth] User not found or missing passwordHash: ${email}`);
          throw new InvalidCredentialsError();
        }

        if (user.accountStatus !== "ACTIVE") {
          logger.warn(`[Auth] User not ACTIVE: ${email}, status: ${user.accountStatus}`);
          throw new InvalidCredentialsError();
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          logger.warn(`[Auth] Account locked: ${email}`);
          throw new InvalidCredentialsError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          const newFailedCount = user.failedLoginCount + 1;
          const lockedUntil = newFailedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          
          await prisma.user.updateMany({
            where: { id: user.id, failedLoginCount: user.failedLoginCount },
            data: { 
              failedLoginCount: newFailedCount,
              lockedUntil: lockedUntil
            }
          });
          
          logger.warn(`[Auth] Invalid password for user: ${email}`);
          throw new InvalidCredentialsError();
        }

        if (user.mfaEnabled) {
          const { headers } = await import("next/headers");
          const reqHeaders = await headers();
          const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
          const ua = reqHeaders.get("user-agent") || "unknown";
          
          const crypto = await import("crypto");
          const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
          const uaHash = crypto.createHash("sha256").update(ua).digest("hex");
          
          const challengeToken = crypto.randomBytes(32).toString("hex");
          const tokenHash = crypto.createHash("sha256").update(challengeToken).digest("hex");
          
          await prisma.mfaChallenge.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              tokenHash,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              ipHash,
              userAgentHash: uaHash
            },
            update: {
              tokenHash,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              ipHash,
              userAgentHash: uaHash,
              failedAttempts: 0
            }
          });
          
          const err = new MfaRequiredError();
          err.message = JSON.stringify({ code: "MFA_REQUIRED", challengeToken });
          throw err;
        }

        const { headers, cookies } = await import("next/headers");
        const reqHeaders = await headers();
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        const crypto = await import("crypto");
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
        const uaHash = crypto.createHash("sha256").update(reqHeaders.get("user-agent") || "unknown").digest("hex");

        const rawSessionToken = crypto.randomBytes(32).toString("hex");
        const sessionIdHash = crypto.createHash("sha256").update(rawSessionToken).digest("hex");

        const { SESSION_CONFIG } = await import("@/lib/session-config");

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
              lastLoginIpHash: ipHash
            }
          }),
          prisma.adminSession.create({
            data: {
              sessionIdHash,
              userId: user.id,
              sessionVersionAtIssue: user.sessionVersion,
              idleExpiresAt: new Date(Date.now() + SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000),
              absoluteExpiresAt: new Date(Date.now() + SESSION_CONFIG.ABSOLUTE_TIMEOUT_MINUTES * 60 * 1000),
              ipAddressHash: ipHash,
              userAgentHash: uaHash,
            }
          })
        ]);

        const cookieStore = await cookies();
        const { getAppEnv } = await import("@/lib/env");
        cookieStore.set("admin_session_token", rawSessionToken, {
          httpOnly: true,
          secure: getAppEnv() !== "local",
          sameSite: "strict",
          path: "/",
          maxAge: SESSION_CONFIG.ABSOLUTE_TIMEOUT_MINUTES * 60
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role.name,
          sessionVersion: user.sessionVersion,
          accountStatus: user.accountStatus,
        };
      },
    }),
    Credentials({
      id: "mfa",
      name: "MFA",
      credentials: {
        mfaChallengeToken: { label: "Challenge Token", type: "text" },
        mfaCode: { label: "MFA Code", type: "text" },
        recoveryCode: { label: "Recovery Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.mfaChallengeToken) return null;
        
        const tokenHash = (await import("crypto")).createHash("sha256").update(credentials.mfaChallengeToken as string).digest("hex");
        
        const challenge = await prisma.mfaChallenge.findUnique({
          where: { tokenHash },
          include: { user: { include: { role: true } } }
        });
        
        if (!challenge) {
          throw new InvalidCredentialsError();
        }
        if (challenge.expiresAt < new Date()) {
          await prisma.mfaChallenge.deleteMany({ where: { id: challenge.id } });
          throw new InvalidCredentialsError();
        }
        if (challenge.failedAttempts >= 5) {
          await prisma.mfaChallenge.deleteMany({ where: { id: challenge.id } });
          throw new InvalidCredentialsError();
        }
        
        const user = challenge.user;
        if (user.accountStatus !== "ACTIVE" || (user.lockedUntil && user.lockedUntil > new Date())) {
          throw new InvalidCredentialsError();
        }

        let isValid = false;
        
        if (credentials.mfaCode) {
          const speakeasy = (await import("speakeasy")).default;
          const { decryptMfaSecret, encryptMfaSecret } = await import("@/lib/crypto-utils");
          
          if (!user.mfaSecretEncrypted) {
             throw new InvalidCredentialsError();
          }
          
          try {
            const decRes = decryptMfaSecret(user.mfaSecretEncrypted);
            isValid = speakeasy.totp.verify({ token: credentials.mfaCode as string, secret: decRes.secret, encoding: 'base32' });
            
            if (isValid && decRes.isLegacy) {
              await prisma.user.update({
                where: { id: user.id },
                data: { mfaSecretEncrypted: encryptMfaSecret(decRes.secret) }
              });
            }
          } catch (error) {
            // Decryption or format failure
            isValid = false;
          }
        } else if (credentials.recoveryCode) {
          // Recovery code flow
          const recoveryCode = credentials.recoveryCode as string;
          const codes = await prisma.mfaRecoveryCode.findMany({
            where: { userId: user.id, usedAt: null }
          });
          const bcrypt = await import("bcryptjs");
          let matchedCodeId: string | null = null;
          
          for (const code of codes) {
            if (await bcrypt.compare(recoveryCode, code.codeHash)) {
              matchedCodeId = code.id;
              break;
            }
          }

          if (matchedCodeId) {
            const { count } = await prisma.mfaRecoveryCode.updateMany({
              where: { id: matchedCodeId, usedAt: null },
              data: { usedAt: new Date() }
            });
            if (count === 1) {
              isValid = true;
            }
          }
        }
        
        if (!isValid) {
          await prisma.mfaChallenge.updateMany({
            where: { id: challenge.id, failedAttempts: { lt: 5 } },
            data: { failedAttempts: { increment: 1 } }
          });
          throw new InvalidCredentialsError();
        }
        
        // MFA is valid! Consume challenge atomically.
        const { count } = await prisma.mfaChallenge.deleteMany({
          where: { 
            id: challenge.id,
            expiresAt: { gt: new Date() },
            failedAttempts: { lt: 5 }
          }
        });

        if (count !== 1) {
          throw new InvalidCredentialsError(); // Race condition or expired/failed during consumption
        }
        
        const { headers, cookies } = await import("next/headers");
        const reqHeaders = await headers();
        const crypto = await import("crypto");
        const ipHash = crypto.createHash("sha256").update(challenge.ipHash || "unknown").digest("hex");
        const uaHash = crypto.createHash("sha256").update(challenge.userAgentHash || "unknown").digest("hex");

        const rawSessionToken = crypto.randomBytes(32).toString("hex");
        const sessionIdHash = crypto.createHash("sha256").update(rawSessionToken).digest("hex");

        const { SESSION_CONFIG } = await import("@/lib/session-config");

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
              lastLoginIpHash: challenge.ipHash
            }
          }),
          prisma.adminSession.create({
            data: {
              sessionIdHash,
              userId: user.id,
              sessionVersionAtIssue: user.sessionVersion,
              idleExpiresAt: new Date(Date.now() + SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000),
              absoluteExpiresAt: new Date(Date.now() + SESSION_CONFIG.ABSOLUTE_TIMEOUT_MINUTES * 60 * 1000),
              ipAddressHash: challenge.ipHash,
              userAgentHash: challenge.userAgentHash,
            }
          })
        ]);

        const cookieStore = await cookies();
        const { getAppEnv } = await import("@/lib/env");
        cookieStore.set("admin_session_token", rawSessionToken, {
          httpOnly: true,
          secure: getAppEnv() !== "local",
          sameSite: "strict",
          path: "/",
          maxAge: SESSION_CONFIG.ABSOLUTE_TIMEOUT_MINUTES * 60
        });
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role.name,
          sessionVersion: user.sessionVersion,
          accountStatus: user.accountStatus,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.sessionVersion = (user as any).sessionVersion;
        token.accountStatus = (user as any).accountStatus;
      }
      
      // On subsequent requests, verify sessionVersion and accountStatus
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { sessionVersion: true, accountStatus: true, role: { select: { name: true } } }
          });
          
          if (!dbUser) {
            logger.warn(`[Auth] SessionInvalidated: User ${token.id} not found in DB`);
            return { ...token, error: "SessionInvalidated" };
          }
          if (dbUser.accountStatus !== "ACTIVE") {
            logger.warn(`[Auth] SessionInvalidated: User ${token.id} accountStatus is ${dbUser.accountStatus}`);
            return { ...token, error: "SessionInvalidated" };
          }
          if (dbUser.sessionVersion !== token.sessionVersion) {
            logger.warn(`[Auth] SessionInvalidated: User ${token.id} sessionVersion mismatch. DB: ${dbUser.sessionVersion}, Token: ${token.sessionVersion}`);
            return { ...token, error: "SessionInvalidated" };
          }
          
          // Keep role updated
          token.role = dbUser.role.name;
        } catch (error) {
          logger.error("[Auth] JWT DB verification error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error === "SessionInvalidated") {
        // Expose to client so they can redirect/logout
        (session as any).error = "SessionInvalidated";
      }
      
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).sessionVersion = token.sessionVersion;
        (session.user as any).accountStatus = token.accountStatus;
      }
      return session;
    },
  },
});

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { saveSeoPageMeta } from "@/actions/seo";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateMetadata } from "@/app/[lang]/employers/page";

// Mocking auth to simulate different users
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
import { auth } from "@/lib/auth";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
import { cookies } from "next/headers";

// Mocking revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
import { revalidatePath } from "next/cache";

vi.mock("@/config/demo", () => ({
  DEMO_MODE: false,
  DEMO_MODE_REQUESTED: false,
  isDemoEnvironmentAllowed: vi.fn(() => false),
  demoFallback: <T,>(_: T, safeValue: T) => safeValue,
}));

const seoSessionTokens = {
  super_admin: "seo-super-admin-session-token",
  content_manager: "seo-content-manager-session-token",
} as const;

let activeSeoRole: keyof typeof seoSessionTokens =
  "super_admin";

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

describe("SEO Phase 2B Integration Tests", () => {
  beforeEach(async () => {
    await prisma.auditLog.deleteMany({ where: { action: { in: ['update_seo'] } } });
    await prisma.sEOPageMeta.deleteMany({ where: { pagePath: "/employers" } });
    
    const perms = ["seo.update", "seo.manage_canonical", "seo.manage_noindex", "seo.view", "seo.publish"];
    for (const p of perms) {
      await prisma.permission.upsert({ where: { name: p }, update: {}, create: { name: p, displayName: p, module: "SEO", action: p } });
    }

    const saRole = await prisma.role.upsert({
      where: { name: "super_admin" },
      update: {},
      create: {
        name: "super_admin",
        displayName: "Super Admin"
      }
    });

    const cmRole = await prisma.role.upsert({
      where: { name: "content_manager" },
      update: {},
      create: {
        name: "content_manager",
        displayName: "Content Manager"
      }
    });

    // Force connect permissions
    for (const p of perms) {
      const perm = await prisma.permission.findUnique({ where: { name: p } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: saRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: saRole.id, permissionId: perm.id }
        });
        if (["seo.update", "seo.view"].includes(p)) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: cmRole.id, permissionId: perm.id } },
            update: {},
            create: { roleId: cmRole.id, permissionId: perm.id }
          });
        }
      }
    }

    // Create super_admin test user
    await prisma.user.upsert({
      where: { id: "test-user-id" },
      update: {
        roleId: saRole.id,
        accountStatus: "ACTIVE",
        isActive: true,
        sessionVersion: 1,
      },
      create: {
        id: "test-user-id",
        email: "seo-tester@example.com",
        name: "SEO Tester",
        passwordHash: "dummy",
        roleId: saRole.id,
        accountStatus: "ACTIVE",
        isActive: true,
        sessionVersion: 1,
      }
    });

    // Create content_manager test user
    await prisma.user.upsert({
      where: { id: "cm-user-id" },
      update: {
        roleId: cmRole.id,
        accountStatus: "ACTIVE",
        isActive: true,
        sessionVersion: 1,
      },
      create: {
        id: "cm-user-id",
        email: "cm-tester@example.com",
        name: "CM Tester",
        passwordHash: "dummy",
        roleId: cmRole.id,
        accountStatus: "ACTIVE",
        isActive: true,
        sessionVersion: 1,
      }
    });

    await prisma.adminSession.deleteMany({
      where: {
        userId: {
          in: ["test-user-id", "cm-user-id"],
        },
      },
    });

    const now = Date.now();

    await prisma.adminSession.upsert({
      where: {
        sessionIdHash: hashSessionToken(
          seoSessionTokens.super_admin,
        ),
      },
      update: {
        userId: "test-user-id",
        sessionVersionAtIssue: 1,
        revokedAt: null,
        revokedReason: null,
        idleExpiresAt: new Date(
          now + 60 * 60 * 1000,
        ),
        absoluteExpiresAt: new Date(
          now + 8 * 60 * 60 * 1000,
        ),
      },
      create: {
        sessionIdHash: hashSessionToken(
          seoSessionTokens.super_admin,
        ),
        userId: "test-user-id",
        sessionVersionAtIssue: 1,
        idleExpiresAt: new Date(
          now + 60 * 60 * 1000,
        ),
        absoluteExpiresAt: new Date(
          now + 8 * 60 * 60 * 1000,
        ),
      },
    });

    await prisma.adminSession.upsert({
      where: {
        sessionIdHash: hashSessionToken(
          seoSessionTokens.content_manager,
        ),
      },
      update: {
        userId: "cm-user-id",
        sessionVersionAtIssue: 1,
        revokedAt: null,
        revokedReason: null,
        idleExpiresAt: new Date(
          now + 60 * 60 * 1000,
        ),
        absoluteExpiresAt: new Date(
          now + 8 * 60 * 60 * 1000,
        ),
      },
      create: {
        sessionIdHash: hashSessionToken(
          seoSessionTokens.content_manager,
        ),
        userId: "cm-user-id",
        sessionVersionAtIssue: 1,
        idleExpiresAt: new Date(
          now + 60 * 60 * 1000,
        ),
        absoluteExpiresAt: new Date(
          now + 8 * 60 * 60 * 1000,
        ),
      },
    });

    vi.clearAllMocks();

    activeSeoRole = "super_admin";

    (cookies as any).mockResolvedValue({
      get: vi.fn((name: string) =>
        name === "admin_session_token"
          ? {
              value:
                seoSessionTokens[activeSeoRole],
            }
          : undefined
      ),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockUser = (roleName: string) => {
    activeSeoRole =
      roleName === "content_manager"
        ? "content_manager"
        : "super_admin";

    const id =
      activeSeoRole === "content_manager"
        ? "cm-user-id"
        : "test-user-id";

    (auth as any).mockResolvedValue({
      user: {
        id,
        role: { name: roleName },
      },
    });
  };

  it("missing SEOPageMeta uses fallback safely", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata.title).toBe("Hire Nepali Workers | Recruitment Agency for Gulf & Europe | Seven Seas Intercontinental");
  });

  it("SEOPageMeta overrides fallback metadata", async () => {
    await prisma.sEOPageMeta.upsert({
      where: {
        pagePath_lang: {
          pagePath: "/employers",
          lang: "en",
        },
      },
      update: {
        pagePath: "/employers",
        lang: "en",
        metaTitle: "Custom Admin Title",
        metaDescription: "Custom Description",
      },
      create: {
        pagePath: "/employers",
        lang: "en",
        metaTitle: "Custom Admin Title",
        metaDescription: "Custom Description",
      },
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata.title).toBe("Custom Admin Title | Seven Seas Intercontinental");
    expect(metadata.description).toBe("Custom Description");
  });

  it("English and Nepali SEO records are separate", async () => {
    await prisma.sEOPageMeta.upsert({
      where: {
        pagePath_lang: {
          pagePath: "/employers",
          lang: "en",
        },
      },
      update: { metaTitle: "EN Title" },
      create: { pagePath: "/employers", lang: "en", metaTitle: "EN Title" },
    });

    await prisma.sEOPageMeta.upsert({
      where: {
        pagePath_lang: {
          pagePath: "/employers",
          lang: "ne",
        },
      },
      update: { metaTitle: "NE Title" },
      create: { pagePath: "/employers", lang: "ne", metaTitle: "NE Title" },
    });

    const metadataEn = await generateMetadata({ params: Promise.resolve({ lang: "en" }) });
    const metadataNe = await generateMetadata({ params: Promise.resolve({ lang: "ne" }) });

    expect(metadataEn.title).toContain("EN Title");
    expect(metadataNe.title).toContain("NE Title");
  });

  it("unauthorized user cannot edit SEO", async () => {
    (auth as any).mockResolvedValue(null);
    await expect(saveSeoPageMeta({ pagePath: "/", lang: "en" })).rejects.toThrow("Unauthorized");
  });

  it("Content Manager can edit normal title/description", async () => {
    mockUser("content_manager");
    const result = await saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      metaTitle: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("Content Manager cannot change canonicalUrl", async () => {
    mockUser("content_manager");
    await expect(saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      canonicalUrl: "https://smanpower.com/en/employers",
    })).rejects.toThrow("Forbidden: Missing permission \"seo.manage_canonical\".");
  });

  it("Content Manager cannot change noIndex", async () => {
    mockUser("content_manager");
    await expect(saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      noIndex: true,
    })).rejects.toThrow("Forbidden: Missing permission \"seo.manage_noindex\".");
  });

  it("Super Admin can change canonicalUrl and noIndex", async () => {
    mockUser("super_admin");
    const result = await saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      canonicalUrl: "https://smanpower.com/en/employers",
      noIndex: true,
    });
    expect(result.success).toBe(true);
  });

  it("canonicalUrl rejects localhost and malformed domains", async () => {
    mockUser("super_admin");
    await expect(saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      canonicalUrl: "http://localhost:3000/en/employers",
    })).rejects.toThrow("Invalid canonical URL.");

    await expect(saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      canonicalUrl: "javascript:alert(1)",
    })).rejects.toThrow("Invalid canonical URL.");

    await expect(saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      canonicalUrl: "not-a-url",
    })).rejects.toThrow("Malformed canonical URL.");
  });

  it("SEO edit creates AuditLog and revalidates", async () => {
    mockUser("super_admin");
    await saveSeoPageMeta({
      pagePath: "/employers",
      lang: "en",
      metaTitle: "New Title",
    });

    const log = await prisma.auditLog.findFirst({ where: { action: "update_seo" } });
    expect(log).toBeDefined();
    expect((log?.details as any).pagePath).toBe("/employers");

    expect(revalidatePath).toHaveBeenCalledWith("/en/employers");
  });
});

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import type { CmsSocialLink } from "@/types/content";
import { FOOTER_SOCIAL_PLATFORMS } from "@/lib/footer-social";
import { CACHE_TAGS } from "@/lib/cache-tags";


const aiSummarySchema = z.object({
  heading: z.string().min(1).max(200),
  companyUrl: z.string().url().refine((url) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a valid HTTPS URL"),
  basePrompt: z.string().min(1).max(1000),
  services: z.array(
    z.object({
      id: z.enum(["chatgpt", "gemini", "claude", "perplexity"]),
      enabled: z.boolean(),
      order: z.number().int().min(0),
    })
  ).refine((services) => {
    const orders = new Set(services.map((s) => s.order));
    return orders.size === services.length;
  }, "Order values must be unique"),
});

const certificationLogoSchema = z.object({
  imageUrl: z.string().refine((value) => value.startsWith("/") || /^https:\/\//.test(value), "Logo image must be a local path or HTTPS URL"),
  accessibleName: z.string().min(1).max(120),
  href: z.string().url().refine((value) => value.startsWith("https://"), "Link must use HTTPS").optional().or(z.literal("")),
  order: z.number().int().min(0),
  enabled: z.boolean(),
});

const certificationLogosSchema = z.array(certificationLogoSchema).max(12).refine(
  (logos) => new Set(logos.map((logo) => logo.order)).size === logos.length,
  "Order values must be unique"
);

const footerContactSchema = z.object({
  address: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  province: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  postalCode: z.string().max(40).optional(),
  phone: z.string().max(60).optional(),
  fax: z.string().max(60).optional(),
  email: z.string().max(160).optional(),
  whatsapp: z.string().max(60).optional(),
  officeHours: z.string().max(200).optional(),
});

export type FooterContactInput = z.infer<typeof footerContactSchema>;

const socialLinkSchema = z.object({
  platform: z.enum(FOOTER_SOCIAL_PLATFORMS),
  label: z.string().min(1).max(120),
  url: z
    .string()
    .url()
    .refine((value) => {
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Link must use HTTPS"),
  isActive: z.boolean(),
  order: z.number().int().min(0),
});

const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(12)
  .refine(
    (links) => new Set(links.map((link) => link.order)).size === links.length,
    "Order values must be unique",
  );

export type AiSummaryConfigInput = z.infer<typeof aiSummarySchema>;
export type CertificationLogosInput = z.infer<typeof certificationLogosSchema>;

export async function saveAiSummaryConfigAction(input: AiSummaryConfigInput) {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);

  try {
    const validated = aiSummarySchema.parse(input);

    await prisma.siteSetting.upsert({
      where: { key: "footer_ai_summary_config" },
      update: {
        value: validated,
      },
      create: {
        key: "footer_ai_summary_config",
        value: validated,
        group: "footer",
      },
    });

    logger.info("Updated AI Summary Footer Config", {
      action: "UPDATE_AI_SUMMARY_CONFIG",
    });

    revalidateTag("content", "max");
    revalidateTag(CACHE_TAGS.settings, "max");
    revalidatePath("/", "layout");


    return { success: true };
  } catch (error) {
    logger.error("Failed to save AI Summary config", error as Error, {});
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveFooterCertificationLogosAction(input: CertificationLogosInput) {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);

  try {
    const validated = certificationLogosSchema.parse(input).map(({ href, ...logo }) => ({
      ...logo,
      ...(href ? { href } : {}),
    }));

    await prisma.siteSetting.upsert({
      where: { key: "footer_certification_logos" },
      update: { value: validated },
      create: { key: "footer_certification_logos", value: validated, group: "footer" },
    });

    revalidateTag("content", "max");
    revalidateTag(CACHE_TAGS.settings, "max");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    logger.error("Failed to save footer certification logos", error as Error, {});
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveFooterContactAction(input: FooterContactInput) {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);

  try {
    const parsed = footerContactSchema.parse(input);
    // Store only non-empty fields so unset values keep falling back to defaults.
    const value = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === "string" && v.trim() !== ""),
    );

    await prisma.siteSetting.upsert({
      where: { key: "footer_contact" },
      update: { value },
      create: { key: "footer_contact", value, group: "footer" },
    });

    logger.info("Updated footer contact info", { action: "UPDATE_FOOTER_CONTACT" });

    revalidateTag("content", "max");
    revalidateTag(CACHE_TAGS.settings, "max");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    logger.error("Failed to save footer contact info", error as Error, {});
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveFooterSocialLinksAction(input: CmsSocialLink[]) {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);

  try {
    // zod is the trust boundary: it narrows platform to the controlled enum and
    // rejects non-HTTPS/invalid URLs regardless of what the client sends.
    const validated = socialLinksSchema.parse(input);

    await prisma.siteSetting.upsert({
      where: { key: "footer_social_links" },
      update: { value: validated },
      create: { key: "footer_social_links", value: validated, group: "footer" },
    });

    logger.info("Updated footer social links", { action: "UPDATE_FOOTER_SOCIAL_LINKS" });

    revalidateTag("content", "max");
    revalidateTag(CACHE_TAGS.settings, "max");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    logger.error("Failed to save footer social links", error as Error, {});
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

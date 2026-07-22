"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

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
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    logger.error("Failed to save footer certification logos", error as Error, {});
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

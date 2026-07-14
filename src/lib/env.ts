import { z } from "zod";
import {
  DEMO_MODE_REQUESTED,
  isDemoEnvironmentAllowed,
} from "../config/demo";

const TRUE_VALUES = new Set(["1", "true", "yes"]);

export function isEnvEnabled(name: string): boolean {
  return TRUE_VALUES.has((process.env[name] || "").toLowerCase());
}

export function isStagingNoIndexEnabled(): boolean {
  return isEnvEnabled("STAGING_NOINDEX");
}

export const appEnvSchema = z.enum(["local", "qa", "staging", "production"]);

export function getAppEnv(): z.infer<typeof appEnvSchema> {
  const result = appEnvSchema.safeParse(process.env.APP_ENV);
  if (!result.success) {
    throw new Error(`Invalid APP_ENV configuration. Must be one of: local, qa, staging, production. Received: ${process.env.APP_ENV}`);
  }
  return result.data;
}

export const REQUIRED_PRODUCTION_ENV = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "MFA_ENCRYPTION_KEY",
  "PRIVACY_HASH_SECRET",
] as const;

export function getMissingProductionEnv(): string[] {
  if (process.env.NODE_ENV !== "production") return [];
  if (
    DEMO_MODE_REQUESTED &&
    isDemoEnvironmentAllowed()
  ) {
    return [];
  }
  return REQUIRED_PRODUCTION_ENV.filter((name) => !process.env[name]);
}

export function assertProductionEnv(): void {
  const missing = getMissingProductionEnv();
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}

const notificationEmailSchema = z.string().email();

export function getAdminNotificationEmail(): string | null {
  const value =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    "";

  if (!value) return null;

  const result = notificationEmailSchema.safeParse(value);
  if (!result.success) {
    throw new Error("Invalid admin notification email configuration.");
  }

  return result.data;
}

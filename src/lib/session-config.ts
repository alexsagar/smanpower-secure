import { getAppEnv } from "@/lib/env";

export const SESSION_CONFIG = {
  get IDLE_TIMEOUT_MINUTES() {
    return getAppEnv() === "local" && process.env.ADMIN_IDLE_TIMEOUT_MINUTES
      ? parseInt(process.env.ADMIN_IDLE_TIMEOUT_MINUTES, 10)
      : 30;
  },
  get IDLE_WARNING_SECONDS() {
    return getAppEnv() === "local" && process.env.ADMIN_IDLE_WARNING_SECONDS
      ? parseInt(process.env.ADMIN_IDLE_WARNING_SECONDS, 10)
      : 120; // 2 minutes
  },
  get ABSOLUTE_TIMEOUT_MINUTES() {
    return getAppEnv() === "local" && process.env.ADMIN_ABSOLUTE_TIMEOUT_MINUTES
      ? parseInt(process.env.ADMIN_ABSOLUTE_TIMEOUT_MINUTES, 10)
      : 480; // 8 hours
  },
  get ACTIVITY_REFRESH_SECONDS() {
    return getAppEnv() === "local" && process.env.ADMIN_ACTIVITY_REFRESH_SECONDS
      ? parseInt(process.env.ADMIN_ACTIVITY_REFRESH_SECONDS, 10)
      : 300; // 5 minutes
  }
};

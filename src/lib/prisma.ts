import "server-only";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Workers has no raw TCP/WebSocket path we want here — send queries over HTTP.
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. The Prisma driver adapter requires it at runtime.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaNeon(new Pool({ connectionString })),
    log:
      process.env.PRISMA_QUERY_LOGGING === "true"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

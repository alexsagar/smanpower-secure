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

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;

  // Cached on globalThis so dev HMR does not leak connections; on the Worker
  // this just means one client per isolate, which is what we want anyway.
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

// Constructed on first use, not at import time: on workerd `process.env` is not
// reliably populated while modules are evaluating, so reading DATABASE_URL at
// module scope would throw before the request ever starts.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPrismaClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getPrismaClient()) : value;
  },
});

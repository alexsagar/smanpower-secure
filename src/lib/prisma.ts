import "server-only";

import { cache } from "react";
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

// On workerd a client may not be shared between requests. The client's engine
// initialises lazily on first query, so the isolate's first request owns that
// pending promise; a concurrent request that reuses the same client awaits an
// I/O promise from a foreign request context and never settles. The runtime
// cancels it after ~30s ("your Worker's code had hung"), which the browser sees
// as ERR_TIMED_OUT. React's `cache` gives each request its own client.
const getRequestPrismaClient = cache(createPrismaClient);

const isWorkerd =
  typeof navigator !== "undefined" &&
  navigator.userAgent === "Cloudflare-Workers";

function getPrismaClient(): PrismaClient {
  if (isWorkerd) return getRequestPrismaClient();

  // Elsewhere (dev server, scripts) one client per process: keeps HMR from
  // leaking connections and avoids re-creating it for every CLI query.
  return (globalForPrisma.prisma ??= createPrismaClient());
}

// Constructed on first use, not at import time: on workerd `process.env` is not
// reliably populated while modules are evaluating, so reading DATABASE_URL at
// module scope would throw before the request ever starts.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

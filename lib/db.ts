import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// HTTP transport — no WebSocket, no `ws` dependency.
// Recommended for Vercel serverless functions (short-lived, stateless).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  // PrismaNeonHttp uses Neon's HTTP API — it bypasses pgbouncer.
  // DIRECT_URL is the non-pooler endpoint; fall back to DATABASE_URL for envs that only have one.
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL / DIRECT_URL is not set");
  // Strip pgbouncer=true — it's meaningless (and potentially breaking) for the HTTP transport.
  const cleanUrl = url.replace(/[&?]pgbouncer=true/gi, "").replace(/\?$/, "");
  const adapter = new PrismaNeonHttp(cleanUrl);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (() => {
    const client = createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  })();

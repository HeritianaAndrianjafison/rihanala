import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// HTTP transport — no WebSocket, no `ws` dependency.
// Recommended for Vercel serverless functions (short-lived, stateless).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function stripUrl(raw: string): string {
  // Remove BOM (U+FEFF) that copy-paste from Windows editors can introduce into Vercel env vars.
  // Also remove pgbouncer=true which is irrelevant for HTTP transport.
  return raw
    .replace(/^﻿/, "")
    .replace(/[&?]pgbouncer=true/gi, "")
    .replace(/\?$/, "");
}

function createClient(): PrismaClient {
  // DIRECT_URL is the non-pooler endpoint; fall back to DATABASE_URL.
  const rawUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL / DIRECT_URL is not set");
  const adapter = new PrismaNeonHttp(stripUrl(rawUrl), {});
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

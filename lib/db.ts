import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// WebSocket transport — required for interactive transactions ($transaction callbacks).
// PrismaNeonHttp (HTTP) does not support interactive transactions.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function stripUrl(raw: string): string {
  // Remove BOM (U+FEFF) that Vercel env var copy-paste can introduce.
  // Also strip pgbouncer=true — Neon's WS driver uses the direct endpoint.
  return raw
    .replace(/^﻿/, "")
    .replace(/[&?]pgbouncer=true/gi, "")
    .replace(/\?$/, "")
    .trim();
}

function createClient(): PrismaClient {
  const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL or DIRECT_URL is not set");
  const adapter = new PrismaNeon({ connectionString: stripUrl(raw) });
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

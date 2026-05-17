import { defineConfig } from "prisma/config";

// Prisma CLI loads .env by default — Next.js uses .env.local. Load it explicitly.
try {
  process.loadEnvFile(".env.local");
} catch {
  // file absent or already loaded — ignore
}

export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});

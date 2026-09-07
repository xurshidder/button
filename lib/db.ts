import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * CONNECTION SPLIT — the thing to get right (CLAUDE.md §21.2):
 * this runtime client uses the POOLED url (Supavisor, port 6543), while
 * migrations use the DIRECT url (5432) configured in prisma.config.ts. Prisma 7
 * dropped both `directUrl` in the schema and `datasourceUrl` on the
 * constructor, so the runtime connection is supplied through a driver adapter
 * instead. Pointing this at the direct url works locally and then exhausts
 * Postgres connections under real traffic.
 *
 * HOT RELOAD — Next dev re-evaluates modules on every change. Without the
 * global cache each reload would open a fresh pool and drain the database
 * during ordinary development.
 *
 * React components must never import this directly. Every read goes
 * `component → lib/services/* → lib/db` (CLAUDE.md §4).
 */

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Fail loudly at startup rather than with a confusing query error later.
    throw new Error(
      "DATABASE_URL is not set. Copy the POOLED connection string (port 6543) from Supabase into .env.local.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

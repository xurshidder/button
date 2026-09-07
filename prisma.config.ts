import path from "node:path";

import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma reads `.env` by default, but Next.js keeps local secrets in
 * `.env.local` — the file that is gitignored. Loading it here keeps one source
 * of truth for credentials instead of two copies drifting apart.
 */
loadEnv({ path: path.join(process.cwd(), ".env.local"), quiet: true });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    /**
     * DIRECT connection (port 5432) — deliberately NOT the pooled one.
     *
     * Prisma 7 dropped `directUrl`; this config datasource is what the CLI
     * uses for migrate and introspect, and those run DDL. Supavisor in
     * transaction mode cannot execute DDL, so pointing this at the pooler
     * (6543) fails.
     *
     * The runtime client uses the POOLED url instead — see lib/db.ts. That
     * split is the whole point of CLAUDE.md §21.2: migrations go direct,
     * request traffic goes through the pooler.
     */
    url: env("DIRECT_URL"),
  },

  migrations: {
    /** Safe to re-run: every write is an upsert on a natural key. */
    seed: "tsx prisma/seed.ts",
  },
});

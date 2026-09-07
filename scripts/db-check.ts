/**
 * Database connectivity + contents check.
 *
 * Reads over the POOLED connection deliberately — the same path the app uses
 * at request time — so this verifies the connection that actually matters,
 * not just that credentials work at all.
 *
 * Run with:  pnpm db:check
 */
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(process.cwd(), ".env.local"), quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const started = Date.now();

  const [products, variants, stock, stores, categories, images] =
    await Promise.all([
      prisma.product.count(),
      prisma.variant.count(),
      prisma.stockLevel.count(),
      prisma.store.count(),
      prisma.category.count(),
      prisma.productImage.count(),
    ]);

  console.log(`connected via pooler in ${Date.now() - started}ms\n`);
  console.table({ products, variants, stock, stores, categories, images });

  const sample = await prisma.product.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    include: {
      category: true,
      variants: { include: { stock: { include: { store: true } } } },
    },
  });

  if (!sample) {
    console.log("\nno published products found");
    return;
  }

  console.log(
    `\nsample: ${sample.nameUz} — ${sample.basePrice} so'm — ${sample.category.nameUz}`,
  );

  // Per-branch availability is the differentiator; prove it survives the round trip.
  const perStore = new Map<string, number>();
  for (const variant of sample.variants) {
    for (const level of variant.stock) {
      perStore.set(
        level.store.nameUz,
        (perStore.get(level.store.nameUz) ?? 0) + level.quantity,
      );
    }
  }
  console.log("stock by branch:", Object.fromEntries(perStore));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

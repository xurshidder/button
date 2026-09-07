import "server-only";

import { z } from "zod";

import { prisma } from "@/lib/db";

/**
 * Admin mutations.
 *
 * Every function here follows the contract in CLAUDE.md §10:
 * Zod parse → write → audit log. Authorisation happens in the Server Action
 * that calls these, before anything reaches this file.
 *
 * Nothing trusts the form. The admin UI constrains what can be typed, but the
 * UI is not the boundary — these schemas are.
 */

/* ── Validation ─────────────────────────────────────────────────────────── */

/**
 * Money is an integer number of so'm. Never a float, never cents
 * (CLAUDE.md §7). The upper bound is a typo guard: a price above ~100 million
 * so'm is a slipped keyboard, not a garment.
 */
const soum = z
  .number()
  .int("Narx butun son bo'lishi kerak")
  .min(0, "Narx manfiy bo'la olmaydi")
  .max(100_000_000, "Narx juda katta");

export const productUpdateSchema = z
  .object({
    id: z.string().min(1),
    basePrice: soum,
    oldPrice: soum.nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    isFeatured: z.boolean(),
  })
  .refine((v) => v.oldPrice === null || v.oldPrice > v.basePrice, {
    // An "old price" at or below the current price would render a discount
    // badge advertising a saving that does not exist.
    message: "Eski narx joriy narxdan katta bo'lishi kerak",
    path: ["oldPrice"],
  });

export const stockUpdateSchema = z.object({
  variantId: z.string().min(1),
  storeId: z.string().min(1),
  quantity: z.number().int().min(0, "Miqdor manfiy bo'la olmaydi").max(100_000),
});

export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type StockUpdate = z.infer<typeof stockUpdateSchema>;

/* ── Audit ──────────────────────────────────────────────────────────────── */

/**
 * Records who changed what.
 *
 * Non-negotiable in a retail business with staff turnover: "who dropped the
 * price to 1000 so'm" is a question that will get asked (CLAUDE.md §11).
 *
 * `actorId` is currently the shared admin session, because per-staff accounts
 * do not exist yet. The rows are still worth writing — when real accounts
 * arrive the column starts carrying a person instead of a placeholder, and the
 * history before that point is not lost.
 */
async function audit(
  action: string,
  entity: string,
  entityId: string,
  diff: unknown,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      // Round-tripped through JSON so the value matches Prisma's Json input
      // type regardless of what the caller assembled.
      data: {
        actorId: "admin",
        action,
        entity,
        entityId,
        diff: JSON.parse(JSON.stringify(diff)) as object,
      },
    });
  } catch {
    /* An audit failure must not roll back the change the user just made. */
  }
}

/* ── Mutations ──────────────────────────────────────────────────────────── */

export async function updateProduct(input: unknown): Promise<void> {
  const data = productUpdateSchema.parse(input);

  const before = await prisma.product.findUnique({
    where: { id: data.id },
    select: {
      basePrice: true,
      oldPrice: true,
      status: true,
      isFeatured: true,
      slug: true,
    },
  });
  if (!before) throw new Error("Mahsulot topilmadi");

  await prisma.product.update({
    where: { id: data.id },
    data: {
      basePrice: data.basePrice,
      oldPrice: data.oldPrice,
      status: data.status,
      isFeatured: data.isFeatured,
    },
  });

  await audit("product.update", "Product", data.id, {
    slug: before.slug,
    before,
    after: {
      basePrice: data.basePrice,
      oldPrice: data.oldPrice,
      status: data.status,
      isFeatured: data.isFeatured,
    },
  });
}

export async function updateStock(input: unknown): Promise<void> {
  const data = stockUpdateSchema.parse(input);

  const before = await prisma.stockLevel.findUnique({
    where: {
      variantId_storeId: {
        variantId: data.variantId,
        storeId: data.storeId,
      },
    },
    select: { quantity: true },
  });

  // Upsert, not update: a variant may never have had a row at this branch.
  await prisma.stockLevel.upsert({
    where: {
      variantId_storeId: {
        variantId: data.variantId,
        storeId: data.storeId,
      },
    },
    create: {
      variantId: data.variantId,
      storeId: data.storeId,
      quantity: data.quantity,
    },
    update: { quantity: data.quantity },
  });

  await audit("stock.update", "StockLevel", `${data.variantId}:${data.storeId}`, {
    before: before?.quantity ?? null,
    after: data.quantity,
  });
}

/* ── Admin reads ────────────────────────────────────────────────────────── */

export async function getProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: [{ status: "asc" }, { nameUz: "asc" }],
    select: {
      id: true,
      slug: true,
      sku: true,
      nameUz: true,
      basePrice: true,
      oldPrice: true,
      status: true,
      isFeatured: true,
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      category: { select: { nameUz: true } },
      _count: { select: { variants: true } },
    },
  });
}

export async function getStockMatrix() {
  const [stores, products] = await Promise.all([
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameUz: true },
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { nameUz: "asc" },
      select: {
        id: true,
        nameUz: true,
        slug: true,
        variants: {
          orderBy: { size: "asc" },
          select: {
            id: true,
            size: true,
            colorNameUz: true,
            stock: { select: { storeId: true, quantity: true } },
          },
        },
      },
    }),
  ]);

  return { stores, products };
}

/** Recent changes, for the audit view. */
export async function getRecentAudit(limit = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

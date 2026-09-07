import "server-only";

import { prisma } from "@/lib/db";
import type {
  Category,
  Product,
  ProductImage,
  Store,
  Variant,
} from "@/lib/types";

/**
 * Catalogue reads.
 *
 * This is the service layer from CLAUDE.md §4 and §10: plain functions, no
 * React, no HTTP, no `next/*`. Components call these; nothing calls Prisma
 * directly. That boundary is what lets v2 expose the same data over a REST API
 * for a mobile app without touching a single query.
 *
 * Every function returns the domain types in lib/types.ts — translated fields
 * collapsed into `{ uz, ru, en }` objects — so components never deal with the
 * `nameUz`/`nameRu`/`nameEn` column shape.
 */

/* ── Row shapes ─────────────────────────────────────────────────────────── */

const productInclude = {
  category: { select: { slug: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { url: true, altUz: true } },
  variants: {
    orderBy: { size: "asc" },
    include: { stock: { select: { storeId: true, quantity: true } } },
  },
} as const;

type ProductRow = Awaited<
  ReturnType<typeof prisma.product.findMany<{ include: typeof productInclude }>>
>[number];

/* ── Mappers ────────────────────────────────────────────────────────────── */

function toProduct(row: ProductRow): Product {
  const images: ProductImage[] = row.images.map((image, i) => ({
    id: `${row.id}-img-${i}`,
    url: image.url,
    alt: image.altUz ?? undefined,
  }));

  const variants: Variant[] = row.variants.map((variant) => ({
    id: variant.id,
    colorName: {
      uz: variant.colorNameUz,
      ru: variant.colorNameRu,
      en: variant.colorNameEn,
    },
    colorHex: variant.colorHex,
    size: variant.size,
    priceOverride: variant.priceOverride ?? undefined,
    stock: variant.stock.map((level) => ({
      storeId: level.storeId,
      quantity: level.quantity,
    })),
  }));

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: { uz: row.nameUz, ru: row.nameRu, en: row.nameEn },
    description: row.descUz
      ? { uz: row.descUz, ru: row.descRu ?? row.descUz, en: row.descEn ?? row.descUz }
      : undefined,
    categoryId: row.categoryId,
    categorySlug: row.category.slug,
    basePrice: row.basePrice,
    oldPrice: row.oldPrice ?? undefined,
    material: row.materialUz
      ? {
          uz: row.materialUz,
          ru: row.materialRu ?? row.materialUz,
          en: row.materialEn ?? row.materialUz,
        }
      : undefined,
    origin: row.originUz
      ? {
          uz: row.originUz,
          ru: row.originRu ?? row.originUz,
          en: row.originEn ?? row.originUz,
        }
      : undefined,
    status: row.status,
    isFeatured: row.isFeatured,
    variants,
    images,
  };
}

/* ── Queries ────────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameUz: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: { uz: row.nameUz, ru: row.nameRu, en: row.nameEn },
    imageUrl: row.imageUrl ?? undefined,
    sortOrder: row.sortOrder,
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const row = await prisma.category.findUnique({ where: { slug } });
  if (!row) return undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: { uz: row.nameUz, ru: row.nameRu, en: row.nameEn },
    imageUrl: row.imageUrl ?? undefined,
    sortOrder: row.sortOrder,
  };
}

export async function getStores(): Promise<Store[]> {
  const rows = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameUz: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: { uz: row.nameUz, ru: row.nameRu, en: row.nameEn },
    address: { uz: row.addressUz, ru: row.addressRu, en: row.addressEn },
    district: row.district,
    city: row.city,
    phone: row.phone,
    hoursOpen: row.hoursOpen,
    hoursClose: row.hoursClose,
    yandexMapUrl: row.yandexMapUrl ?? undefined,
  }));
}

export async function getPublishedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
  return rows.map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { slug, status: { not: "ARCHIVED" } },
    include: productInclude,
  });
  return row ? toProduct(row) : undefined;
}

/** Slugs for generateStaticParams — deliberately light, no joins. */
export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/**
 * Catalogue search and filtering.
 *
 * Matching happens in Postgres across all three locales plus the SKU, so a
 * Russian-speaking customer on the Uzbek site still finds things and staff can
 * look up an article number. `mode: "insensitive"` keeps it case-blind.
 *
 * This is the simple version. Once the catalogue outgrows a few hundred items
 * it should move to a `tsvector` column with a GIN index (CLAUDE.md §5) —
 * `contains` cannot use an index and will start doing sequential scans.
 */
export async function searchProducts({
  query,
  categorySlug,
  saleOnly,
}: {
  query?: string;
  categorySlug?: string;
  saleOnly?: boolean;
}): Promise<Product[]> {
  const terms = (query ?? "")
    .trim()
    .replace(/['''`ʻʼ]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const rows = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      // Every term must match somewhere — AND of ORs, not a single OR.
      ...(terms.length > 0
        ? {
            AND: terms.map((term) => ({
              OR: [
                { nameUz: { contains: term, mode: "insensitive" as const } },
                { nameRu: { contains: term, mode: "insensitive" as const } },
                { nameEn: { contains: term, mode: "insensitive" as const } },
                { sku: { contains: term, mode: "insensitive" as const } },
              ],
            })),
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });

  const products = rows.map(toProduct);

  /*
   * "On sale" is derived rather than stored: an item is discounted when it has
   * an oldPrice above the current price. One less field for staff to keep in
   * sync, and it cannot drift out of agreement with the price itself.
   */
  return saleOnly
    ? products.filter((p) => p.oldPrice && p.oldPrice > p.basePrice)
    : products;
}

/**
 * Records a search so zero-result queries can be reported back to the client.
 *
 * What customers look for and do not find is free merchandising intelligence —
 * it tells Button what to import (CLAUDE.md §15, §21.4). Failures are
 * swallowed: logging a search must never break the search itself.
 */
export async function logSearch(
  query: string,
  locale: string,
  resultCount: number,
): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    await prisma.searchQuery.create({
      data: { query: trimmed.slice(0, 200), locale, resultCount },
    });
  } catch {
    /* Analytics must never take down a page. */
  }
}

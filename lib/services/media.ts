import "server-only";

import { prisma } from "@/lib/db";
import { getHeroImage as getLocalHeroImage } from "@/lib/brand";
import type { Product } from "@/lib/types";

/**
 * Media resolution.
 *
 * Uploaded images live in Supabase Storage and are recorded in Postgres;
 * files committed under public/ are the fallback. Uploads win, because they
 * are what staff can change without a developer — which is the whole point of
 * the admin panel (CLAUDE.md §13).
 *
 * Components go through this service rather than touching Prisma directly
 * (CLAUDE.md §4).
 */

export async function getHeroImageUrl(): Promise<string | undefined> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "heroImage" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // A missing or unreachable database must not blank the homepage — fall
    // through to whatever is committed on disk.
  }
  return getLocalHeroImage();
}

/**
 * Overlays uploaded photography onto seed products.
 *
 * One query for the whole page rather than one per card: a product grid is the
 * classic N+1, and the catalogue path is the one that has to stay fast under
 * an Instagram spike (CLAUDE.md §21.2).
 */
export async function withUploadedImages(
  products: Product[],
): Promise<Product[]> {
  if (products.length === 0) return products;

  let rows: { slug: string; url: string; altUz: string | null }[] = [];
  try {
    const found = await prisma.productImage.findMany({
      where: { product: { slug: { in: products.map((p) => p.slug) } } },
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
      select: { url: true, altUz: true, product: { select: { slug: true } } },
    });
    rows = found.map((r) => ({
      slug: r.product.slug,
      url: r.url,
      altUz: r.altUz,
    }));
  } catch {
    return products;
  }

  if (rows.length === 0) return products;

  const bySlug = new Map<string, { id: string; url: string; alt?: string }[]>();
  rows.forEach((row, i) => {
    const list = bySlug.get(row.slug) ?? [];
    list.push({ id: `${row.slug}-db-${i}`, url: row.url, alt: row.altUz ?? undefined });
    bySlug.set(row.slug, list);
  });

  return products.map((product) => {
    const uploaded = bySlug.get(product.slug);
    return uploaded ? { ...product, images: uploaded } : product;
  });
}

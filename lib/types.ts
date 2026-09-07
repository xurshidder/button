import type { Locale } from "@/lib/i18n/config";

/**
 * Domain types.
 *
 * These mirror the Prisma models in CLAUDE.md §7 exactly, so that swapping the
 * mock data layer for real database queries is a change of source, not a change
 * of shape. Keep them in sync with `prisma/schema.prisma`.
 */

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** A field translated into all three locales. `uz` is required. */
export type Translated = Record<Locale, string>;

export interface Category {
  id: string;
  slug: string;
  name: Translated;
  sortOrder: number;
}

export interface Store {
  id: string;
  name: Translated;
  address: Translated;
  district: string;
  city: string;
  phone: string;
  hoursOpen: string;
  hoursClose: string;
  yandexMapUrl?: string;
}

/** Stock for one variant at one branch. */
export interface StockLevel {
  storeId: string;
  quantity: number;
}

export interface Variant {
  id: string;
  colorName: Translated;
  colorHex: string;
  size: string;
  priceOverride?: number;
  stock: StockLevel[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  colorName?: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: Translated;
  description?: Translated;
  categoryId: string;
  /** Denormalised for components that must not import the data layer. */
  categorySlug?: string;
  /** Integer so'm. Never a float. */
  basePrice: number;
  /** Original price, for showing a discount. Integer so'm. */
  oldPrice?: number;
  material?: Translated;
  /** e.g. "Turkiya" / "Xitoy" — Button states origin openly (CLAUDE.md §1). */
  origin?: Translated;
  status: ProductStatus;
  isFeatured: boolean;
  variants: Variant[];
  images: ProductImage[];
}

/** Aggregate availability used by cards and badges. */
export type Availability = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

/**
 * Total units across every variant and branch.
 * Cheap because the mock/query layer already has the variants loaded.
 */
export function totalStock(product: Product): number {
  return product.variants.reduce(
    (sum, variant) =>
      sum + variant.stock.reduce((s, level) => s + level.quantity, 0),
    0,
  );
}

/** Threshold at which we nudge urgency without lying about it. */
const LOW_STOCK_THRESHOLD = 5;

export function availabilityOf(product: Product): Availability {
  const total = totalStock(product);
  if (total <= 0) return "OUT_OF_STOCK";
  if (total <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
}

/** Distinct sizes offered, in a sensible retail order. */
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function sizesOf(product: Product): string[] {
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  return sizes.sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    // Numeric sizes (jeans, shoes) fall back to numeric comparison.
    if (ia === -1 && ib === -1) return Number(a) - Number(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/** Whether any branch has this size in stock. */
export function isSizeAvailable(product: Product, size: string): boolean {
  return product.variants
    .filter((v) => v.size === size)
    .some((v) => v.stock.some((s) => s.quantity > 0));
}

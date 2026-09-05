import Link from "next/link";

import { PriceTag } from "@/components/product/PriceTag";
import { ProductImage } from "@/components/product/ProductImage";
import { StockBadge } from "@/components/product/StockBadge";
import type { Locale } from "@/lib/i18n/config";
import { availabilityOf, sizesOf, type Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  locale: Locale;
  t: {
    soum: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    photoPending: string;
    sale: string;
  };
  priority?: boolean;
}

/**
 * The atom of the entire site — build and review this before anything else,
 * at 360px width first (CLAUDE.md §20).
 *
 * Shows price and sizes directly on the card, because the customer's real
 * question is "do they have this in my size, for a price I can afford?"
 * (CLAUDE.md §1). Note it renders aggregate availability only: per-branch stock
 * is loaded on the product page, never per card in a grid (CLAUDE.md §21.2).
 */
export function ProductCard({
  product,
  locale,
  t,
  priority = false,
}: ProductCardProps) {
  const availability = availabilityOf(product);
  const sizes = sizesOf(product);
  const isOut = availability === "OUT_OF_STOCK";

  return (
    <Link
      href={`/${locale}/mahsulot/${product.slug}`}
      className="group flex flex-col gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <div className="relative overflow-hidden rounded-lg">
        <div className={isOut ? "opacity-55 transition" : "transition"}>
          <ProductImage
            src={product.images[0]?.url}
            alt={product.name[locale]}
            pendingLabel={t.photoPending}
            priority={priority}
          />
        </div>

        {product.oldPrice && !isOut ? (
          <span className="absolute left-2 top-2 rounded bg-sale px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            {t.sale}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium leading-snug text-fg group-hover:underline">
          {product.name[locale]}
        </h3>

        <PriceTag
          price={product.basePrice}
          oldPrice={product.oldPrice}
          currencyLabel={t.soum}
          size="md"
        />

        <StockBadge
          availability={availability}
          labels={{
            inStock: t.inStock,
            lowStock: t.lowStock,
            outOfStock: t.outOfStock,
          }}
        />

        {/* Sizes at a glance — the question customers actually arrive with. */}
        {sizes.length > 0 ? (
          <ul className="flex flex-wrap gap-1 pt-0.5">
            {sizes.slice(0, 6).map((size) => (
              <li
                key={size}
                className="tabular rounded border border-border px-1.5 py-0.5 text-[11px] text-fg-muted"
              >
                {size}
              </li>
            ))}
            {sizes.length > 6 ? (
              <li className="px-1 py-0.5 text-[11px] text-fg-muted">
                +{sizes.length - 6}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}

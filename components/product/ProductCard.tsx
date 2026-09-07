import Link from "next/link";

import { PriceTag } from "@/components/product/PriceTag";
import { ProductImage } from "@/components/product/ProductImage";
import { WishlistButton } from "@/components/product/WishlistButton";
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
    wishlistAdd: string;
    wishlistRemove: string;
  };
  priority?: boolean;
}

/**
 * The atom of the entire site — build and review this before anything else,
 * at 360px width first (CLAUDE.md §20).
 *
 * Anatomy follows Uniqlo: full-bleed square-cornered photo, a promotional flag
 * over the image, then name in REGULAR weight, then a bold price. The name is
 * not bold because the photo and the price are what the eye should land on.
 * There is no card border and no shadow — cards sit directly on white so the
 * grid reads as a wall of product, not a wall of boxes.
 *
 * Renders aggregate availability only: per-branch stock is loaded on the
 * product page, never per card in a grid (CLAUDE.md §21.2).
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

  // Distinct colours, in variant order, for the swatch row.
  const swatches = [
    ...new Map(
      product.variants.map((v) => [
        v.colorHex,
        { hex: v.colorHex, name: v.colorName[locale] },
      ]),
    ).values(),
  ];

  return (
    <Link
      href={`/${locale}/mahsulot/${product.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative overflow-hidden">
        <div className={isOut ? "opacity-45" : ""}>
          <ProductImage
            src={product.images[0]?.url}
            alt={product.name[locale]}
            pendingLabel={t.photoPending}
            categorySlug={product.categorySlug}
            priority={priority}
          />
        </div>

        {/* Promotional flag. Red means "promotional" and nothing else. */}
        {product.oldPrice && !isOut ? (
          <span className="absolute left-0 top-0 bg-sale px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {t.sale}
          </span>
        ) : null}

        {isOut ? (
          <span className="absolute left-0 top-0 bg-fg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {t.outOfStock}
          </span>
        ) : null}

        <WishlistButton
          productId={product.id}
          labels={{ add: t.wishlistAdd, remove: t.wishlistRemove }}
          className="absolute right-2 top-2"
        />
      </div>

      <div className="flex flex-col gap-1.5 pt-2.5">
        {/* Regular weight, tight leading — the photo leads, not the label. */}
        <h3 className="text-[13px] font-normal leading-snug text-fg group-hover:underline">
          {product.name[locale]}
        </h3>

        <PriceTag
          price={product.basePrice}
          oldPrice={product.oldPrice}
          currencyLabel={t.soum}
          size="md"
        />

        {swatches.length > 1 ? (
          <ul className="flex flex-wrap items-center gap-1 pt-0.5">
            {swatches.slice(0, 5).map((c) => (
              <li
                key={c.hex}
                title={c.name}
                className="size-3 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </ul>
        ) : null}

        {/* Sizes at a glance — the question customers actually arrive with,
            and something neither Terra Pro nor JUST shows on the card. */}
        {sizes.length > 0 && !isOut ? (
          <p className="tabular text-[11px] leading-snug text-fg-muted">
            {sizes.slice(0, 7).join("  ")}
            {sizes.length > 7 ? ` +${sizes.length - 7}` : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

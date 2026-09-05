"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/types";
import { readWishlist, subscribeWishlist } from "@/lib/wishlist";

interface WishlistGridProps {
  products: Product[];
  locale: Locale;
  catalogHref: string;
  t: {
    empty: string;
    emptyCta: string;
    soum: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    photoPending: string;
    sale: string;
    wishlistAdd: string;
    wishlistRemove: string;
  };
}

/**
 * Renders the saved subset of the catalogue.
 *
 * The full product list arrives from the server and is filtered on the client
 * against localStorage. That is fine at this catalogue size and keeps the page
 * fully static — no per-user server rendering, so it still caches at the edge.
 * If the catalogue grows past a few hundred items this should fetch by id.
 */
export function WishlistGrid({
  products,
  locale,
  catalogHref,
  t,
}: WishlistGridProps) {
  // `null` = not yet read from storage, so we render nothing rather than
  // flashing the empty state at someone who does have saved items.
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setIds(readWishlist());
    sync();
    return subscribeWishlist(sync);
  }, []);

  if (ids === null) {
    return <div className="min-h-64" aria-hidden="true" />;
  }

  const saved = products.filter((p) => ids.includes(p.id));

  if (saved.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-5 py-12 text-center">
        <p className="text-sm text-fg-muted">{t.empty}</p>
        <Link
          href={catalogHref}
          className="rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
      {saved.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          t={t}
        />
      ))}
    </div>
  );
}

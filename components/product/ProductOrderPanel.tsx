"use client";

import { useMemo, useState } from "react";

import { PriceTag } from "@/components/product/PriceTag";
import type { Locale } from "@/lib/i18n/config";
import { formatPhone, telHref } from "@/lib/format";
import { BUTTON_PHONE, buildOrderLink } from "@/lib/telegram";
import { isSizeAvailable, sizesOf, type Product, type Store } from "@/lib/types";

interface ProductOrderPanelProps {
  product: Product;
  stores: Store[];
  locale: Locale;
  productUrl: string;
  t: {
    soum: string;
    sizes: string;
    colors: string;
    availability: string;
    inStock: string;
    outOfStock: string;
    orderTelegram: string;
    orderCall: string;
  };
}

/**
 * The buying surface of the product page.
 *
 * Client component because size and colour selection must update the per-branch
 * stock display and the pre-filled Telegram message without a round trip. It is
 * the only interactive part of the page — everything else stays a Server
 * Component to protect the JS budget (CLAUDE.md §9).
 */
export function ProductOrderPanel({
  product,
  stores,
  locale,
  productUrl,
  t,
}: ProductOrderPanelProps) {
  const sizes = useMemo(() => sizesOf(product), [product]);

  /** Distinct colours, keyed by hex. */
  const colors = useMemo(() => {
    const seen = new Map<string, { hex: string; name: string }>();
    for (const variant of product.variants) {
      if (!seen.has(variant.colorHex)) {
        seen.set(variant.colorHex, {
          hex: variant.colorHex,
          name: variant.colorName[locale],
        });
      }
    }
    return [...seen.values()];
  }, [product, locale]);

  const [color, setColor] = useState(colors[0]?.hex ?? "");
  // Default to the first size that can actually be bought.
  const [size, setSize] = useState(
    () => sizes.find((s) => isSizeAvailable(product, s)) ?? sizes[0] ?? "",
  );

  const selectedVariant = product.variants.find(
    (v) => v.size === size && v.colorHex === color,
  );

  const colorName = colors.find((c) => c.hex === color)?.name;

  const orderHref = buildOrderLink({
    product,
    locale,
    size,
    color: colorName,
    productUrl,
  });

  return (
    <div className="flex flex-col gap-6">
      <PriceTag
        price={product.basePrice}
        oldPrice={product.oldPrice}
        currencyLabel={t.soum}
        size="lg"
      />

      {colors.length > 1 ? (
        <div>
          <h2 className="text-sm font-semibold text-fg">
            {t.colors}
            {colorName ? (
              <span className="ml-2 font-normal text-fg-muted">{colorName}</span>
            ) : null}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.name}
                aria-pressed={c.hex === color}
                className={`size-9 rounded-full border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  c.hex === color
                    ? "border-brand"
                    : "border-border hover:border-fg-muted"
                }`}
              >
                <span
                  className="block size-full rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-fg">{t.sizes}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const available = isSizeAvailable(product, s);
            const isSelected = s === size;
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                aria-pressed={isSelected}
                className={`tabular min-w-11 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  isSelected
                    ? "border-brand bg-brand text-brand-ink"
                    : "border-border text-fg hover:border-fg-muted"
                } ${
                  /* Unavailable sizes stay visible but are clearly struck out —
                     hiding them makes customers think we never stocked them. */
                  available
                    ? ""
                    : "cursor-not-allowed text-out-of-stock line-through opacity-60"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-branch stock for the SELECTED size — our main differentiator over
          Terra Pro (CLAUDE.md §2). */}
      <div>
        <h2 className="text-sm font-semibold text-fg">{t.availability}</h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {stores.map((store) => {
            const qty =
              selectedVariant?.stock.find((s) => s.storeId === store.id)
                ?.quantity ?? 0;
            const has = qty > 0;
            return (
              <li
                key={store.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <span className="text-fg">{store.name[locale]}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={`size-1.5 rounded-full ${
                      has ? "bg-in-stock" : "bg-out-of-stock"
                    }`}
                    aria-hidden="true"
                  />
                  <span className={has ? "text-fg" : "text-fg-muted"}>
                    {has ? t.inStock : t.outOfStock}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/*
        THIS IS THE v1 CHECKOUT (CLAUDE.md §3).
        Two CTAs, always: Telegram primary, phone secondary.
      */}
      <div className="flex flex-col gap-2">
        <a
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg bg-brand px-6 py-4 text-base font-semibold text-brand-ink transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t.orderTelegram}
        </a>
        <a
          href={telHref(BUTTON_PHONE)}
          className="tabular flex items-center justify-center rounded-lg border border-border bg-bg px-6 py-4 text-base font-semibold text-fg transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {formatPhone(BUTTON_PHONE)}
        </a>
      </div>
    </div>
  );
}

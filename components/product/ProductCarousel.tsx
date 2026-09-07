"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/types";

interface ProductCarouselProps {
  products: Product[];
  locale: Locale;
  title: string;
  viewAll: { href: string; label: string };
  labels: { previous: string; next: string };
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
}

/** Square control, surface-filled — the reference's carousel button. */
function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center bg-surface text-fg transition-colors hover:bg-fg hover:text-bg disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d={direction === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

/**
 * Horizontally scrolling product row with prev/next controls.
 *
 * Built on native overflow scrolling with snap points rather than a carousel
 * library: it costs no JavaScript to work, stays swipeable on a phone, and
 * keeps every card in the DOM so the row is still crawlable. The buttons only
 * add a convenience for mouse users, which is why they are hidden on small
 * screens where swiping is the natural gesture.
 *
 * Scrolling by a whole viewport rather than a fixed pixel count keeps the
 * paging honest across the 2/3/4-column breakpoints.
 */
export function ProductCarousel({
  products,
  locale,
  title,
  viewAll,
  labels,
  t,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    // 1px of slack: sub-pixel widths mean scrollLeft rarely lands exactly.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  function scrollByPage(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <>
      {/* Heading, "view all", and the controls share one row, as in the
          reference — the arrows belong to this shelf, not to the page. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {title}
          </h2>
          <Link
            href={viewAll.href}
            className="border-b border-fg pb-0.5 text-[13px] uppercase tracking-[0.08em] text-fg transition-colors hover:border-brand hover:text-brand"
          >
            {viewAll.label}
          </Link>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <ArrowButton
            direction="prev"
            label={labels.previous}
            disabled={atStart}
            onClick={() => scrollByPage(-1)}
          />
          <ArrowButton
            direction="next"
            label={labels.next}
            disabled={atEnd}
            onClick={() => scrollByPage(1)}
          />
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={sync}
        className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-[23.5%]"
          >
            <ProductCard
              product={product}
              locale={locale}
              t={t}
              priority={i < 4}
            />
          </div>
        ))}
      </div>
    </>
  );
}

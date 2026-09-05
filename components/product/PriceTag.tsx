import { discountPercent, formatSoum } from "@/lib/format";

interface PriceTagProps {
  price: number;
  oldPrice?: number;
  /** Localised "so'm" / "сум" / "soum". */
  currencyLabel: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-[15px]",
  lg: "text-2xl sm:text-[28px]",
} as const;

/**
 * Price is a feature, not something to hide (CLAUDE.md §1) — always bold,
 * always visible, never behind an interaction.
 *
 * Follows Uniqlo's convention (CLAUDE.md §20): when an item is discounted the
 * live price turns red and the original sits next to it, struck through. Red
 * means "promotional" and nothing else — it is never decorative.
 *
 * Tabular numerals stop grids from jittering as digit counts change.
 */
export function PriceTag({
  price,
  oldPrice,
  currencyLabel,
  size = "md",
}: PriceTagProps) {
  const discount = discountPercent(price, oldPrice);
  const isDiscounted = discount !== null;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`tabular font-bold ${SIZE_CLASSES[size]} ${
          isDiscounted ? "text-sale" : "text-fg"
        }`}
      >
        {formatSoum(price)}
        <span className="ml-1 text-[0.72em] font-medium">{currencyLabel}</span>
      </span>

      {isDiscounted && oldPrice ? (
        <span className="tabular text-xs text-fg-muted line-through">
          {formatSoum(oldPrice)}
        </span>
      ) : null}
    </div>
  );
}

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
  md: "text-base sm:text-lg",
  lg: "text-2xl sm:text-3xl",
} as const;

/**
 * Price is a feature, not something to hide (CLAUDE.md §1) — so it is always
 * bold, always visible, and never behind an interaction.
 *
 * Uses tabular numerals so prices of different lengths don't make a grid jitter.
 */
export function PriceTag({
  price,
  oldPrice,
  currencyLabel,
  size = "md",
}: PriceTagProps) {
  const discount = discountPercent(price, oldPrice);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`tabular font-bold text-fg ${SIZE_CLASSES[size]}`}>
        {formatSoum(price)}
        <span className="ml-1 text-fg-muted font-medium text-[0.7em]">
          {currencyLabel}
        </span>
      </span>

      {discount !== null && oldPrice ? (
        <>
          <span className="tabular text-sm text-fg-muted line-through">
            {formatSoum(oldPrice)}
          </span>
          <span className="rounded bg-sale px-1.5 py-0.5 text-xs font-semibold text-white">
            −{discount}%
          </span>
        </>
      ) : null}
    </div>
  );
}

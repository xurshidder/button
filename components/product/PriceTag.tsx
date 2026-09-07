import { formatSoum } from "@/lib/format";

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
 * Price is a feature, not something to hide (CLAUDE.md §1) — always visible,
 * never behind an interaction.
 *
 * Discount treatment follows Banana Republic: the original struck through in
 * grey, then the current price in bold BLACK. It used to render the live price
 * in red, which is Uniqlo's convention — but with the reference moved to BR,
 * red on every discounted card turns a warm, quiet grid loud. Red is still the
 * promotional colour; it now lives on the SALE flag over the image, where one
 * mark does the signalling instead of every price.
 */
export function PriceTag({
  price,
  oldPrice,
  currencyLabel,
  size = "md",
}: PriceTagProps) {
  const isDiscounted = Boolean(oldPrice && oldPrice > price);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {isDiscounted && oldPrice ? (
        <span className={`tabular text-fg-muted line-through ${SIZE_CLASSES[size]}`}>
          {formatSoum(oldPrice)}
        </span>
      ) : null}

      <span
        className={`tabular text-fg ${SIZE_CLASSES[size]} ${
          isDiscounted ? "font-bold" : "font-normal"
        }`}
      >
        {formatSoum(price)}
        <span className="ml-1 text-[0.78em] text-fg-muted">{currencyLabel}</span>
      </span>
    </div>
  );
}

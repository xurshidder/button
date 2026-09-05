import type { Availability } from "@/lib/types";

interface StockBadgeProps {
  availability: Availability;
  labels: {
    inStock: string;
    lowStock: string;
    outOfStock: string;
  };
}

/**
 * Stock transparency is our main differentiator over Terra Pro (CLAUDE.md §2).
 *
 * Semantic colours only — the brand colour must never take one of these jobs,
 * which is exactly why they are separate tokens (CLAUDE.md §20).
 */
export function StockBadge({ availability, labels }: StockBadgeProps) {
  const config = {
    IN_STOCK: { color: "bg-in-stock", label: labels.inStock },
    LOW_STOCK: { color: "bg-low-stock", label: labels.lowStock },
    OUT_OF_STOCK: { color: "bg-out-of-stock", label: labels.outOfStock },
  }[availability];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
      <span
        className={`size-1.5 rounded-full ${config.color}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

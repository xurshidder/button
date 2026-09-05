/**
 * Formatting helpers.
 *
 * Money is ALWAYS an integer number of so'm — never a float, never cents.
 * See CLAUDE.md §7 "Hard rules".
 */

/**
 * Formats a so'm amount with space-separated thousands: 1290000 -> "1 290 000".
 *
 * Deliberately does NOT use Intl.NumberFormat: the ICU output for these locales
 * varies by runtime (and between server and browser), which produces React
 * hydration mismatches. Manual grouping is deterministic everywhere.
 *
 * Uses a non-breaking space so a price never wraps across two lines.
 */
export function formatSoum(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Discount as a positive whole percentage, or null when there is no discount. */
export function discountPercent(
  price: number,
  oldPrice: number | null | undefined,
): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** "+998946135555" -> "+998 94 613 55 55" */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const m = /^998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(digits);
  if (!m) return raw;
  return `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
}

/** Strips formatting for use in a `tel:` href. */
export function telHref(raw: string): string {
  return `tel:+${raw.replace(/\D/g, "")}`;
}

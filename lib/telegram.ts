import type { Locale } from "@/lib/i18n/config";
import { formatSoum } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Button's public channels. Real, verified values. */
export const BUTTON_TELEGRAM = "button_uzbekistan";
export const BUTTON_INSTAGRAM = "button_uz";
export const BUTTON_FACEBOOK = "button.uzbekistan";
export const BUTTON_PHONE = "998946135555";

const CURRENCY_LABEL: Record<Locale, string> = {
  uz: "so'm",
  ru: "сум",
  en: "soum",
};

interface OrderLinkArgs {
  product: Product;
  locale: Locale;
  size?: string;
  color?: string;
  /** Absolute URL of the product page, so staff can open exactly what was viewed. */
  productUrl?: string;
}

/**
 * Builds a Telegram deep link with the order details pre-filled.
 *
 * This IS the v1 checkout (CLAUDE.md §3). Button already sells through chat, so
 * the site's job is to hand the conversation over with everything the shop
 * assistant needs already typed — turning "how much is this?" into a message
 * they can act on immediately.
 */
export function buildOrderLink({
  product,
  locale,
  size,
  color,
  productUrl,
}: OrderLinkArgs): string {
  const lines = [
    `${product.name[locale]}`,
    `${product.sku}`,
    size ? `${size}` : null,
    color ? `${color}` : null,
    `${formatSoum(product.basePrice)} ${CURRENCY_LABEL[locale]}`,
    productUrl ?? null,
  ].filter((line): line is string => Boolean(line));

  return `https://t.me/${BUTTON_TELEGRAM}?text=${encodeURIComponent(lines.join("\n"))}`;
}

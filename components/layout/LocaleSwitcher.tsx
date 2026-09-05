"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  localeShortNames,
  locales,
  type Locale,
} from "@/lib/i18n/config";

interface LocaleSwitcherProps {
  current: Locale;
}

/**
 * Client component: it needs the current pathname to preserve the page the
 * visitor is on when they switch language (CLAUDE.md §8).
 *
 * Renders real links rather than a JS-driven dropdown so it works without
 * hydration and so crawlers can follow every locale.
 */
export function LocaleSwitcher({ current }: LocaleSwitcherProps) {
  const pathname = usePathname();

  // "/uz/katalog" -> "/katalog"
  const rest = pathname.replace(/^\/[^/]+/, "") || "";

  return (
    <nav
      aria-label="Language"
      className="flex items-center rounded-full border border-border p-0.5"
    >
      {locales.map((locale) => {
        const isActive = locale === current;
        return (
          <Link
            key={locale}
            href={`/${locale}${rest}`}
            hrefLang={locale}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              isActive
                ? "bg-brand text-brand-ink"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {localeShortNames[locale]}
          </Link>
        );
      })}
    </nav>
  );
}

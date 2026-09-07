"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { localeShortNames, locales, type Locale } from "@/lib/i18n/config";

interface LocaleSwitcherProps {
  current: Locale;
}

/**
 * Compact language switcher: one button showing the active locale, opening a
 * short menu with the other two.
 *
 * Three side-by-side pills cost real width in a header that already carries a
 * wordmark, six category links and a search field — and language is a
 * set-once decision, so it does not deserve permanent space.
 *
 * Still renders real `<Link>`s rather than a JS-driven change, so each locale
 * remains a crawlable URL and the current path is preserved across the switch
 * (CLAUDE.md §8).
 */
export function LocaleSwitcher({ current }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // "/uz/katalog" -> "/katalog", so switching keeps the visitor in place.
  const rest = pathname.replace(/^\/[^/]+/, "") || "";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const others = locales.filter((locale) => locale !== current);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Language"
        className="flex h-10 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {localeShortNames[current]}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3 text-fg-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[4.5rem] overflow-hidden rounded-xl border border-border bg-bg py-1 shadow-lg"
        >
          {others.map((locale) => (
            <Link
              key={locale}
              href={`/${locale}${rest}`}
              hrefLang={locale}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 text-xs font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {localeShortNames[locale]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

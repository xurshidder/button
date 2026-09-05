import Link from "next/link";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { formatPhone, telHref } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { BUTTON_PHONE } from "@/lib/telegram";

interface HeaderProps {
  locale: Locale;
  t: {
    catalog: string;
    stores: string;
    about: string;
    contact: string;
    tagline: string;
  };
}

export function Header({ locale, t }: HeaderProps) {
  const nav = [
    { href: `/${locale}/katalog`, label: t.catalog },
    { href: `/${locale}/dokonlar`, label: t.stores },
    { href: `/${locale}/biz-haqimizda`, label: t.about },
    { href: `/${locale}/aloqa`, label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:h-16">
        {/*
          PLACEHOLDER WORDMARK — replaced by the real logo once the client
          supplies it (CLAUDE.md §17 ask #1).
        */}
        <Link
          href={`/${locale}`}
          className="shrink-0 text-lg font-bold tracking-tight text-fg sm:text-xl"
        >
          BUTTON
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-fg-muted transition hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Phone-first support: this is how Button's customers already buy. */}
          <a
            href={telHref(BUTTON_PHONE)}
            className="tabular hidden text-sm font-medium text-fg transition hover:text-brand lg:block"
          >
            {formatPhone(BUTTON_PHONE)}
          </a>
          <LocaleSwitcher current={locale} />
        </div>
      </div>

      {/* Mobile nav: horizontally scrollable, thumb-friendly targets. */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-fg-muted transition hover:bg-surface hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

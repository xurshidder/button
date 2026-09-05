import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { SearchBar } from "@/components/layout/SearchBar";
import { formatPhone, telHref } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { BUTTON_PHONE } from "@/lib/telegram";

interface HeaderProps {
  locale: Locale;
  /** Logo artwork path, when public/brand/ contains it. */
  logoSrc?: string;
  t: {
    catalog: string;
    stores: string;
    about: string;
    contact: string;
    wishlist: string;
    account: string;
    search: string;
    searchPlaceholder: string;
  };
}

/** Icon button — consistent 44px tap target, pill hover (CLAUDE.md §20). */
function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </Link>
  );
}

export function Header({ locale, logoSrc, t }: HeaderProps) {
  const nav = [
    { href: `/${locale}/katalog`, label: t.catalog },
    { href: `/${locale}/dokonlar`, label: t.stores },
    { href: `/${locale}/biz-haqimizda`, label: t.about },
    { href: `/${locale}/aloqa`, label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:gap-5">
        <Link
          href={`/${locale}`}
          aria-label="Button"
          className="flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo src={logoSrc} height={26} />
        </Link>

        {/* Search takes the free space — it is a primary way to browse a
            catalogue this size, not an afterthought behind an icon. */}
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar
            locale={locale}
            placeholder={t.searchPlaceholder}
            label={t.search}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href={telHref(BUTTON_PHONE)}
            className="tabular hidden whitespace-nowrap text-sm font-medium text-fg transition hover:text-brand xl:block"
          >
            {formatPhone(BUTTON_PHONE)}
          </a>

          {/* Favourites — works with no account, stored per browser. */}
          <IconLink href={`/${locale}/saralangan`} label={t.wishlist}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M12 20.5s-7.5-4.6-7.5-9.6a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5-7.5 9.6-7.5 9.6Z" />
            </svg>
          </IconLink>

          <IconLink href={`/${locale}/hisobim`} label={t.account}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8.5" r="3.75" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
            </svg>
          </IconLink>

          <LocaleSwitcher current={locale} />
        </div>
      </div>

      {/* Mobile: search on its own row so it stays full width and tappable. */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar
          locale={locale}
          placeholder={t.searchPlaceholder}
          label={t.search}
        />
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

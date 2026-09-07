import Link from "next/link";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import type { Locale } from "@/lib/i18n/config";

interface NavItem {
  href: string;
  label: string;
  /** Rendered in the sale colour, the way Banana Republic flags SALE. */
  isSale?: boolean;
}

interface HeaderProps {
  locale: Locale;
  logoSrc?: string;
  nav: NavItem[];
  t: {
    wishlist: string;
    account: string;
    search: string;
    searchPlaceholder: string;
  };
}

/** Icon button — 44px tap target, pill hover. */
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
      className="flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </Link>
  );
}

/**
 * Header in the Banana Republic arrangement: wordmark hard left, category links
 * inline across the middle, search on the right.
 *
 * The categories sit in the header rather than behind a menu because this
 * catalogue is shallow — putting them one tap away is worth more than the
 * whitespace a hamburger would buy.
 */
export function Header({ locale, logoSrc, nav, t }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 lg:h-[72px] lg:px-8">
        <Link
          href={`/${locale}`}
          aria-label="Button"
          className="flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo src={logoSrc} height={27} variant="wordmark" />
        </Link>

        {/* Inline category nav — uppercase and letterspaced, BR's treatment. */}
        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex xl:gap-8"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-display whitespace-nowrap text-[15px] uppercase tracking-[0.1em] transition-colors hover:text-brand ${
                item.isSale ? "text-sale" : "text-fg"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <div className="hidden w-52 lg:block">
            <SearchBar
              locale={locale}
              placeholder={t.searchPlaceholder}
              label={t.search}
              variant="underline"
            />
          </div>

          <IconLink href={`/${locale}/saralangan`} label={t.wishlist}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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
              strokeWidth="1.5"
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

      {/* Mobile: search full width, then the same categories as a scroll row. */}
      <div className="px-4 pb-3 lg:hidden">
        <SearchBar
          locale={locale}
          placeholder={t.searchPlaceholder}
          label={t.search}
          variant="pill"
        />
      </div>

      <nav
        aria-label="Categories"
        className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2.5 xl:hidden"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-display whitespace-nowrap text-[13px] uppercase tracking-[0.1em] transition-colors hover:text-brand ${
              item.isSale ? "text-sale" : "text-fg-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

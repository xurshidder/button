import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { formatPhone, telHref } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { BUTTON_TELEGRAM } from "@/lib/telegram";

interface FooterProps {
  locale: Locale;
  logoSrc?: string;
  /** Category links, so the footer doubles as a second route into the catalogue. */
  categories: { href: string; label: string }[];
  phone: string;
  t: {
    tagline: string;
    help: string;
    company: string;
    findUs: string;
    catalogTitle: string;
    workingHours: string;
    everyDay: string;
    rights: string;
    contact: string;
    stores: string;
    about: string;
    wishlist: string;
    account: string;
    allCategories: string;
  };
}

/** One column of links. */
function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-fg">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

/**
 * Footer in the Banana Republic arrangement: several link columns, then social
 * icons, then a legal strip.
 *
 * Every link here goes to a page that exists. A footer full of dead links is
 * worse than a short one — it is the clearest signal a site is unfinished, and
 * this one is meant to convince a customer that Button is a real shop.
 * Delivery, returns and size-guide columns arrive with the pages themselves.
 */
export function Footer({
  locale,
  logoSrc,
  categories,
  phone,
  t,
}: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-1">
            <Logo src={logoSrc} height={24} />
            <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
              {t.tagline}
            </p>
            <a
              href={telHref(phone)}
              className="tabular mt-4 block text-sm font-semibold text-fg transition-colors hover:text-brand"
            >
              {formatPhone(phone)}
            </a>
          </div>

          <Column title={t.help}>
            <Item href={`/${locale}/aloqa`}>{t.contact}</Item>
            <Item href={`/${locale}/dokonlar`}>{t.stores}</Item>
            <Item href={`/${locale}/saralangan`}>{t.wishlist}</Item>
            <Item href={`/${locale}/hisobim`}>{t.account}</Item>
          </Column>

          <Column title={t.catalogTitle}>
            {categories.slice(0, 5).map((category) => (
              <Item key={category.href} href={category.href}>
                {category.label}
              </Item>
            ))}
            <Item href={`/${locale}/katalog`}>{t.allCategories}</Item>
          </Column>

          <Column title={t.company}>
            <Item href={`/${locale}/biz-haqimizda`}>{t.about}</Item>
            <Item href={`/${locale}/dokonlar`}>{t.stores}</Item>
          </Column>

          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-fg">
              {t.findUs}
            </h2>
            <SocialLinks className="mt-4" />

            <p className="mt-5 text-[13px] font-semibold text-fg">
              {t.workingHours}
            </p>
            <p className="tabular mt-1 text-[13px] text-fg-muted">
              {t.everyDay} 10:00 — 23:00
            </p>

            <a
              href={`https://t.me/${BUTTON_TELEGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-brand-ink transition hover:bg-brand-hover"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-5 text-xs text-fg-muted lg:px-8">
          <span>© {new Date().getFullYear()} Button.</span>
          <span>{t.rights}.</span>
        </div>
      </div>
    </footer>
  );
}

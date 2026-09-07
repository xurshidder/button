import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SocialLinks } from "@/components/layout/SocialLinks";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stores } from "@/lib/mock-data";
import { BUTTON_PHONE, BUTTON_TELEGRAM } from "@/lib/telegram";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/aloqa">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.contact.title,
    description: dict.contact.lead,
    alternates: {
      canonical: `/${locale}/aloqa`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/aloqa`])),
    },
  };
}

/**
 * Contact page.
 *
 * Deliberately no contact form. v1 stores no customer personal data at all
 * (CLAUDE.md §21.3), and a form would create a message queue nobody has agreed
 * to staff. Telegram and the phone are where Button already answers, so the
 * page routes people there instead of inventing a channel.
 */
export default async function ContactPage({
  params,
}: PageProps<"/[locale]/aloqa">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.contact.title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
        {dict.contact.lead}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`https://t.me/${BUTTON_TELEGRAM}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand px-7 py-4 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
        >
          Telegram
        </a>
        <a
          href={telHref(BUTTON_PHONE)}
          className="tabular border border-fg px-7 py-4 text-sm font-bold text-fg transition hover:bg-fg hover:text-bg"
        >
          {formatPhone(BUTTON_PHONE)}
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-fg">
          {dict.contact.social}
        </h2>
        <SocialLinks className="mt-4" />
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-fg">
          {dict.nav.stores}
        </h2>
        <ul className="mt-4 grid gap-px overflow-hidden border border-fg bg-fg sm:grid-cols-2">
          {stores.map((store) => (
            <li key={store.id} className="bg-bg p-5">
              <h3 className="text-sm font-bold text-fg">
                {store.name[typedLocale]}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                {store.address[typedLocale]}
              </p>
              <p className="tabular mt-2 text-xs text-fg-muted">
                {dict.stores.everyDay} {store.hoursOpen} — {store.hoursClose}
              </p>
            </li>
          ))}
        </ul>
        <Link
          href={`/${locale}/dokonlar`}
          className="mt-4 inline-block text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {dict.storesPage.title} →
        </Link>
      </section>
    </div>
  );
}

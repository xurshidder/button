import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatPhone, telHref } from "@/lib/format";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stores } from "@/lib/mock-data";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dokonlar">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.storesPage.title,
    description: dict.storesPage.subtitle,
    alternates: {
      canonical: `/${locale}/dokonlar`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/dokonlar`])),
    },
  };
}

/**
 * Store locator.
 *
 * Button's real advantage over a marketplace is being a shop with an address
 * you can walk into (CLAUDE.md §2), so this page is a first-class destination
 * rather than a line in the footer. Every branch is click-to-call, because
 * phone is how this business already sells.
 */
export default async function StoresPage({
  params,
}: PageProps<"/[locale]/dokonlar">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.storesPage.title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
        {dict.storesPage.subtitle}
      </p>

      <ul className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <li key={store.id} className="flex flex-col gap-3 bg-bg p-6">
            <h2 className="text-base font-bold text-fg">
              {store.name[typedLocale]}
            </h2>

            <dl className="flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.06em] text-fg-muted">
                  {dict.storesPage.address}
                </dt>
                <dd className="mt-0.5 leading-relaxed text-fg">
                  {store.address[typedLocale]}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-[0.06em] text-fg-muted">
                  {dict.storesPage.hours}
                </dt>
                <dd className="tabular mt-0.5 text-fg">
                  {dict.stores.everyDay} {store.hoursOpen} — {store.hoursClose}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <a
                href={telHref(store.phone)}
                className="tabular border border-fg px-4 py-2.5 text-xs font-bold text-fg transition hover:bg-fg hover:text-bg"
              >
                {formatPhone(store.phone)}
              </a>
              {store.yandexMapUrl ? (
                <a
                  href={store.yandexMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-border px-4 py-2.5 text-xs font-medium text-fg transition hover:border-fg"
                >
                  {dict.stores.viewOnMap}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

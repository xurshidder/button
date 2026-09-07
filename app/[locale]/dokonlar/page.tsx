import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatPhone, telHref } from "@/lib/format";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stores } from "@/lib/mock-data";
import { BUTTON_TELEGRAM } from "@/lib/telegram";

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

/** Small labelled row inside a store card. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-fg">{children}</dd>
    </div>
  );
}

export default async function StoresPage({
  params,
}: PageProps<"/[locale]/dokonlar">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;

  /**
   * LocalBusiness structured data, one entry per branch.
   *
   * This is what puts opening hours and addresses into Google and Yandex
   * results — for a business whose customers search "erkaklar kiyim do'koni
   * Chilonzor", the store locator is a genuine acquisition channel, not just
   * an info page.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": stores.map((store) => ({
      "@type": "ClothingStore",
      name: store.name[typedLocale],
      address: {
        "@type": "PostalAddress",
        streetAddress: store.address[typedLocale],
        addressLocality: store.city,
        addressCountry: "UZ",
      },
      telephone: `+${store.phone}`,
      openingHours: `Mo-Su ${store.hoursOpen}-${store.hoursClose}`,
      ...(store.yandexMapUrl ? { hasMap: store.yandexMapUrl } : {}),
    })),
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <script
        type="application/ld+json"
        // Serialising our own static object; no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.storesPage.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
        {dict.storesPage.subtitle}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex flex-col rounded-2xl border border-border p-5 transition hover:border-fg"
          >
            <h2 className="text-base font-bold text-fg">
              {store.name[typedLocale]}
            </h2>
            <p className="mt-0.5 text-xs text-fg-muted">
              {store.district}, {store.city}
            </p>

            <dl className="mt-4 flex flex-col gap-3">
              <Detail label={dict.storesPage.address}>
                {store.address[typedLocale]}
              </Detail>

              <Detail label={dict.storesPage.hours}>
                <span className="tabular">
                  {dict.stores.everyDay} {store.hoursOpen} — {store.hoursClose}
                </span>
              </Detail>

              <Detail label={dict.storesPage.phone}>
                <a
                  href={telHref(store.phone)}
                  className="tabular font-medium underline-offset-4 hover:underline"
                >
                  {formatPhone(store.phone)}
                </a>
              </Detail>
            </dl>

            {/* Amenities confirmed on the Yandex Maps listing. */}
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {[
                dict.storesPage.payment,
                dict.storesPage.delivery,
                dict.storesPage.pickup,
              ].map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium text-fg-muted"
                >
                  {amenity}
                </li>
              ))}
            </ul>

            {/* mt-auto keeps the buttons aligned across cards of unequal height. */}
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <a
                href={telHref(store.phone)}
                className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-brand-ink transition hover:bg-brand-hover"
              >
                {dict.stores.call}
              </a>
              {store.yandexMapUrl ? (
                <a
                  href={store.yandexMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-fg px-5 py-2.5 text-xs font-bold text-fg transition hover:bg-fg hover:text-bg"
                >
                  {dict.stores.viewOnMap}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl bg-surface p-6">
        <p className="text-sm text-fg-muted">{dict.contact.orderNote}</p>
        <a
          href={`https://t.me/${BUTTON_TELEGRAM}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-full bg-brand px-7 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
        >
          Telegram
        </a>
      </div>
    </div>
  );
}

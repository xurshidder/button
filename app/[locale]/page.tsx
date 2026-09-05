import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categories, getFeaturedProducts, stores } from "@/lib/mock-data";
import { BUTTON_PHONE } from "@/lib/telegram";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const featured = getFeaturedProducts();

  const cardStrings = {
    soum: dict.product.soum,
    inStock: dict.product.inStock,
    lowStock: dict.product.lowStock,
    outOfStock: dict.product.outOfStock,
    photoPending: dict.product.photoPending,
    sale: dict.product.sale,
  };

  return (
    <>
      {/*
        HERO — deliberately compact. This is not a luxury brand site; a
        full-screen silent hero would push the actual products below the fold
        and signal "expensive" (CLAUDE.md §1, §20).
      */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-muted">
            {dict.brand.tagline}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-fg-muted sm:text-base">
            {dict.hero.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/katalog`}
              className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/dokonlar`}
              className="rounded-lg border border-border bg-bg px-5 py-3 text-sm font-semibold text-fg transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-bold tracking-tight text-fg">
          {dict.sections.categories}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/${locale}/katalog/${category.slug}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 text-sm font-medium text-fg transition hover:border-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {category.name[typedLocale]}
                <span aria-hidden="true" className="text-fg-muted">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* NEW ARRIVALS — dense grid: 2 columns on mobile, 4 on desktop (§20). */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-fg">
            {dict.sections.newArrivals}
          </h2>
          <Link
            href={`/${locale}/katalog`}
            className="text-sm font-medium text-fg-muted underline-offset-4 transition hover:text-fg hover:underline"
          >
            {dict.sections.viewAll}
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={typedLocale}
              t={cardStrings}
              priority={i < 2}
            />
          ))}
        </div>
      </section>

      {/* STORES — Button's real advantage over a marketplace is being a real
          shop with a real address (CLAUDE.md §2). */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-xl font-bold tracking-tight text-fg">
            {dict.sections.ourStores}
          </h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <li
                key={store.id}
                className="rounded-lg border border-border bg-bg p-4"
              >
                <h3 className="text-sm font-semibold text-fg">
                  {store.name[typedLocale]}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                  {store.address[typedLocale]}
                </p>
                <p className="tabular mt-2 text-xs text-fg-muted">
                  {dict.stores.everyDay} {store.hoursOpen} — {store.hoursClose}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={telHref(store.phone)}
                    className="tabular rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface"
                  >
                    {formatPhone(store.phone)}
                  </a>
                  {store.yandexMapUrl ? (
                    <a
                      href={store.yandexMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface"
                    >
                      {dict.stores.viewOnMap}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <p className="tabular mt-6 text-sm text-fg-muted">
            {dict.footer.contactUs}:{" "}
            <a
              href={telHref(BUTTON_PHONE)}
              className="font-medium text-fg underline-offset-4 hover:underline"
            >
              {formatPhone(BUTTON_PHONE)}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

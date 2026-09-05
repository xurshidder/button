import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/catalog/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categories, getFeaturedProducts, stores } from "@/lib/mock-data";

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
        HERO — full-bleed banner, the Uniqlo pattern. Deliberately compact in
        height: a full-screen silent hero pushes product below the fold and
        signals "expensive", which is wrong for this business (CLAUDE.md §1).

        Currently a brand-purple panel. When Button supplies a campaign photo,
        this becomes a background image with the same text block over it.
      */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-12 sm:py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink/70">
            {dict.brand.tagline}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="max-w-xl text-sm text-brand-ink/80 sm:text-base">
            {dict.hero.subtitle}
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/katalog`}
              className="bg-bg px-7 py-3.5 text-sm font-bold text-fg transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/dokonlar`}
              className="border border-brand-ink/40 px-7 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES — image tiles, not a text directory. */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:py-14">
        <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
          {dict.sections.categories}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, i) => (
            <CategoryTile
              key={category.id}
              href={`/${locale}/katalog/${category.slug}`}
              label={category.name[typedLocale]}
              priority={i < 4}
            />
          ))}
        </div>
      </section>

      {/*
        NEW ARRIVALS — dense grid, tight gutters, no card chrome. 2 columns on
        mobile and 4 on desktop, so the page reads as a wall of product.
      */}
      <section className="mx-auto max-w-[1400px] px-4 pb-12">
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-8">
          <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {dict.sections.newArrivals}
          </h2>
          <Link
            href={`/${locale}/katalog`}
            className="text-[13px] font-medium text-fg underline-offset-4 hover:underline"
          >
            {dict.sections.viewAll} →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
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
        <div className="mx-auto max-w-[1400px] px-4 py-12">
          <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {dict.sections.ourStores}
          </h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <li key={store.id} className="bg-bg p-5">
                <h3 className="text-sm font-bold text-fg">
                  {store.name[typedLocale]}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {store.address[typedLocale]}
                </p>
                <p className="tabular mt-2 text-xs text-fg-muted">
                  {dict.stores.everyDay} {store.hoursOpen} — {store.hoursClose}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={telHref(store.phone)}
                    className="tabular border border-fg px-3 py-2 text-xs font-bold text-fg transition hover:bg-fg hover:text-bg"
                  >
                    {formatPhone(store.phone)}
                  </a>
                  {store.yandexMapUrl ? (
                    <a
                      href={store.yandexMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border px-3 py-2 text-xs font-medium text-fg transition hover:border-fg"
                    >
                      {dict.stores.viewOnMap}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

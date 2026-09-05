import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/catalog/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHeroImage } from "@/lib/brand";
import { categories, getFeaturedProducts, stores } from "@/lib/mock-data";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const featured = getFeaturedProducts();
  const heroImage = getHeroImage();

  const cardStrings = {
    soum: dict.product.soum,
    inStock: dict.product.inStock,
    lowStock: dict.product.lowStock,
    outOfStock: dict.product.outOfStock,
    photoPending: dict.product.photoPending,
    sale: dict.product.sale,
    wishlistAdd: dict.wishlist.add,
    wishlistRemove: dict.wishlist.remove,
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
      <section className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="brand-gradient relative overflow-hidden rounded-3xl">
          {heroImage ? (
            <>
              {/*
                Campaign photo sits behind the headline. Anchored to the right
                so the model stays in frame while the copy occupies the left —
                a centred portrait would put the model's face under the text.
              */}
              <Image
                src={heroImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-[75%_center] md:object-[70%_center]"
              />
              {/*
                Purple scrim, opaque on the left and clearing to the right.
                The supplied photography has a pale background, so white text
                needs this to stay readable — and it keeps the hero on-brand
                instead of turning into a stock photo with words on it.
              */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-brand via-brand/85 to-brand/10 md:via-brand/70 md:to-transparent"
              />
              {/* Extra bottom darkening for small screens, where the text
                  column overlaps far more of the image. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand/80 to-transparent md:hidden"
              />
            </>
          ) : (
            /* No campaign photo yet — soft highlight keeps the flat gradient
               from looking like a plain block of colour. */
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-white/10 blur-3xl"
            />
          )}

          <div
            className={`relative mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-14 sm:px-10 sm:py-20 md:py-24 ${
              heroImage ? "min-h-[440px] justify-end md:min-h-[520px] md:justify-center" : ""
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink/70">
              {dict.brand.tagline}
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="max-w-xl text-sm text-brand-ink/80 sm:text-base">
              {dict.hero.subtitle}
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/katalog`}
                className="rounded-full bg-bg px-8 py-3.5 text-sm font-bold text-fg transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${locale}/dokonlar`}
                className="rounded-full border border-brand-ink/40 px-8 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*
        CATEGORIES — Uniqlo's "Search by category" pattern: cut-out garments
        floating on white in a wide, shallow grid, with a pill button below.
        Six across on desktop keeps it a browsing row rather than a wall.
      */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:py-16">
        <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
          {dict.sections.categories}
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((category, i) => (
            <CategoryTile
              key={category.id}
              href={`/${locale}/katalog/${category.slug}`}
              label={category.name[typedLocale]}
              priority={i < 6}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={`/${locale}/katalog`}
            className="rounded-full border border-fg px-12 py-3.5 text-sm font-medium text-fg transition hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {dict.sections.allCategories}
          </Link>
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
              <li key={store.id} className="rounded-2xl bg-bg p-5">
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
                    className="tabular rounded-full border border-fg px-4 py-2 text-xs font-bold text-fg transition hover:bg-fg hover:text-bg"
                  >
                    {formatPhone(store.phone)}
                  </a>
                  {store.yandexMapUrl ? (
                    <a
                      href={store.yandexMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-4 py-2 text-xs font-medium text-fg transition hover:border-fg"
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

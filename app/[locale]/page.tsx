import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/catalog/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHeroImageUrl, withUploadedImages } from "@/lib/services/media";
import { categories, getFeaturedProducts, stores } from "@/lib/mock-data";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const featured = await withUploadedImages(getFeaturedProducts());
  const heroImage = await getHeroImageUrl();

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
      <section>
        <div
          className={`relative overflow-hidden ${heroImage ? "" : "brand-gradient"}`}
        >
          {heroImage ? (
            <>
              {/*
                Full-bleed campaign photograph. Anchored right of centre so the
                model stays in frame while the copy occupies the lower left.
              */}
              <Image
                src={heroImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-[68%_center] md:object-[60%_center]"
              />
              {/*
                Neutral scrim rather than a purple one. Banana Republic lets the
                photograph keep its own colour and darkens only enough to carry
                white type; tinting the whole frame purple would fight the
                garment, which is the thing being sold.
              */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"
              />
            </>
          ) : (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-white/10 blur-3xl"
            />
          )}

          {/*
            Text block sits bottom-left over the image. Height is capped well
            short of a full screen: an editorial hero that fills the viewport
            pushes priced product below the fold, which is the wrong trade for
            this business (CLAUDE.md §1).
          */}
          <div className="relative mx-auto flex min-h-[520px] max-w-[1600px] flex-col justify-end px-6 pb-12 pt-24 sm:min-h-[600px] sm:px-10 sm:pb-16 lg:min-h-[660px] lg:px-16 lg:pb-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
              {dict.hero.eyebrow}
            </p>

            {/* Serif, matching the reference — BR sets its campaign headline in
                Didot while the eyebrow and buttons stay sans. */}
            <h1 className="font-display mt-3 max-w-2xl text-4xl font-normal leading-[1.08] text-white sm:text-5xl lg:text-[64px]">
              {dict.hero.campaign}
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-[15px]">
              {dict.hero.subtitle}
            </p>

            {/* Three square CTAs, evenly weighted — Banana Republic's pattern. */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/${locale}/katalog`}
                className="min-w-[220px] bg-white px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-fg transition hover:bg-brand hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.hero.ctaNew}
              </Link>
              <Link
                href={`/${locale}/katalog`}
                className="min-w-[220px] bg-white px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-fg transition hover:bg-brand hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.hero.ctaCatalog}
              </Link>
              <Link
                href={`/${locale}/dokonlar`}
                className="min-w-[220px] bg-white px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-fg transition hover:bg-brand hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.hero.ctaStores}
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

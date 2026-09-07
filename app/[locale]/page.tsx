import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTile } from "@/components/catalog/CategoryTile";
import { CampaignMosaic } from "@/components/home/CampaignMosaic";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { formatPhone, telHref } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCampaignImages } from "@/lib/brand";
import { getHeroImageUrl } from "@/lib/services/media";
import { getCategories, getFeaturedProducts, getStores } from "@/lib/services/catalog";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const [featured, categories, stores] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getStores(),
  ]);
  const heroImage = await getHeroImageUrl();
  const campaignImages = getCampaignImages();

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
        HERO — pinned while the page scrolls past it.
        The section is taller than the viewport; the panel inside is sticky, so
        the photograph and copy hold still, then release as the next section
        pushes them up. Done with `position: sticky` rather than a scroll
        listener: no JavaScript, nothing to jank on a mid-range Android, and it
        degrades to an ordinary hero if sticky is unavailable.
      */}
      <section className="relative h-[112vh] sm:h-[115vh]">
        <div
          className={`sticky top-0 h-screen overflow-hidden ${heroImage ? "" : "brand-gradient"}`}
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
                /*
                  Anchored above centre. The hero is far wider than any normal
                  photograph, so object-cover crops top and bottom — and a
                  centred crop is what decapitates a standing model. Holding at
                  35% keeps the head in frame across the usual compositions.
                */
                className="object-cover object-[center_35%]"
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

          {/* Copy sits bottom-left over the image and fades on release. */}
          <div className="hero-copy relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-14 pt-24 sm:px-10 sm:pb-20 lg:px-16">
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
        CATEGORIES — Banana Republic's pattern: tall photographs running nearly
        edge to edge, each with an uppercase name and an underlined link
        beneath. Four across on desktop so each tile is large enough for the
        photograph to do the selling; two on mobile.
      */}
      <section className="surface-fade py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-x-1 gap-y-10 px-1 md:grid-cols-4">
          {categories.slice(0, 4).map((category, i) => (
            <CategoryTile
              key={category.id}
              href={`/${locale}/katalog/${category.slug}`}
              label={category.name[typedLocale]}
              shopNowLabel={dict.sections.shopNow}
              slug={category.slug}
              priority={i < 4}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center px-4">
          <Link
            href={`/${locale}/katalog`}
            className="border border-fg px-14 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-fg transition hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {dict.sections.allCategories}
          </Link>
        </div>
      </section>

      <CampaignMosaic
        href={`/${locale}/katalog`}
        images={campaignImages}
        t={{
          eyebrow: dict.campaign.eyebrow,
          title: dict.campaign.title,
          text: dict.campaign.text,
          cta: dict.campaign.cta,
        }}
      />

      {/*
        NEW ARRIVALS — a scrolling row rather than a static grid, so the shelf
        can hold more than four without pushing the rest of the page down.
      */}
      <section className="mx-auto max-w-[1600px] px-4 pb-12 pt-16 lg:px-8">
        <ProductCarousel
          products={featured}
          locale={typedLocale}
          title={dict.sections.newArrivals}
          viewAll={{
            href: `/${locale}/katalog`,
            label: dict.sections.viewAll,
          }}
          labels={{
            previous: dict.sections.previous,
            next: dict.sections.next,
          }}
          t={cardStrings}
        />
      </section>

      {/* STORES — Button's real advantage over a marketplace is being a real
          shop with a real address (CLAUDE.md §2). */}
      <section className="brand-fade border-t border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-12">
          <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {dict.sections.ourStores}
          </h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <li key={store.id} className="border border-fg bg-bg p-5">
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
                  {/* Square, black-ruled buttons — the reference uses hard
                      corners throughout its store and footer chrome. */}
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
                      className="border border-fg px-4 py-2.5 text-xs font-medium text-fg transition hover:bg-fg hover:text-bg"
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductImage } from "@/components/product/ProductImage";
import { ProductOrderPanel } from "@/components/product/ProductOrderPanel";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  getCategoryById,
  getProductBySlug,
  getPublishedProducts,
  stores,
} from "@/lib/mock-data";
import { withUploadedImages } from "@/lib/services/media";

/** Pre-render every published product in every locale (CLAUDE.md §9). */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPublishedProducts().map((product) => ({
      locale,
      slug: product.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mahsulot/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.description?.[locale],
    alternates: {
      canonical: `/${locale}/mahsulot/${slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/mahsulot/${slug}`]),
      ),
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/mahsulot/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const seedProduct = getProductBySlug(slug);
  if (!seedProduct) notFound();
  const [product] = await withUploadedImages([seedProduct]);

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const category = getCategoryById(product.categoryId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://button.uz";
  const productUrl = `${siteUrl}/${locale}/mahsulot/${slug}`;

  return (
    <article className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumbs — orientation and internal linking for SEO. */}
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/${locale}`} className="hover:text-fg">
              Button
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/${locale}/katalog`} className="hover:text-fg">
              {dict.nav.catalog}
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/${locale}/katalog/${category.slug}`}
                  className="hover:text-fg"
                >
                  {category.name[typedLocale]}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      {/*
        On a phone this stacks: photo, then name, then price and the buy
        controls — so price and sizes sit as close to the fold as possible
        (CLAUDE.md §9).
      */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <ProductImage
            src={product.images[0]?.url}
            alt={product.name[typedLocale]}
            pendingLabel={dict.product.photoPending}
            categorySlug={product.categorySlug}
            priority
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-fg sm:text-3xl">
              {product.name[typedLocale]}
            </h1>
            <p className="mt-1.5 text-xs text-fg-muted">{product.sku}</p>
          </div>

          <ProductOrderPanel
            product={product}
            stores={stores}
            locale={typedLocale}
            productUrl={productUrl}
            t={{
              soum: dict.product.soum,
              sizes: dict.product.sizes,
              colors: dict.product.colors,
              availability: dict.product.availability,
              inStock: dict.product.inStock,
              outOfStock: dict.product.outOfStock,
              orderTelegram: dict.product.orderTelegram,
              orderCall: dict.product.orderCall,
            }}
          />

          {product.description ? (
            <p className="text-sm leading-relaxed text-fg-muted">
              {product.description[typedLocale]}
            </p>
          ) : null}

          {/* Origin is stated openly — Button doesn't hide it, so neither do we,
              and Turkish origin is a selling point here (CLAUDE.md §1). */}
          <dl className="grid gap-2 border-t border-border pt-4 text-sm">
            {product.material ? (
              <div className="flex gap-2">
                <dt className="text-fg-muted">{dict.product.material}:</dt>
                <dd className="text-fg">{product.material[typedLocale]}</dd>
              </div>
            ) : null}
            {product.origin ? (
              <div className="flex gap-2">
                <dt className="text-fg-muted">{dict.product.madeIn}:</dt>
                <dd className="text-fg">{product.origin[typedLocale]}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </article>
  );
}

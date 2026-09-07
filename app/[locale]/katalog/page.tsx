import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categories, searchProducts } from "@/lib/mock-data";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/katalog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.catalog.title,
    alternates: {
      canonical: `/${locale}/katalog`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/katalog`])),
    },
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/katalog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // searchParams is async in Next 16 (CLAUDE.md §5).
  const { q, sale } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  const saleOnly = sale === "1";

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const results = searchProducts({ query, saleOnly });

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
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          {query
            ? `${dict.catalog.searchedFor}: “${query}”`
            : saleOnly
              ? dict.catalog.sale
              : dict.catalog.title}
        </h1>
        <p className="tabular text-sm text-fg-muted">
          {results.length} {dict.catalog.count}
        </p>
      </div>

      {/* Category filter — real links, so every filtered view is a shareable,
          indexable URL rather than client-side state. */}
      <nav aria-label={dict.sections.categories} className="mt-5">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={`/${locale}/katalog`}
              aria-current={!query ? "true" : undefined}
              className="rounded-full bg-fg px-4 py-2 text-[13px] font-medium text-bg transition hover:opacity-90"
            >
              {dict.catalog.all}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/${locale}/katalog/${category.slug}`}
                className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-fg transition hover:border-fg hover:bg-surface"
              >
                {category.name[typedLocale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
          {results.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={typedLocale}
              t={cardStrings}
              priority={i < 4}
            />
          ))}
        </div>
      ) : (
        /* Zero-result searches are the best signal of what Button should
           import next — they are logged, not just shown (CLAUDE.md §21.4). */
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-base font-medium text-fg">
            {dict.catalog.noResults}
          </p>
          <p className="max-w-sm text-sm text-fg-muted">
            {dict.catalog.noResultsHint}
          </p>
          <Link
            href={`/${locale}/katalog`}
            className="mt-2 rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
          >
            {dict.catalog.all}
          </Link>
        </div>
      )}
    </div>
  );
}

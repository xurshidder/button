import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCategories, getCategoryBySlug, searchProducts } from "@/lib/services/catalog";

/** Every category in every locale is prerendered — these are the SEO pages. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category: category.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/katalog/[category]">): Promise<Metadata> {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) notFound();

  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const name = category.name[locale as Locale];
  return {
    title: name,
    alternates: {
      canonical: `/${locale}/katalog/${slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/katalog/${slug}`]),
      ),
    },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/katalog/[category]">) {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) notFound();

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  const [results, categories] = await Promise.all([
    searchProducts({ categorySlug: slug }),
    getCategories(),
  ]);

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
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={`/${locale}`} className="hover:text-fg">
              Button
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/${locale}/katalog`} className="hover:text-fg">
              {dict.catalog.title}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          {category.name[typedLocale]}
        </h1>
        <p className="tabular text-sm text-fg-muted">
          {results.length} {dict.catalog.count}
        </p>
      </div>

      <nav aria-label={dict.sections.categories} className="mt-5">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={`/${locale}/katalog`}
              className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-fg transition hover:border-fg hover:bg-surface"
            >
              {dict.catalog.all}
            </Link>
          </li>
          {categories.map((c) => {
            const isActive = c.slug === slug;
            return (
              <li key={c.id}>
                <Link
                  href={`/${locale}/katalog/${c.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-fg text-bg"
                      : "border border-border text-fg hover:border-fg hover:bg-surface"
                  }`}
                >
                  {c.name[typedLocale]}
                </Link>
              </li>
            );
          })}
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
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-base font-medium text-fg">
            {dict.catalog.noResults}
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

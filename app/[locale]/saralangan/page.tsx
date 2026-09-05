import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublishedProducts } from "@/lib/mock-data";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/saralangan">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.wishlist.title,
    // Saved items are per-browser and have no shared content to index.
    robots: { index: false, follow: true },
  };
}

export default async function WishlistPage({
  params,
}: PageProps<"/[locale]/saralangan">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {dict.wishlist.title}
      </h1>

      <div className="mt-6">
        <WishlistGrid
          products={getPublishedProducts()}
          locale={locale as Locale}
          catalogHref={`/${locale}/katalog`}
          t={{
            empty: dict.wishlist.empty,
            emptyCta: dict.wishlist.emptyCta,
            soum: dict.product.soum,
            inStock: dict.product.inStock,
            lowStock: dict.product.lowStock,
            outOfStock: dict.product.outOfStock,
            photoPending: dict.product.photoPending,
            sale: dict.product.sale,
            wishlistAdd: dict.wishlist.add,
            wishlistRemove: dict.wishlist.remove,
          }}
        />
      </div>
    </div>
  );
}

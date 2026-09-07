import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "../globals.css";

import { Footer } from "@/components/layout/Footer";
import { getBrandAssets } from "@/lib/brand";
import { categories } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import {
  isLocale,
  localeHtmlLang,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

/**
 * Wordmark only — Button's logo is set in a geometric rounded lowercase sans,
 * and Poppins is the closest widely-available match. Loaded at a single weight
 * because it renders exactly one word on the page.
 *
 * TODO: replace the text wordmark with the real logo SVG once the client
 * supplies the vector file, and drop this font.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

/** Pre-render all three locales at build time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return {
    title: {
      default: `Button — ${dict.brand.description}`,
      template: `%s — Button`,
    },
    description: dict.hero.subtitle,
    // hreflang alternates on every page (CLAUDE.md §8).
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [localeHtmlLang[l], `/${l}`]),
      ),
    },
    openGraph: {
      title: `Button — ${dict.brand.description}`,
      description: dict.hero.subtitle,
      locale: localeHtmlLang[locale],
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;
  // Prefer the cropped wordmark in chrome; fall back to the full lock-up.
  const brand = getBrandAssets();
  const logoSrc = brand.wordmark ?? brand.full;

  /*
   * Categories sit inline in the header, Banana Republic style. Six keeps the
   * row readable at typical widths; the rest stay one tap away on the
   * catalogue page. Sale is last and carries the sale colour, as BR does.
   */
  const navItems = [
    ...categories.slice(0, 6).map((category) => ({
      href: `/${locale}/katalog/${category.slug}`,
      label: category.name[typedLocale],
    })),
    { href: `/${locale}/katalog?sale=1`, label: dict.nav.sale, isSale: true },
  ];

  return (
    <html
      lang={localeHtmlLang[typedLocale]}
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header
          locale={typedLocale}
          logoSrc={logoSrc}
          nav={navItems}
          t={{
            wishlist: dict.nav.wishlist,
            account: dict.nav.account,
            search: dict.nav.search,
            searchPlaceholder: dict.nav.searchPlaceholder,
          }}
        />

        <main className="flex-1">{children}</main>

        <Footer
          locale={typedLocale}
          logoSrc={logoSrc}
          t={{
            tagline: dict.brand.tagline,
            followUs: dict.footer.followUs,
            contactUs: dict.footer.contactUs,
            workingHours: dict.footer.workingHours,
            everyDay: dict.stores.everyDay,
            rights: dict.footer.rights,
            stores: dict.nav.stores,
            catalog: dict.nav.catalog,
            about: dict.nav.about,
          }}
        />
      </body>
    </html>
  );
}

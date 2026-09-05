import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../globals.css";

import { Footer } from "@/components/layout/Footer";
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
 * Inter, not the scaffold's Geist: we need a Cyrillic subset for the Russian
 * locale, and a high-legibility neutral sans rather than a display face
 * (CLAUDE.md §20 Typography).
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
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

  return (
    <html
      lang={localeHtmlLang[typedLocale]}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header
          locale={typedLocale}
          t={{
            catalog: dict.nav.catalog,
            stores: dict.nav.stores,
            about: dict.nav.about,
            contact: dict.nav.contact,
            tagline: dict.brand.tagline,
          }}
        />

        <main className="flex-1">{children}</main>

        <Footer
          locale={typedLocale}
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

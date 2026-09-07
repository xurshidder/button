import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stores } from "@/lib/mock-data";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/biz-haqimizda">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: {
      canonical: `/${locale}/biz-haqimizda`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/biz-haqimizda`]),
      ),
    },
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/biz-haqimizda">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  /**
   * The three values are Button's own bio line, `Sifat • Uslub • Qulay narx`.
   * Using their words rather than inventing marketing copy keeps the page
   * honest and matches what customers already see on Instagram.
   */
  const values = [
    { title: dict.about.quality, text: dict.about.qualityText },
    { title: dict.about.style, text: dict.about.styleText },
    { title: dict.about.price, text: dict.about.priceText },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.about.title}
      </h1>

      <p className="mt-5 text-lg font-medium leading-snug text-fg sm:text-xl">
        {dict.about.lead}
      </p>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-fg-muted sm:text-base">
        <p>{dict.about.p1}</p>
        <p>{dict.about.p2}</p>
        <p>{dict.about.p3}</p>
      </div>

      <h2 className="mt-12 text-lg font-bold tracking-tight text-fg">
        {dict.about.valuesTitle}
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {values.map((value) => (
          <li key={value.title} className="rounded-2xl bg-surface p-5">
            <h3 className="text-sm font-bold text-brand">{value.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              {value.text}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-8">
        <Link
          href={`/${locale}/katalog`}
          className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
        >
          {dict.hero.ctaPrimary}
        </Link>
        <Link
          href={`/${locale}/dokonlar`}
          className="rounded-full border border-fg px-7 py-3.5 text-sm font-bold text-fg transition hover:bg-fg hover:text-bg"
        >
          {dict.storesPage.title} ({stores.length})
        </Link>
      </div>
    </div>
  );
}

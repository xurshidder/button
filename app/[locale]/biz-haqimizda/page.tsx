import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, locales, type Locale } from "@/lib/i18n/config";
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

/**
 * About page.
 *
 * Kept short and factual. Everything stated here is verifiable — branch count,
 * hours, the tagline Button uses itself. Invented brand history would be the
 * easiest thing in the world to write and the easiest for the client to spot
 * as untrue, so the copy stops where the confirmed facts stop (CLAUDE.md §17).
 */
export default async function AboutPage({
  params,
}: PageProps<"/[locale]/biz-haqimizda">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;

  const facts = [
    { value: String(stores.length), label: dict.nav.stores },
    { value: "10:00 — 23:00", label: dict.footer.workingHours },
    { value: "4.9 ★", label: "Yandex" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.about.title}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-fg">
        {dict.about.lead}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        {dict.brand.tagline}
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden border border-fg bg-fg">
        {facts.map((fact) => (
          <div key={fact.label} className="bg-bg px-4 py-6 text-center">
            <dt className="sr-only">{fact.label}</dt>
            <dd className="tabular text-lg font-bold text-fg sm:text-xl">
              {fact.value}
            </dd>
            <p className="mt-1 text-xs text-fg-muted">{fact.label}</p>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/katalog`}
          className="bg-brand px-7 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
        >
          {dict.hero.ctaCatalog}
        </Link>
        <Link
          href={`/${locale}/dokonlar`}
          className="border border-fg px-7 py-3.5 text-sm font-bold text-fg transition hover:bg-fg hover:text-bg"
        >
          {dict.nav.stores}
        </Link>
      </div>

      <ul className="mt-10 space-y-2 border-t border-border pt-6 text-sm text-fg-muted">
        {stores.map((store) => (
          <li key={store.id}>
            <span className="text-fg">{store.name[typedLocale]}</span> —{" "}
            {store.address[typedLocale]}
          </li>
        ))}
      </ul>
    </div>
  );
}

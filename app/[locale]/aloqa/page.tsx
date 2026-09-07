import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPhone, telHref } from "@/lib/format";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stores } from "@/lib/mock-data";
import {
  BUTTON_INSTAGRAM,
  BUTTON_PHONE,
  BUTTON_TELEGRAM,
} from "@/lib/telegram";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/aloqa">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return {
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: {
      canonical: `/${locale}/aloqa`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/aloqa`])),
    },
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/aloqa">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const typedLocale = locale as Locale;

  /**
   * No contact FORM here, deliberately.
   *
   * A form would need somewhere to send mail, would sit unread, and would
   * collect customer personal data we have decided not to hold (CLAUDE.md
   * §21.3). Button already answers Telegram and the phone all day — the right
   * design points at the channels that actually work.
   */
  const channels = [
    {
      label: "Telegram",
      value: `@${BUTTON_TELEGRAM}`,
      href: `https://t.me/${BUTTON_TELEGRAM}`,
      external: true,
      primary: true,
    },
    {
      label: dict.contact.callUs,
      value: formatPhone(BUTTON_PHONE),
      href: telHref(BUTTON_PHONE),
      external: false,
      primary: false,
    },
    {
      label: "Instagram",
      value: `@${BUTTON_INSTAGRAM}`,
      href: `https://instagram.com/${BUTTON_INSTAGRAM}`,
      external: true,
      primary: false,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {dict.contact.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
        {dict.contact.subtitle}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {channels.map((channel) => (
          <li key={channel.label}>
            <a
              href={channel.href}
              {...(channel.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`flex h-full flex-col gap-1 rounded-2xl p-5 transition ${
                channel.primary
                  ? "bg-brand text-brand-ink hover:bg-brand-hover"
                  : "border border-border text-fg hover:border-fg"
              }`}
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  channel.primary ? "text-brand-ink/70" : "text-fg-muted"
                }`}
              >
                {channel.label}
              </span>
              <span className="tabular text-sm font-bold">{channel.value}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl bg-surface p-6">
        <p className="text-sm leading-relaxed text-fg-muted">
          {dict.contact.orderNote}
        </p>
      </div>

      <h2 className="mt-12 text-lg font-bold tracking-tight text-fg">
        {dict.contact.visitUs}
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3"
          >
            <div>
              <p className="text-sm font-bold text-fg">
                {store.name[typedLocale]}
              </p>
              <p className="mt-0.5 text-[13px] text-fg-muted">
                {store.address[typedLocale]}
              </p>
            </div>
            <p className="tabular text-xs text-fg-muted">
              {store.hoursOpen} — {store.hoursClose}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href={`/${locale}/dokonlar`}
        className="mt-6 inline-flex rounded-full border border-fg px-7 py-3 text-sm font-bold text-fg transition hover:bg-fg hover:text-bg"
      >
        {dict.storesPage.title}
      </Link>
    </div>
  );
}

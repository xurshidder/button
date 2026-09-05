import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPhone, telHref } from "@/lib/format";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BUTTON_PHONE, BUTTON_TELEGRAM } from "@/lib/telegram";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/hisobim">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return { title: dict.account.title, robots: { index: false, follow: true } };
}

/**
 * Account page.
 *
 * v1 has NO customer accounts by design (CLAUDE.md §3): no sign-up, no
 * passwords, no stored customer PII. Rather than ship a dead icon in the
 * header, this page is honest about that and routes the visitor to the two
 * channels that actually work today — Telegram and the phone.
 *
 * Whether to build real accounts is a scope decision, not a technical one; it
 * pulls in auth, sessions, order history and personal data handling.
 */
export default async function AccountPage({
  params,
}: PageProps<"/[locale]/hisobim">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-surface px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7 text-brand"
            aria-hidden="true"
          >
            <circle cx="12" cy="8.5" r="3.75" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
          </svg>
        </span>

        <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          {dict.account.soon}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-fg-muted">
          {dict.account.description}
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <a
            href={`https://t.me/${BUTTON_TELEGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
          >
            Telegram
          </a>
          <a
            href={telHref(BUTTON_PHONE)}
            className="tabular rounded-full border border-fg px-7 py-3.5 text-sm font-bold text-fg transition hover:bg-fg hover:text-bg"
          >
            {formatPhone(BUTTON_PHONE)}
          </a>
        </div>

        <Link
          href={`/${locale}/saralangan`}
          className="mt-2 text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {dict.wishlist.title} →
        </Link>
      </div>
    </div>
  );
}

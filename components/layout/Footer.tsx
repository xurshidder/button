import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { formatPhone, telHref } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { stores } from "@/lib/mock-data";
import {
  BUTTON_INSTAGRAM,
  BUTTON_PHONE,
  BUTTON_TELEGRAM,
} from "@/lib/telegram";

interface FooterProps {
  locale: Locale;
  logoSrc?: string;
  t: {
    tagline: string;
    followUs: string;
    contactUs: string;
    workingHours: string;
    everyDay: string;
    rights: string;
    stores: string;
    catalog: string;
    about: string;
  };
}

export function Footer({ locale, logoSrc, t }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo src={logoSrc} height={28} />
          <p className="mt-1 text-sm text-fg-muted">{t.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-fg">{t.contactUs}</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>
              <a
                href={telHref(BUTTON_PHONE)}
                className="tabular transition hover:text-fg"
              >
                {formatPhone(BUTTON_PHONE)}
              </a>
            </li>
            <li>
              <Link
                href={`/${locale}/dokonlar`}
                className="transition hover:text-fg"
              >
                {t.stores}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/katalog`}
                className="transition hover:text-fg"
              >
                {t.catalog}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-fg">{t.workingHours}</h2>
          <p className="tabular mt-3 text-sm text-fg-muted">
            {t.everyDay} 10:00 — 23:00
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            {stores.length} × {t.stores}, {stores[0]?.city}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-fg">{t.followUs}</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>
              <a
                href={`https://instagram.com/${BUTTON_INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-fg"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={`https://t.me/${BUTTON_TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-fg"
              >
                Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-fg-muted">
          © {new Date().getFullYear()} Button. {t.rights}.
        </p>
      </div>
    </footer>
  );
}

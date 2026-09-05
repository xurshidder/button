/**
 * Locale configuration. Uzbek is the default and the primary language of the
 * product — see CLAUDE.md §8.
 */

export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

/** Native names, for the locale switcher. Each shown in its own language. */
export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

/** Short labels for the compact mobile switcher. */
export const localeShortNames: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

/** BCP-47 tags for the `lang` attribute and hreflang. */
export const localeHtmlLang: Record<Locale, string> = {
  uz: "uz-Latn-UZ",
  ru: "ru-UZ",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

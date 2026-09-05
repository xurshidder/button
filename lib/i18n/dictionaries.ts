import "server-only";

import { notFound } from "next/navigation";

import type uzMessages from "@/messages/uz.json";
import { isLocale, type Locale } from "./config";

/**
 * The Uzbek dictionary is the canonical shape — uz is the default locale and
 * the only one whose keys are required (CLAUDE.md §8). Typing `Dictionary` from
 * it means a missing key in ru.json or en.json is a compile error, not a
 * blank string discovered in production.
 */
export type Dictionary = typeof uzMessages;

/**
 * Dictionaries are lazily imported and resolved on the server only, so
 * translation files cost ZERO client bundle bytes. This is the whole reason we
 * use the native App Router approach instead of an i18n library —
 * see CLAUDE.md §8 and the JS budget in §9.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  uz: () => import("@/messages/uz.json").then((m) => m.default),
  ru: () => import("@/messages/ru.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
};

/**
 * Loads the dictionary for a locale. An unknown locale 404s rather than
 * throwing a runtime error.
 */
export async function getDictionary(locale: string): Promise<Dictionary> {
  if (!isLocale(locale)) notFound();
  return dictionaries[locale]();
}

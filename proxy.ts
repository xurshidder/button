import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n/config";

/**
 * In Next.js 16 this file replaces `middleware.ts` and the exported function is
 * `proxy` (CLAUDE.md §5). It redirects unprefixed paths to a locale-prefixed
 * one, choosing from the visitor's Accept-Language header.
 */

/**
 * Picks the best supported locale from an Accept-Language header.
 *
 * Deliberately hand-rolled rather than pulling in Negotiator +
 * intl-localematcher: we support exactly three locales, so a full RFC-4647
 * matcher is dependency weight we would pay for on every request.
 */
function resolveLocale(header: string | null): string {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return {
        // Match on the primary subtag: "ru-RU" -> "ru".
        tag: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    if ((locales as readonly string[]).includes(tag)) return tag;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, the API, and static assets.
     * `/admin` is excluded on purpose — it is not locale-prefixed (CLAUDE.md §13).
     */
    "/((?!_next|api|admin|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};

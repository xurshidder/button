import "server-only";

/**
 * The site's own absolute URL.
 *
 * Used to build the Telegram order message, which carries a link back to the
 * product. Getting this wrong is worse than it sounds: the customer sends
 * Button a link, and if it points somewhere dead the order still arrives but
 * nobody can see what was ordered.
 *
 * Resolution order, most to least specific:
 *
 * 1. `SITE_URL` — set explicitly, and the only one that can name a custom
 *    domain like button.uz.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — injected automatically by Vercel with
 *    the project's production hostname. This is the safety net: a deploy that
 *    forgets step 1 still produces working links rather than dead ones.
 * 3. localhost — development only.
 *
 * There is deliberately NO hardcoded button.uz fallback any more. It used to
 * be there and it silently produced links to a domain serving an empty page,
 * which is exactly the failure this ordering removes.
 */
export function getSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

import "server-only";

import { getHeroImage as getLocalHeroImage } from "@/lib/brand";
import { prisma } from "@/lib/db";

/**
 * Media resolution.
 *
 * Uploaded imagery lives in Supabase Storage and is recorded in Postgres;
 * files committed under `public/` are the fallback. Uploads win, because they
 * are what staff can change without a developer (CLAUDE.md §13).
 *
 * Product photography is no longer resolved here — it comes back joined with
 * the product in lib/services/catalog.ts, which avoids a second query per page
 * and keeps the catalogue path to a single round trip (CLAUDE.md §21.2). Only
 * the hero, which belongs to no product, still needs its own lookup.
 */
export async function getHeroImageUrl(): Promise<string | undefined> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "heroImage" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // A missing or unreachable database must not blank the homepage — fall
    // through to whatever is committed on disk.
  }
  return getLocalHeroImage();
}

import "server-only";

import {
  getCampaignImages as getLocalCampaignImages,
  getHeroImage as getLocalHeroImage,
} from "@/lib/brand";
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

/** How many cells the campaign mosaic has: one large panel plus four details. */
export const CAMPAIGN_SLOTS = 5;

export const campaignSettingKey = (slot: number) => `campaign:${slot}`;

/**
 * Campaign mosaic imagery, in slot order.
 *
 * Uploaded slots win; anything still empty falls back to a file committed
 * under `public/campaign/`. Returned sparse — index 0 is the large panel, and
 * a gap stays a gap rather than shifting later photos forward, because the
 * slots are positional and sliding them would rearrange the layout every time
 * one image is replaced.
 */
export async function getCampaignImageUrls(): Promise<(string | undefined)[]> {
  const slots: (string | undefined)[] = Array.from(
    { length: CAMPAIGN_SLOTS },
    () => undefined,
  );

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: Array.from({ length: CAMPAIGN_SLOTS }, (_, i) =>
            campaignSettingKey(i + 1),
          ),
        },
      },
    });
    for (const row of rows) {
      const slot = Number(row.key.split(":")[1]);
      if (slot >= 1 && slot <= CAMPAIGN_SLOTS) slots[slot - 1] = row.value;
    }
  } catch {
    /* Fall through to files on disk. */
  }

  const local = getLocalCampaignImages();
  return slots.map((url, i) => url ?? local[i]);
}
